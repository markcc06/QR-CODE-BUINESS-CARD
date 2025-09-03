export type ParsedFields = {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
};

const RE = {
  email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  phone: /(?:\+?\d{1,3}[-\s.]*)?(?:\(?\d{2,4}\)?[-\s.]*)?\d{3,4}[-\s.]?\d{4}\b|(?:\+?86[-\s.]*)?1[3-9]\d{9}\b/gi,
  // 粗匹配 URL（后面会用打分过滤）
  url: /\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}\b(?:\/\S*)?/gi,
  // Location: "City, ST" | "City, State"
  location: /\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*),\s*([A-Z]{2}|[A-Z][a-zA-Z]+)\b/,
};

// 统一一些 OCR 常见的全角/破折号/中点等符号，便于后续解析
function normalizeText(input: string): string {
  return input
    // 全角转半角（只做常见标点）
    .replace(/[：]/g, ":")
    .replace(/[，]/g, ",")
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    // 破折号 / 中点 / 项目符号归一
    .replace(/[\u2013\u2014\u2015–—]/g, "-")
    .replace(/[•·]/g, "•")
    // 非断行空白归一
    .replace(/\u00A0/g, " ");
}

// 兼容中文姓名（2~4 个汉字，允许中间包含 · ）
const RE_CN_NAME = /^[\u4e00-\u9fa5·]{2,4}$/;
// 兼容中文地址的一个粗略匹配（例如：上海市 浦东新区 / 北京市 海淀区）
const RE_CN_LOCATION = /([\u4e00-\u9fa5]{2,8}(?:市|州|区|县|城|省|自治区|特别行政区))[\s,，]*([\u4e00-\u9fa5]{2,8}(?:市|州|区|县))?/;

const TITLE_HINTS = [
  "CEO","CTO","COO","CFO","CMO","Founder","Co-founder","Owner","Partner",
  "President","VP","Vice President","Director","Manager","Lead","Head",
  "Engineer","Developer","Designer","Product Manager","PM","Marketing","Sales",
  "Consultant","Analyst","Specialist","Coordinator","Principal","Staff"
];

const COMPANY_HINTS = [
  "Inc","Incorporated","LLC","Ltd","Limited","Co.","Company","Corp","Corporation",
  "Group","Studio","Labs","Lab","Technologies","Technology","Systems","Solutions"
];

const COMMON_TLDS = ["com","co","io","net","org","dev","app","ai","us","uk","info","biz"];

function cleanLine(s: string) {
  return s.replace(/\s+/g, " ").replace(/[•|·]+/g, " ").trim();
}
function cap(word: string) {
  return word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : "";
}
function guessNameFromEmail(email?: string): { firstName?: string; lastName?: string } {
  if (!email) return {};
  const user = email.split("@")[0].replace(/[^a-z. _-]/gi, " ");
  const parts = user.split(/[._-]+/).filter(Boolean).slice(0, 3);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstName: cap(parts[0]) };
  return { firstName: cap(parts[0]), lastName: cap(parts.slice(1).join(" ")) };
}

function splitTitleCompany(line: string): { title?: string; company?: string } | null {
  // 支持多种分隔符：— | - | • | · | at | @ | –
  const sepRegex = /\s+(?:—|-|•|·|at|@|–)\s+/i;
  if (!sepRegex.test(line)) return null;
  const [left, right] = line.split(sepRegex).map((s) => s.trim());
  if (!left || !right) return null;

  const leftLooksLikeTitle =
    TITLE_HINTS.some((k) => left.toLowerCase().includes(k.toLowerCase())) || left.split(" ").length <= 6;
  const rightLooksLikeCompany =
    COMPANY_HINTS.some((k) => new RegExp(`\\b${k}\\b`, "i").test(right)) || right.split(" ").length <= 6;

  if (leftLooksLikeTitle && rightLooksLikeCompany) {
    return { title: left, company: right };
  }
  // 次优：只要左像 title，就也拆
  if (leftLooksLikeTitle) {
    return { title: left, company: right };
  }
  return null;
}

function scoreUrl(u: string, raw: string, email?: string): number {
  let s = 0;
  const lower = u.toLowerCase();
  const mailDomain = email?.split("@")[1]?.toLowerCase();
  if (mailDomain && lower.includes(mailDomain)) s += 4;
  const hasProto = lower.startsWith("http://") || lower.startsWith("https://");
  if (hasProto) s += 2;

  // 提取 TLD
  const m = lower.match(/\.([a-z]{2,})\b/);
  const tld = m?.[1];
  if (tld && COMMON_TLDS.includes(tld)) s += 3;

  // 太短/像用户名的降权
  if (u.length < 8) s -= 2;

  // 如果就是邮箱前缀（去掉 @ 后）或与其极度相似，降权
  const user = email?.split("@")[0] || "";
  if (user && (u.includes(user) || user.includes(u))) s -= 3;

  // 来自带 label 的行（Website:）后面会再加分，这里先返回基础分
  return s;
}

export function extractFields(raw: string): ParsedFields {
  const text = normalizeText(raw).replace(/\r/g, "\n");
  const lines = text.split("\n").map(cleanLine).filter(Boolean);

  const out: ParsedFields = {};

  // 1) 锚点：Email / Phone
  const email = text.match(RE.email)?.[0];
  if (email) out.email = email;

  const phones = [...text.matchAll(RE.phone)].map((m) => m[0]).map((s) => s.trim());
  if (phones.length) {
    const uniq = Array.from(new Set(phones));
    out.phone = uniq.sort((a, b) => b.length - a.length)[0];
  }

  // 2) Website（候选打分，避免把 "alex.johnson" 误判为网址）
  const urlCandidates: { url: string; score: number }[] = [];
  for (const m of text.matchAll(RE.url) as any) {
    const u = (m[0] as string).replace(/[),.;]+$/, "");
    if (u.includes("@")) continue; // 保险：排除邮件样式
    urlCandidates.push({ url: u, score: scoreUrl(u, text, out.email) });
  }
  // 来自 label 的行加分
  for (const ln of lines) {
    if (/^(website|web|site|网址)[:\s]/i.test(ln)) {
      const u = ln.replace(/^(website|web|site|网址)[:\s]*/i, "").trim();
      if (u) urlCandidates.push({ url: u, score: scoreUrl(u, text, out.email) + 2 });
    }
  }
  if (urlCandidates.length) {
    urlCandidates.sort((a, b) => b.score - a.score);
    let best = urlCandidates[0].url;
    if (!/^https?:\/\//i.test(best)) best = "https://" + best;
    out.website = best;
  }

  // 3) Location
  // 3) Location
  const locLine =
    lines.find((l) => /^(location|address|addr|地址|地区|城市)[:\s]/i.test(l)) ||
    lines.find((l) => RE.location.test(l)) ||
    lines.find((l) => RE_CN_LOCATION.test(l));

  if (locLine) {
    const m = locLine.match(RE.location);
    if (m) {
      out.location = `${m[1]}, ${m[2]}`;
    } else {
      const cn = locLine.match(RE_CN_LOCATION);
      if (cn) {
        // 组合中文地址（去掉逗号等）
        out.location = [cn[1], cn[2]].filter(Boolean).join(" ");
      }
    }
  }

  // 4) Title & Company（优先拆分行）
  let titleFromSplit: string | undefined;
  let companyFromSplit: string | undefined;
  for (const ln of lines.slice(0, 8)) {
    const sp = splitTitleCompany(ln);
    if (sp) {
      titleFromSplit = sp.title;
      companyFromSplit = sp.company;
      break;
    }
  }

  // 5) Title 备选：含典型头衔词的短行
  const titleLine =
    titleFromSplit ||
    lines.find(
      (l) =>
        l.length <= 60 &&
        TITLE_HINTS.some((k) => l.toLowerCase().includes(k.toLowerCase())) &&
        !/^(email|phone|website|web|site|location|address|addr|邮箱|电话|手机|网址|地址)/i.test(l)
    );
  if (titleLine) out.jobTitle = titleLine;

  // 6) Company 备选：含公司后缀词/关键词的行；否则在上方几行里找
  const companyLine =
    companyFromSplit ||
    lines.find(
      (l) =>
        COMPANY_HINTS.some((k) => new RegExp(`\\b${k}\\b`, "i").test(l)) &&
        !/^(email|phone|website|web|site|location|address|addr|邮箱|电话|手机|网址|地址)/i.test(l)
    ) ||
    lines.slice(0, 6).find((l) => /Labs|Studio|Group|Company|Inc|LLC|Ltd/i.test(l) && !/^(email|phone|website|web|site|location|address|addr|邮箱|电话|手机|网址|地址)/i.test(l));

  if (companyLine) out.company = companyLine;

  // 7) 姓名：优先前 3~4 行的“像姓名”的短行；兜底用邮箱拆
  const nameCand = lines
    .slice(0, 4)
    .filter((l) => !/:/.test(l))
    .filter((l) => /^[A-Za-z][A-Za-z\s.'-]{1,30}$/.test(l))
    .sort((a, b) => a.length - b.length)[0];

  if (nameCand) {
    const parts = nameCand.split(/\s+/);
    if (parts.length >= 2) {
      out.firstName = cap(parts[0]);
      out.lastName = cap(parts.slice(1).join(" "));
    } else {
      out.firstName = cap(parts[0]);
    }
  }
  if (!out.firstName && !out.lastName) {
    const cnName = lines.slice(0, 4).find((l) => RE_CN_NAME.test(l));
    if (cnName) {
      const pure = cnName.replace(/·/g, "");
      // 简单按姓氏=第1字，其余为名
      if (pure.length >= 2) {
        out.lastName = pure.slice(0, 1);
        out.firstName = pure.slice(1);
      }
    }
  }
  if (!out.firstName || !out.lastName) {
    const g = guessNameFromEmail(out.email);
    if (!out.firstName && g.firstName) out.firstName = g.firstName;
    if (!out.lastName && g.lastName) out.lastName = g.lastName;
  }

  // 8) Label 映射的兜底
  for (const ln of lines.slice(0, 12)) {
    if (!out.jobTitle && /^(title|职位|岗位)[:\s]/i.test(ln)) out.jobTitle = ln.replace(/^(title|职位|岗位)[:\s]*/i, "");
    if (!out.company && /^(company|公司|单位)[:\s]/i.test(ln)) out.company = ln.replace(/^(company|公司|单位)[:\s]*/i, "");
    if (!out.website && /^(website|web|site|网址)[:\s]/i.test(ln)) {
      let u = ln.replace(/^(website|web|site|网址)[:\s]*/i, "").trim();
      if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
      out.website = u;
    }
    if (!out.phone && /^(phone|tel|mobile|电话|手机)[:\s]/i.test(ln)) out.phone = ln.replace(/^(phone|tel|mobile|电话|手机)[:\s]*/i, "");
    if (!out.email && /^(email|mail|邮箱)[:\s]/i.test(ln)) out.email = ln.replace(/^(email|mail|邮箱)[:\s]*/i, "");
    if (!out.location && /^(location|address|addr|地址|地区|城市)[:\s]/i.test(ln)) out.location = ln.replace(/^(location|address|addr|地址|地区|城市)[:\s]*/i, "");
  }

  if (out.website) {
    out.website = out.website.replace(/[),.;]+$/, "");
  }

  // 9) 去重与清洗（避免 jobTitle/Company 相同）
  if (out.jobTitle && out.company && out.jobTitle === out.company) {
    // 尝试再拆一次
    const sp = splitTitleCompany(out.jobTitle);
    if (sp?.title) out.jobTitle = sp.title;
    if (sp?.company) out.company = sp.company;
    // 仍相同则保留 jobTitle，清空 company
    if (out.jobTitle === out.company) {
      out.company = undefined;
    }
  }

  // 10) 最终清理
  for (const k of Object.keys(out) as (keyof ParsedFields)[]) {
    if (typeof out[k] === "string") {
      out[k] = (out[k] as string).trim();
    }
  }

  return out;
}

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
  phone: /(?:\+?\d{1,3}[-\s.]*)?(?:\(?\d{2,4}\)?[-\s.]*)?\d{3,4}[-\s.]?\d{4}\b/g,
  // 粗匹配 URL（后面会用打分过滤）
  url: /\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}\b(?:\/\S*)?/gi,
  // Location: "City, ST" | "City, State"
  location: /\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*),\s*([A-Z]{2}|[A-Z][a-zA-Z]+)\b/,
};

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
  // 支持多种分隔符：— | - | • | · | at
  const sepRegex = /\s+(?:—|-|•|·|at)\s+/i;
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
  const text = raw.replace(/\r/g, "\n");
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
    if (/^website[:\s]/i.test(ln)) {
      const u = ln.replace(/^website[:\s]*/i, "").trim();
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
  const locLine = lines.find((l) => /^location[:\s]/i.test(l)) || lines.find((l) => RE.location.test(l));
  if (locLine) {
    const m = locLine.match(RE.location);
    if (m) out.location = `${m[1]}, ${m[2]}`;
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
        !/^email|phone|website|location/i.test(l)
    );
  if (titleLine) out.jobTitle = titleLine;

  // 6) Company 备选：含公司后缀词/关键词的行；否则在上方几行里找
  const companyLine =
    companyFromSplit ||
    lines.find(
      (l) =>
        COMPANY_HINTS.some((k) => new RegExp(`\\b${k}\\b`, "i").test(l)) &&
        !/^email|phone|website|location/i.test(l)
    ) ||
    lines.slice(0, 6).find((l) => /Labs|Studio|Group|Company|Inc|LLC|Ltd/i.test(l));

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
  if (!out.firstName || !out.lastName) {
    const g = guessNameFromEmail(out.email);
    if (!out.firstName && g.firstName) out.firstName = g.firstName;
    if (!out.lastName && g.lastName) out.lastName = g.lastName;
  }

  // 8) Label 映射的兜底
  for (const ln of lines.slice(0, 12)) {
    if (!out.jobTitle && /^title[:\s]/i.test(ln)) out.jobTitle = ln.replace(/^title[:\s]*/i, "");
    if (!out.company && /^company[:\s]/i.test(ln)) out.company = ln.replace(/^company[:\s]*/i, "");
    if (!out.website && /^website[:\s]/i.test(ln)) {
      let u = ln.replace(/^website[:\s]*/i, "").trim();
      if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
      out.website = u;
    }
    if (!out.phone && /^phone[:\s]/i.test(ln)) out.phone = ln.replace(/^phone[:\s]*/i, "");
    if (!out.email && /^email[:\s]/i.test(ln)) out.email = ln.replace(/^email[:\s]*/i, "");
    if (!out.location && /^location[:\s]/i.test(ln)) out.location = ln.replace(/^location[:\s]*/i, "");
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

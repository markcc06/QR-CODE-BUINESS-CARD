export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO date
  content: string; // markdown
};

export const posts: Post[] = [
  {
    slug: 'never-expiring-digital-business-card',
    title: 'Never-Expiring Digital Business Card (with QR): A Simple Guide',
    excerpt:
      'Stop reprinting paper cards. Create a digital business card once, share via QR, and update anytime without breaking old codes.',
    date: '2025-09-07',
    content: `## What “never-expiring” really means

You create one link (and QR code) that always points to your latest business card data. Change your role or phone? Update the card content — the link and QR stay the same. No reprints, no broken links, no awkward “sorry this is outdated”.

---

## Pain points a perpetual card solves

- **Outdated info** — One edit updates everything you’ve shared before.
- **Reprint costs** — No more paper batches when you change roles.
- **Lost contacts** — People can scan and save your vCard in one tap.
- **Cross‑channel sharing** — QR for in-person; short link for email/DM.

---

## How it works on CardSpark

1. **Fill your details** — name, title, phone, email, socials, brand color.
2. **Generate** — we create a shareable link, QR code, and downloadable vCard.
3. **Share anywhere** — print the QR, add the link to your signature or socials.
4. **Update anytime** — your old QR still opens the newest version.

> Tip: Pin the QR to your badge or laptop. People scan; you never waste a card.

---

## Real‑world scenarios

- **Events & meetups** — You network faster. No app installs, no awkward typing.
- **Freelancers & creators** — One profile for all gigs; update niches as you pivot.
- **Startups** — Team changing weekly? Centralize card updates without reprints.

---

## Privacy & control

- No camera access needed to share — others scan your QR.
- You control updates — edit or hide fields anytime.
- Export vCard — recipients can save you offline in one tap.

---

## Get started in 30 seconds

- Open CardSpark.
- Fill your info → Generate → download QR & vCard.
- Put the QR on your badge, website, or email signature.

**One link. One QR. Always up‑to‑date.**`
  },
  {
    slug: 'why-my-qr-business-card-never-expires',
    title: 'Why My QR Business Card Never Expires',
    excerpt:
      'Discover how a QR code digital business card stays current forever—no reprints, no broken links. Cost‑effective, eco‑friendly, and effortless to share.',
    date: '2025-09-06',
    content: `> **Intro:** A never‑expiring **QR code digital business card** means one link and one QR that always open your latest details—no reprints, no broken links.

---

## 1) The Awkward Reality of Paper Cards

Most professionals still lose time (and money) reprinting paper cards after a title or phone change. A paper card starts aging the second it’s printed.

- Waste and reprints every update.
- Easy to lose; low save‑rate.

In a world that values sustainability, it’s fair to ask: do we still need paper cards?

---

## 2) The Shift Toward Digital

The trend is clear: **digital business cards** and **QR contact cards** are becoming the norm.

- Small businesses and freelancers are fast adopters.
- Cross‑border teams rely on QR links that work everywhere.

Digital isn’t a gimmick—it’s the default.

---

## 3) Pain Point: Updating Info Is a Nightmare

With paper, a new email or title makes old cards obsolete. A **QR business card** fixes that:

- The **QR code never changes**.
- You update the content behind the link; scans always show the latest version.

That’s why it *never expires*.

---

## 4) Hidden Costs & Waste (and how QR flips it)

Paper seems cheap, but the true cost adds up:

- Design, printing, and shipping fees.
- Entire batches tossed after small changes.
- Constant paper use—hardly eco‑friendly.

**Digital wins:**

- **One card for life**—no reprints.
- **No extra cost** to update.
- **Eco‑friendly**—less paper waste.

---

## 5) Sharing Should Be Effortless

Old tools forced the recipient to download apps or create accounts. Modern **QR code business cards** are different:

- Create and share in the browser.
- No app installs required.
- One quick scan saves your **vCard (.vcf)** to Contacts.

---

## 6) Real‑World Scenarios

Where a never‑expiring card shines:

1. **Trade shows** — show one QR; everyone saves you instantly.
2. **Remote networking** — place your card link in email signatures, LinkedIn, and bios.
3. **Team rollouts** — generate unified cards for staff; manage updates centrally.

---

## 7) Why My Card Never Expires (on CardSpark)

- **Create once** — fill in name, title, phone, email, socials, brand.
- **Generate** — we give you a shareable link, **QR code**, and downloadable **vCard**.
- **Share anywhere** — print the QR or paste the link.
- **Update anytime** — the same QR always opens the newest details.

> **Tip:** Pin your QR to a badge or laptop. People scan; you never waste a card.

---

## Key Takeaway

A **QR code digital business card** stays **always up‑to‑date**, is **cost‑effective**, **eco‑friendly**, and **easy to share**. One link. One QR. **Never expiring.**`
  },
];

export function getPosts(): Post[] {
  return [...posts].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getPostBySlug(slug: string): Post | null {
  return posts.find((p) => p.slug === slug) ?? null;
}

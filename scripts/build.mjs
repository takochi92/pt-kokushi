// サイトを dist/ に組み立てる：ページのコピー、公開URLの差し込み、note の最新記事、sitemap
//   node scripts/build.mjs            … note も取り込む
//   node scripts/build.mjs --no-note  … note を取り込まない（手元確認用）
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, "site.config.json"), "utf8"));
const SITE_URL = (process.env.SITE_URL || CONFIG.siteUrl).replace(/\/$/, "");
const PAGES = ["index.html", "quiz.html", "mypage.html", "about.html", "privacy.html", "404.html"];

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.cpSync(path.join(ROOT, "assets"), path.join(DIST, "assets"), { recursive: true });

const ga = /^G-[A-Z0-9]+$/.test(CONFIG.gaId || "")
  ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${CONFIG.gaId}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${CONFIG.gaId}");</script>\n`
  : "";
for (const p of PAGES) {
  let html = fs.readFileSync(path.join(ROOT, p), "utf8").replaceAll("__SITE_URL__", SITE_URL);
  const url = `${SITE_URL}/${p === "index.html" ? "" : p}`;
  // 404 はどの階層でも表示されるので、読み込み先をサイトの最上位に固定する
  const extra = p === "404.html" ? `<base href="${SITE_URL}/">\n` : `<link rel="canonical" href="${url}">\n<meta property="og:url" content="${url}">\n`;
  html = html.replace("</head>", extra + ga + "</head>");
  fs.writeFileSync(path.join(DIST, p), html);
}

// note の最新記事（RSS）。本文は取り込まず、タイトル・サムネイル・日付・リンクだけ。取れなくてもビルドは続ける
async function noteItems(user) {
  const res = await fetch(`https://note.com/${encodeURIComponent(user)}/rss`, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const unesc = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  const tag = (item, name) => {
    const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
    return m ? m[1].replace(/^<!\[CDATA\[|\]\]>$/g, "").trim() : "";
  };
  const items = [];
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const d = new Date(tag(item, "pubDate"));
    items.push({
      title: unesc(tag(item, "title")),
      link: tag(item, "link"),
      date: isNaN(d) ? "" : `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`,
      thumb: (item.match(/<media:thumbnail[^>]*>([^<]+)<\/media:thumbnail>/) || item.match(/<media:thumbnail[^>]*url="([^"]+)"/) || [])[1] || ""
    });
  }
  return items.filter((it) => /^https:\/\/note\.com\//.test(it.link)).slice(0, 12);
}
const user = String(CONFIG.noteUser || "").trim();
const note = { profile: user ? `https://note.com/${user}` : "", membership: CONFIG.membershipUrl || "", items: [] };
if (user && !process.argv.includes("--no-note")) {
  try { note.items = await noteItems(user); console.log(`note: ${note.items.length} 件`); }
  catch (err) { console.warn(`note の取り込みに失敗（記事なしで続行）: ${err.message}`); }
}
fs.writeFileSync(path.join(DIST, "note.json"), JSON.stringify(note));

const today = new Date().toISOString().slice(0, 10);
const listed = PAGES.filter((p) => !["quiz.html", "404.html"].includes(p));
fs.writeFileSync(path.join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${listed.map((p) => `<url><loc>${SITE_URL}/${p === "index.html" ? "" : p}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
fs.writeFileSync(path.join(DIST, ".nojekyll"), "");
console.log(`完了: ${PAGES.length} ページ → dist/（${SITE_URL}）`);

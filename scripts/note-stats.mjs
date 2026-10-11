// note の公開データ（記事ごとのスキ数・コメント数・価格・公開日）を集めて JSON で出す。
// ログイン不要の範囲だけ（閲覧数・売上は取れない）。note の公式APIではないので、形が変わったら空で続行する。
//   node scripts/note-stats.mjs > note-stats.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, "site.config.json"), "utf8"));
const user = String(CONFIG.noteUser || "").trim();
const out = { user, fetchedAt: new Date().toISOString(), ok: false, articles: [] };

const num = (v) => (typeof v === "number" && isFinite(v) ? v : 0);
try {
  if (!user) throw new Error("noteUser が空");
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`https://note.com/api/v2/creators/${encodeURIComponent(user)}/contents?kind=note&page=${page}`, {
      headers: { "user-agent": "pt-kokushi-stats (+https://takochi92.github.io/pt-kokushi/)" },
      signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const data = json?.data || {};
    const list = Array.isArray(data.contents) ? data.contents : [];
    for (const c of list) {
      out.articles.push({
        title: String(c.name || ""),
        url: String(c.noteUrl || (c.key ? `https://note.com/${user}/n/${c.key}` : "")),
        likes: num(c.likeCount),
        comments: num(c.commentCount),
        price: num(c.price),
        publishedAt: String(c.publishAt || "")
      });
    }
    if (data.isLastPage !== false || !list.length) break;
    await new Promise((r) => setTimeout(r, 1000)); // 間をあけて取りに行く
  }
  out.ok = true;
} catch (err) {
  out.error = err.message;
  console.error(`note の公開データを取得できませんでした（空で続行）: ${err.message}`);
}
out.totals = {
  articles: out.articles.length,
  likes: out.articles.reduce((n, a) => n + a.likes, 0),
  comments: out.articles.reduce((n, a) => n + a.comments, 0),
  paid: out.articles.filter((a) => a.price > 0).length
};
process.stdout.write(JSON.stringify(out, null, 2) + "\n");

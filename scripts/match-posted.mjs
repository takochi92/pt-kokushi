// 生成コンテンツ（note の下書きなど）のうち、note に投稿済みのものを見つける。
//   node scripts/match-posted.mjs contents.json note-stats.json
// contents.json: [{id, kind, title}] / 出力: [{id, title, url, publishedAt}]（投稿済みと判断したものだけ）
import fs from "node:fs";

const [contentsFile, statsFile] = process.argv.slice(2);
const contents = JSON.parse(fs.readFileSync(contentsFile, "utf8"));
const stats = JSON.parse(fs.readFileSync(statsFile, "utf8"));
// 記号・空白・番号付けの違いを無視して比べる（例：「1. 」「｜PT実習生向け」「#理学療法」）
const norm = (s) => String(s || "").normalize("NFKC").toLowerCase()
  .replace(/#[^\s#]+/g, "").replace(/^\s*\d+[.．、)]\s*/, "").replace(/[\s|｜:：・、。,.!！?？「」『』()（）【】\[\]〜~\-—]/g, "");
const articles = (stats.articles || []).map((a) => ({ ...a, key: norm(a.title) })).filter((a) => a.key.length >= 6);
const out = [];
for (const c of contents) {
  if (c.kind !== "note") continue;
  const k = norm(c.title);
  if (k.length < 6) continue;
  const hit = articles.find((a) => a.key === k || a.key.includes(k) || k.includes(a.key));
  if (hit) out.push({ id: c.id, title: c.title, url: hit.url, publishedAt: hit.publishedAt });
}
process.stdout.write(JSON.stringify(out, null, 2) + "\n");

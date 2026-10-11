# PT国試ドリル

理学療法士 国家試験対策サイト。回・分野を選んで問題を解き、マイページで分野別の正答率と苦手分野をグラフで確認できる。

| ファイル | 内容 |
|---|---|
| `index.html` | トップ：回・分野・問題数を選んでスタート、使い方、note の最新記事 |
| `quiz.html` | 問題を解く（1問ずつ正解と解説、最後に結果とふりかえり） |
| `mypage.html` | 正答率（円グラフ）、共通／専門・分野別（棒グラフ）、ウィークポイント、最近の学習 |
| `about.html` / `privacy.html` / `404.html` | 運営者情報・プライバシーポリシー・404 |
| `assets/questions.js` | 問題データ（分野・回の一覧もここ） |
| `assets/pt.js` / `assets/pt.css` | 動き／見た目 |
| `site.config.json` | 公開URL・note のID・メンバーシップURL・GA の測定ID |

解答の記録は端末のブラウザ（localStorage）に保存する。会員登録なし。

## 問題を足す

`assets/questions.js` の `PT_QUESTIONS` に足す。`set` が数値なら「第◯回」として回の選択肢に並ぶ。
国家試験の過去問を載せる前に、厚生労働省（医政局医事課 試験免許室）に転載してよいか確認すること。市販の問題集・他サイトの問題や解説は載せない。

## ビルドと公開

```bash
npm run build      # dist/ に組み立て（note の最新記事も取り込む）
npm run serve      # http://localhost:8000
```

GitHub → Settings → Pages → Source を「GitHub Actions」にすると、`main` への push と毎朝 7:13 に自動で公開される（note の記事もそのとき更新）。

## note の公開データ

`scripts/note-stats.mjs` が note の公開データ（記事ごとのスキ数・コメント数・価格・公開日）を集め、毎朝の自動更新のときに `stats` ブランチの `note-stats.json` に保存する。閲覧数・売上はログインが必要なので取れない。note の公式APIではないため、取れないときは空のまま続行する。

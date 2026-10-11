# PT国試ドリル — Claude 向けメモ

理学療法士の国家試験対策サイト（学生向け・GitHub Pages）。介護サイト「おやのて」（kaigo-）とはまったく別のサイト。おやのての名前・リンクを入れない。
構成とビルド方法は README.md を参照。

- 見た目：白基調、差し色は黄緑（#8cc63f、文字は #4f7a12）。角丸は使わず角のある四角。
- 問題は `assets/questions.js`。オリジナル問題のみ。過去問は厚生労働省に確認が取れるまで載せない。他人の note・問題集・他サイトの内容は転載しない。
- note（https://note.com/8192844）は RSS からタイトル・サムネイル・日付・リンクだけ取り込む（本文は載せない）。

## AI 編集部（ワークスペース）
- 社長＝Claude。指示は AFE本社ワークスペースの2ページ目「PT国試ドリル編集部」（https://claude.ai/artifact/JR1Rb6roSuorr2AQB8zzNM の #pt）から届く。
- 社員は `.claude/agents/`：出題 question（ユイ）／検品 checker（ケイ）／解説 explainer（アオイ）／note note（リョウ）／告知 sns（ミオ）／分析 analyst（タクミ）／開発 dev（ゲン）。問題や記事は必ず検品を通す。
- ワークスペースの表示はそのページの db：`pt_tasks`（col: doing/wait/todo/done、owner、orderId）、`pt_contents`（kind: question/note/post/image/site。note に投稿済みになったら posted: true・postedUrl・postedAt を入れて棚から外す。照合は `scripts/match-posted.mjs`）、`pt_staff`、`pt_activity`、`pt_orders`（返事は reply・repliedAt を書く）、`pt_kpi/summary`。AFE本社の `tasks` などには書かない。

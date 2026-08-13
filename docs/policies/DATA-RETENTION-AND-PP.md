# Cloudia 保存方針（要約主記録）と PP 整合

Issue: [#12](https://github.com/Cor-Incorporated/cloudia/issues/12)  
Epic: [#2](https://github.com/Cor-Incorporated/cloudia/issues/2)  
対象: Cloudia UI + corsweb `workers/contact-chat` 経由の B2B 受付会話  
ステータス: **Cloudia 側ドキュメント正本（作業仮説を含む）。corsweb 公開 PP は未反映（案のまま）。**

## 0. 文書の位置づけ（誤認防止）

| 事実 | 根拠 |
|---|---|
| Cloudia ADR は「生会話全文の無期限保存をしない」「要約 + 必要項目を主記録」と既に決定済み | [ADR-0001](../adr/ADR-0001-b2b-intake-role-and-modes.md) §保存、[ADR-0006](../adr/ADR-0006-security-and-spam-layers.md) §保存 |
| 公開 PP（`/privacy`）は **第0.3版（案）** であり、AI受付の保存期間・削除ルールを最終確定した文言ではない | corsweb `privacy` i18n（基準日 2026-07-17・案）、[#164](https://github.com/Cor-Incorporated/corsweb2024/issues/164) |
| 本ファイルの保持・削除「ルール案」は **PP 更新・法務確認前の作業仮説**。法令適合の断定ではない | 下記 §4、[#164](https://github.com/Cor-Incorporated/corsweb2024/issues/164) |
| 実 DB・本番データ・個人情報は本 Issue の作業対象外 | Issue #12 / Phase 17 Lane-CU 委任 |

**禁止される読み方**: 「本 docs がマージされた＝公開 PP が更新済み」「保持日数が法務確定済み」。いずれも偽。

## 1. 受け入れ条件との対応

| #12 受け入れ条件 | 本ドキュメントの根拠箇所 |
|---|---|
| 生会話全文の無期限保存をしない方針を docs 化 | §2 |
| 要約 + 必要項目を主記録と明記 | §3 |
| corsweb PP 更新 Issue とリンク | §5 |
| 削除・保持期間のルール案 | §4（案・法務未確定） |

## 2. 生会話全文を無期限保存しない

既存決定の再掲（新規の法的断定ではない）:

1. **生会話全文（chat 往復の原文ログ）を無期限に主記録として保存しない。**  
   - ADR-0001: 「生会話全文の無期限保存はしない」  
   - ADR-0006: 「全文無期限保存しない」
2. **`POST /api/contact/chat` は PII を要求・保存しない**（会話・分類用）。永続化の主経路ではない。  
   - ADR-0003 API 表
3. **Grift 等への引継ぎでも生会話全文は転送しない**（要約・構造化情報のみ、明示同意後）。  
   - corsweb [#164](https://github.com/Cor-Incorporated/corsweb2024/issues/164) §①・§④

運用上の含意（実装オーナーは corsweb Worker。Cloudia は送信しない）:

- ブラウザに保持する会話履歴は UI 表示・API リクエスト境界用であり、無期限アーカイブではない（クライアント側の履歴バウンド方針は既存実装に従う）。
- 障害調査用の一時ログを置く場合も、主記録（§3）へ昇格させず、短命・アクセス制限を前提とする（詳細期間は §4 案 + #164）。

## 3. 主記録 = 要約 + 必要項目

**主記録（永続化の中心）** は次のとおりとする。

| 区分 | 内容 | 取得タイミング | 根拠 |
|---|---|---|---|
| 要約 | `conversationSummary`（利用者確認・修正後） | submit 前に確定 → submit に載せる | ADR-0003 §submit、要件フロー「要約 → 利用者確認」 |
| 構造化項目 | intent / source / UTM、分類・spam スコア（サーバ再計算可）、ヒアリングで得た非機密の業務概要 | chat で収集し submit に集約 | ADR-0003、ADR-0001 フロー |
| 連絡先 PII | 氏名・メール・会社名等 | **最終ステップの submit のみ**。LLM に渡さない | ADR-0003、CLAUDE.md PII Boundary、要件 §4 |
| 受付メタ | 受付番号（将来）、通知先メール本文に必要な範囲 | Worker 決定論的処理 | ADR-0003 P2、ADR-0007 |

主記録に含めない（原則）:

- chat の生トークン列・全文トランスクリプトを無期限保管すること
- 利用者に入力を促していない契約書本文・顧客名機密・その他「機密本文」
- submit 前の連絡先 PII を chat リクエストへコピーすること

## 4. 削除・保持期間のルール案（法務未確定）

以下は **ADR-0006「保存期間・削除は corsweb PP と整合」を満たすためのルール案**である。  
公開文言・日数の確定は corsweb [#164](https://github.com/Cor-Incorporated/corsweb2024/issues/164)（弁護士確認・PP 版上げ）がゲート。ここでの日数は作業仮説であり、法令上の義務期間の断定ではない。

### 4.1 データ種別ごとの案

| データ種別 | 保持の考え方（案） | 削除・消去（案） | 根拠・制約 |
|---|---|---|---|
| 生会話（chat 原文） | セッション完了または短期間の運用ログに限定。主記録へ残さない | セッション終了後または短い運用ウィンドウ後に削除。無期限保管しない | ADR-0001 / 0006；#164「生の会話全文は転送しない」 |
| 要約 + 構造化項目（主記録の非 PII 核） | 問い合わせ対応・再連絡・品質改善に必要な期間 | 対応完了後、利用目的終了または保持期限到来で消去。開示等請求に応じ訂正・削除 | 要件「分析可能な構造化データの蓄積」と ADR 保存方針の両立；PP 第7項（開示等）と整合させるのは #164 |
| 連絡先 PII（submit） | お問い合わせ対応・契約検討の利用目的の範囲 | 目的達成後または保持期限到来で消去。本人からの消去請求は PP 所定手続 | 現行 PP（案）お客様利用目的；#164 で Cloudia 向け明示を追加予定 |
| 隔離・spam キュー | 誤判定見直しのため短〜中期。完全自動破棄はしない | **削除は原則人間**（ADR-0006）。見直し後に消去または通常保持へ | ADR-0006 AI 判定の扱い |
| セキュリティ／従業員ログ | 本受付会話の主記録とは分離 | 社内「ログ取得・モニタリング規程」側（対外 PP 第9項が指す範囲） | 現行 PP（案）第9項。本 Issue では中身を新造しない |

### 4.2 保持期間の数値案（要 #164 確定）

数値は **未確定プレースホルダ**。実装・PP 反映前に法務・個人情報保護管理者の確認を必須とする。

| 種別 | 作業仮説（案） | 確定状態 |
|---|---|---|
| 生会話原文 | 例: セッション〜最大数日の運用ログ。無期限不可 | **未確定**（#164） |
| 主記録（要約・構造化・連絡先） | 例: 問い合わせ対応に必要な期間（年単位の候補を法務と選定）。契約に至った案件は契約・税務側の別ルールへ移行しうる | **未確定**（#164） |
| 開示等請求への対応目安 | 現行 PP（案）: 受付から原則 30 日以内に対応方針を通知 | PP（案）第7項に既存。AI受付固有の追記は #164 |

### 4.3 Cloudia クライアント側でやらないこと

- ブラウザ永続ストレージへ PII や生会話を意図的にアーカイブしない
- チャット履歴を「保存完了」と利用者に誤表示しない（送信完了は submit 成功時のみ）
- PP 未更新のまま「保存期間は N 年です」と UI に断定表示しない（#164 完了後に corsweb / Cloudia 同意文面を同期）

## 5. corsweb PP 更新 Issue へのリンク

| 役割 | Issue | 状態（照会時点） |
|---|---|---|
| **PP・法務ゲート（Cloudia / Grift 保存期間・委託・越境・同意文面）** | [corsweb2024#164](https://github.com/Cor-Incorporated/corsweb2024/issues/164) | OPEN。PP（案）承認、Cloudia・Grift 導入時の PP 再更新の弁護士確認、保存期間の決定が未完了 |
| 関連（contact 埋め込み） | [corsweb2024#254](https://github.com/Cor-Incorporated/corsweb2024/issues/254) | OPEN。UI 埋め込み。PP 本文の版上げ作業そのものではない |
| 関連（Grift 相談セッション） | [corsweb2024#259](https://github.com/Cor-Incorporated/corsweb2024/issues/259) | OPEN。転送データは要約・構造化に限定する前提（#164 §④） |

公開 PP URL（現行・案）: `https://cor-jp.com/privacy`（実装: corsweb2024 `src/pages/privacy.astro` + i18n）

**整合手順（人間ゲート。本 Lane では実行しない）**:

1. 本ドキュメント §2–§4 をインプットに、#164 で弁護士・個人情報保護管理者レビュー
2. corsweb `/privacy` の版数を（案）から正式版へ上げ、AI受付の取得項目・利用目的・委託先・保存期間・削除を追記
3. Contact / Cloudia の同意・注意文を同版に同期
4. Cloudia #12 をクローズ（PP 反映確認後）

## 6. 参照（根拠のみ）

- cloudia [#12](https://github.com/Cor-Incorporated/cloudia/issues/12)
- [ADR-0001](../adr/ADR-0001-b2b-intake-role-and-modes.md) §保存
- [ADR-0003](../adr/ADR-0003-api-contract-with-contact-chat.md) chat/submit PII 境界
- [ADR-0006](../adr/ADR-0006-security-and-spam-layers.md) §保存
- [ADR-0007](../adr/ADR-0007-phased-delivery.md) Phase 2「PP・保存方針の最終整合（#12）」
- [AI-CONTACT-RECEPTION.md](../requirements/AI-CONTACT-RECEPTION.md) §3 フロー / §4「個人情報の保存期間・削除方針」
- corsweb [#164](https://github.com/Cor-Incorporated/corsweb2024/issues/164)（PP 更新・法務）
- PR [#13](https://github.com/Cor-Incorporated/cloudia/pull/13)（ADR 正本化）

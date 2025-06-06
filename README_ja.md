# 3D感情チャットAI

Google GeminiAPIを使用した没入型3D感情チャットAIアプリケーション。感情を表現する3Dキャラクター（VRM）が、企業特化の回答を行うReact TypeScriptアプリケーションです。

## ✨ 機能

### 🎭 感情表現3Dキャラクター
- **VRMモデル統合**: 3D VRMキャラクターの読み込み・表示（現在はCloudiaを使用）
- **感情表現**: AIの回答に基づいてキャラクターの表情が変化（普通、喜び、悲しみ、怒り、驚き、考え中）
- **リアルタイムアニメーション**: 会話中の感情状態の滑らかな遷移

### 🤖 AI搭載会話システム
- **Gemini統合**: Google Gemini APIを活用したインテリジェントな回答
- **企業ナレッジベース**: 企業情報とリアルタイムカレンダーデータの統合
- **Web検索機能**: ワシントンプロキシ経由のWeb検索機能でグローバルアクセシビリティを実現
- **感情検出**: AIが回答に適した感情を自動判定

### 📅 カレンダー統合
- **リアルタイム同期**: GoogleカレンダーのiCal URL経由での接続
- **イベント表示**: チャット回答に今後のイベントを表示
- **日本語サポート**: 日本語カレンダーイベントの完全UTF-8エンコーディング対応
- **スマートフィルタリング**: 関連する今後のイベント（30日間）を表示

### 🌐 国際化対応
- **多言語サポート**: 日本語・英語インターフェース
- **動的言語切り替え**: リアルタイム言語切り替え
- **ローカライズコンテンツ**: 企業情報とUI要素の多言語対応

## 🚀 アーキテクチャハイライト

### モダンテックスタック
- **フロントエンド**: React 18 + TypeScript + Vite
- **3Dグラフィックス**: Three.js + VRMモデルサポート
- **AI統合**: Google Gemini API + ストリーミングレスポンス
- **スタイリング**: Tailwind CSS（レスポンシブデザイン）
- **状態管理**: React Context（言語・アプリ状態）

### 革新的設計決定
- **Import MapsによるESモジュール**: 依存関係バンドリングの代わりにesm.sh CDNからネイティブESモジュールを使用
- **Refベース3D更新**: キャラクター表情更新がReactの再レンダーをバイパスしパフォーマンス向上
- **プロキシアーキテクチャ**: グローバルWeb検索アクセス用ワシントンベースプロキシサーバー
- **文字エンコーディング**: 日本語カレンダー統合のための高度UTF-8処理

## 📋 前提条件

- **Node.js** (v18以上)
- **Gemini APIキー** (Google AI Studioより)
- **Googleカレンダー** パブリックiCal URL（オプション）

## 🛠 セットアップ・インストール

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境設定
`.env.local`ファイルを作成し、以下の変数を設定：

```env
GEMINI_API_KEY=your_actual_gemini_api_key
GOOGLE_CALENDAR_ICAL_URL=your_google_calendar_ical_url
```

**APIキーの取得方法:**
1. [Google AI Studio](https://aistudio.google.com/)にアクセス
2. 新しいAPIキーを作成
3. キーを`.env.local`ファイルにコピー

**カレンダー設定（オプション）:**
1. Googleカレンダーを開く
2. 設定 > カレンダー設定へ移動
3. 「カレンダーの統合」セクションを探す
4. パブリックiCal URLをコピー

### 3. 企業設定
`/company-info/company.md`を編集し、企業詳細をMarkdown形式で記述してください。このコンテンツはAIが企業特化回答に使用します。

### 4. 開発サーバー起動
```bash
npm run dev
```

### 5. プロダクションビルド
```bash
npm run build
```

### 6. プロダクションビルドプレビュー
```bash
npm run preview
```

## 🏗 プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── CharacterDisplay.tsx    # 3D VRMキャラクターレンダラー
│   ├── ChatInput.tsx           # ユーザー入力コンポーネント
│   ├── ChatMessage.tsx         # メッセージ表示コンポーネント
│   └── KnowledgeInput.tsx      # ナレッジベースエディター
├── services/            # コアサービス
│   ├── geminiService.ts        # Gemini API統合
│   ├── threeCharacter.ts       # 3Dキャラクター管理
│   ├── calendarService.ts      # カレンダー統合
│   ├── companyWebSearch.ts     # Web検索機能
│   └── knowledgeLoader.ts      # 企業ナレッジローダー
├── contexts/            # Reactコンテキスト
│   └── LanguageContext.tsx     # 言語管理
├── api/                 # Netlify Functions
│   ├── gemini.ts               # Gemini APIプロキシ
│   └── calendar.ts             # カレンダーAPIプロキシ
└── company-info/        # 企業ナレッジベース
    └── company.md              # 企業情報（Markdown）
```

## 🎮 使用方法

1. **チャット開始**: チャット入力に質問を入力
2. **感情観察**: 回答に基づく3Dキャラクターの表情変化を観察
3. **言語切り替え**: 言語セレクターで日本語・英語を切り替え
4. **企業クエリ**: 企業情報、イベント、スケジュールについて質問
5. **Web検索**: 最新情報を取得するWeb検索をトリガーする質問

## 🔧 技術詳細

### 3Dキャラクターシステム
- **VRM読み込み**: ボーン構造検証付き`.vrm`ファイル読み込み
- **表情マッピング**: AI感情から3Dキャラクター表情へのマッピング
- **パフォーマンス最適化**: Reactの再レンダーなしでボーン直接操作

### AI統合
- **ストリーミングレスポンス**: Geminiからのリアルタイムレスポンスストリーミング
- **コンテキスト管理**: 会話履歴と企業ナレッジの維持
- **感情解析**: AI回答から感情指標の抽出

### カレンダー統合
- **iCal解析**: GoogleカレンダーiCal形式のカスタムパーサー
- **エンコーディング処理**: 日本語コンテンツの高度UTF-8サポート
- **日付フィルタリング**: 関連する今後のイベントのスマートフィルタリング

### Web検索プロキシ
- **グローバルアクセス**: 国際検索アクセス用ワシントンベースプロキシ
- **CORS処理**: クライアントサイドアプリケーションとのシームレス統合
- **検索統合**: 特定キーワードでトリガーされる自動Web検索

## 🌍 デプロイ

アプリケーションはNetlifyでのデプロイ用に設定済み：
- **Netlify Functions**: Gemini・カレンダー用サーバーサイドAPIプロキシ
- **エッジネットワーク**: グローバルCDN配信
- **環境変数**: セキュアなAPIキー管理

## 🤝 コントリビューション

1. リポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更を実装
4. 十分にテスト
5. プルリクエストを提出

## 📄 ライセンス

© 2025 Cor.inc. All rights reserved.

## 🆘 サポート

問題や質問については：
- リポジトリでissueを作成
- お問い合わせ: [Cor.incサポート](https://cor-jp.com/contact)
- メール: 企業ウェブサイト経由でお問い合わせ

---

*最終更新: 2025年6月*

## 🔗 関連リンク

- [英語版README](README.md)
- [企業ウェブサイト](https://cor-jp.com)
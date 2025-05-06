# Bedrock Amplify Next.js Mastra AI SDK Assistant UI

このプロジェクトは、AWS Bedrockを活用したAIアシスタントUIを実装したNext.jsアプリケーションです。AWS Amplifyによる認証機能と、Mastra、AI SDK、Assistant UIを組み合わせて構築されています。

## 主な機能

- AWS Amplifyによるユーザー認証
- AWS Bedrockを使用したAIモデル（Nova Pro）との対話
- Assistant UIによるチャットインターフェース
- Mastraフレームワークによるエージェント管理
- AWS Documentation MCPサーバーによる拡張機能

## 技術スタック

- **フロントエンド**: Next.js 15、React 19、Tailwind CSS
- **バックエンド**: AWS Amplify、AWS Bedrock
- **AI/ML**: AI SDK、Mastra、MCP（Model Context Protocol）
- **認証**: AWS Amplify Authentication

## 始め方

### 前提条件

- Node.js 18以上
- AWS アカウント
- AWS CLIの設定
- Amplify CLIのインストール

### インストール

```bash
# 依存関係のインストール
npm install

# Amplifyバックエンドの起動
npx ampx sandbox
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、アプリケーションが表示されます。

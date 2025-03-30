# AIメモアプリケーションのプロジェクト構成

このプロジェクトは、Next.jsを使用したAIメモアシスタントアプリケーションです。ユーザーがメモを作成・保存し、Claude APIを使ってメモの要約や関連情報を生成するシンプルなWebアプリケーションとなっています。

## ディレクトリ構成とファイルの役割

```
ai-memo-app/
├── .env.local                # 環境変数設定ファイル（APIキーなど）
├── .gitignore                # Gitの除外ファイル設定
├── eslint.config.mjs         # ESLintの設定ファイル
├── next.config.ts            # Next.jsの設定ファイル
├── package.json              # プロジェクトの依存関係とスクリプト
├── postcss.config.mjs        # PostCSSの設定ファイル
├── tsconfig.json             # TypeScriptの設定ファイル
├── data/                     # データベースファイル
│   └── memos.db              # SQLiteデータベースファイル
├── public/                   # 静的ファイル
│   ├── file.svg              # アイコン
│   ├── globe.svg             # アイコン
│   ├── next.svg              # Next.jsロゴ
│   ├── vercel.svg            # Vercelロゴ
│   └── window.svg            # アイコン
└── src/                      # ソースコード
    ├── app/                  # Next.jsのApp Router
    │   ├── api/              # APIエンドポイント
    │   │   ├── memos/        # メモ関連のAPI
    │   │   │   ├── [id]/     # 特定のメモに対するAPI
    │   │   │   │   ├── route.ts           # メモの取得・更新・削除API
    │   │   │   │   └── summary/route.ts   # メモの要約生成API
    │   │   │   └── route.ts  # メモの一覧取得・作成API
    │   │   └── settings/     # 設定関連のAPI
    │   │       └── api-key/route.ts  # APIキー保存API
    │   ├── memo/             # メモ関連のページ
    │   │   ├── [id]/         # 特定のメモのページ
    │   │   │   ├── page.tsx  # メモ詳細ページ
    │   │   │   └── edit/page.tsx  # メモ編集ページ
    │   │   └── new/          # 新規メモ作成ページ
    │   ├── settings/         # 設定関連のページ
    │   │   └── api-key/page.tsx  # APIキー設定ページ
    │   ├── favicon.ico       # ファビコン
    │   ├── globals.css       # グローバルCSS
    │   ├── layout.tsx        # ルートレイアウト
    │   └── page.tsx          # トップページ（メモ一覧）
    ├── components/           # 再利用可能なコンポーネント
    │   ├── ApiKeyForm.tsx    # APIキー入力フォーム
    │   ├── Header.tsx        # ヘッダーコンポーネント
    │   ├── MemoCard.tsx      # メモカードコンポーネント
    │   └── MemoForm.tsx      # メモ入力フォーム
    ├── hooks/                # カスタムReactフック
    │   └── useApiKey.ts      # APIキー管理フック
    └── lib/                  # ユーティリティ関数
        ├── claude.ts         # Claude API連携
        ├── db/               # データベース操作
        │   ├── apiKeys.ts    # APIキーのDB操作
        │   ├── index.ts      # DB接続設定
        │   └── memos.ts      # メモのDB操作
        └── repositories/     # リポジトリパターン実装
            └── apiKeyRepository.ts  # APIキーリポジトリ
```

## 各ディレクトリ・ファイルの役割

### ルートディレクトリ

- **package.json**: プロジェクトの依存関係とスクリプトを管理。Next.js、React、Tailwind CSS、better-sqlite3、@anthropic-ai/sdk（Claude API）などの依存関係が定義されています。
- **.env.local**: 環境変数を設定するファイル。Claude APIキーなどの機密情報を保存します。
- **next.config.ts**: Next.jsの設定ファイル。
- **tsconfig.json**: TypeScriptの設定ファイル。

### data/

- **memos.db**: SQLiteデータベースファイル。メモデータとAPIキーを保存します。

### public/

静的ファイルを格納するディレクトリ。アイコンやロゴなどが含まれています。

### src/app/

Next.jsのApp Routerを使用したページコンポーネントを格納するディレクトリ。

- **page.tsx**: トップページ（メモ一覧）。APIキーが設定されていない場合はAPIキー入力画面を表示します。
- **layout.tsx**: すべてのページで共有されるレイアウトコンポーネント。
- **globals.css**: グローバルなスタイル定義。

#### src/app/api/

APIエンドポイントを定義するディレクトリ。

- **memos/route.ts**: メモの一覧取得（GET）と新規作成（POST）のAPI。
- **memos/[id]/route.ts**: 特定のメモの取得（GET）、更新（PUT）、削除（DELETE）のAPI。
- **memos/[id]/summary/route.ts**: Claude APIを使用してメモの要約を生成するAPI。
- **settings/api-key/route.ts**: APIキーを保存するAPI。

#### src/app/memo/

メモ関連のページコンポーネントを格納するディレクトリ。

- **[id]/page.tsx**: メモの詳細ページ。AI要約を表示します。
- **[id]/edit/page.tsx**: メモの編集ページ。
- **new/**: 新しいメモを作成するページ。

#### src/app/settings/

設定関連のページコンポーネントを格納するディレクトリ。

- **api-key/page.tsx**: APIキーを入力・更新するページ。

### src/components/

再利用可能なUIコンポーネントを格納するディレクトリ。

- **ApiKeyForm.tsx**: APIキー入力フォームコンポーネント。
- **Header.tsx**: ヘッダーコンポーネント。ナビゲーションリンクを提供します。
- **MemoCard.tsx**: メモカードコンポーネント。メモ一覧で各メモを表示します。
- **MemoForm.tsx**: メモ入力フォームコンポーネント。メモの作成・編集に使用します。

### src/hooks/

カスタムReactフックを格納するディレクトリ。

- **useApiKey.ts**: APIキーの取得・保存・検証を行うカスタムフック。

### src/lib/

ユーティリティ関数やデータベース操作を格納するディレクトリ。

- **claude.ts**: Claude APIとの連携機能を提供します。
- **db/index.ts**: SQLiteデータベースへの接続設定。
- **db/memos.ts**: メモのデータベース操作（CRUD）を提供します。
- **db/apiKeys.ts**: APIキーのデータベース操作を提供します。
- **repositories/apiKeyRepository.ts**: APIキーのリポジトリパターン実装。データアクセスロジックをカプセル化します。

## 技術スタック

- **フロントエンド**: Next.js、React、Tailwind CSS
- **バックエンド**: Next.js API Routes、SQLite
- **AI連携**: Claude API（Anthropic）
- **データベース**: SQLite（better-sqlite3）
- **フォーム管理**: react-hook-form
- **バリデーション**: zod
- **暗号化**: crypto-js（APIキーの暗号化）

このアプリケーションは、Next.jsのApp Routerを使用したフルスタックアプリケーションで、フロントエンドとバックエンドの両方の機能を提供しています。SQLiteデータベースを使用してメモデータを永続化し、Claude APIを利用してメモの要約を生成する機能を実装しています。
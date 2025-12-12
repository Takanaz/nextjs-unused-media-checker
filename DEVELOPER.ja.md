# 開発者ガイド

[English](DEVELOPER.md) | 日本語

このガイドは、Next.js Unused Media Checker 拡張機能に**貢献したい開発者**や、内部実装を**理解したい開発者**向けに、包括的な情報を提供します。

## 目次

- [前提条件](#前提条件)
- [環境構築](#環境構築)
- [開発ワークフロー](#開発ワークフロー)
- [アーキテクチャ概要](#アーキテクチャ概要)
- [テスト](#テスト)
- [ビルドとパッケージング](#ビルドとパッケージング)
- [デバッグ](#デバッグ)
- [コード品質](#コード品質)
- [リリース手順](#リリース手順)
- [トラブルシューティング](#トラブルシューティング)

## 前提条件

### 必須ソフトウェア

- **Node.js**: 18 以上
- **pnpm**: 最新（推奨）
- **VS Code**: 最新
- **Git**: バージョン管理用

### 推奨ツール

- **VS Code 拡張機能**:
  - TypeScript and JavaScript Language Features
  - Biome（lint/format）
  - Extension Test Runner
- **ターミナル**: PowerShell / Bash / Zsh など

## 環境構築

### 1. リポジトリをクローン

```bash
git clone https://github.com/Takanaz/nextjs-unused-media-checker.git
cd nextjs-unused-media-checker
```

### 2. 依存関係をインストール

```bash
pnpm install
```

### 3. 初回ビルド

```bash
pnpm run compile
```

### 4. セットアップ確認

```bash
# 型チェック
pnpm run check-types

# コード品質チェック
pnpm run check

# テスト実行
pnpm test
```

## 開発ワークフロー

### 開発開始

```bash
# 自動ビルドのための watch モードを開始
pnpm run watch
```

このコマンドは複数の watcher を並列に動かします:

- `esbuild` watcher（TypeScript のコンパイル）
- TypeScript compiler（型チェック）

### Extension Host を起動

1. VS Code で本プロジェクトを開く
2. `F5` を押す（または `Run and Debug` → `Run Extension`）
3. 拡張が読み込まれた新しい VS Code ウィンドウが開く
4. Extension Development Host 上で変更を検証する

### 開発用コマンド

```bash
# 開発用ビルド
pnpm run compile

# 本番用ビルド
pnpm run package

# 型チェックのみ
pnpm run check-types

# コード品質チェック（lint + format）
pnpm run check

# コード品質の自動修正
pnpm run check:fix

# フォーマットのみ
pnpm run format
pnpm run format:fix

# テスト実行
pnpm test

# VSIX 生成
pnpm run package
```

## アーキテクチャ概要

### プロジェクト構成

```
src/
├── extension.ts          # 拡張機能のエントリポイント
├── i18n/                # 国際化（i18n）
│   ├── index.ts         # i18n ローダー
│   ├── en.ts            # 英語翻訳
│   └── ja.ts            # 日本語翻訳
└── test/
    └── extension.test.ts # 拡張機能テスト

dist/                    # ビルド成果物
out/                     # テスト用のコンパイル成果物
.github/workflows/       # CI/CD workflows
images/                  # 拡張機能アセット
```

### 主要コンポーネント

#### 拡張機能の起動（Activation）

- **エントリポイント**: `src/extension.ts`
- **Activation Events**: `workspaceContains:**/package.json`
- **コマンド**: `nextjs-unused-media-checker.checkUnusedMedia`

#### コア機能

- **メディア検出**: public ディレクトリをスキャンしてメディアファイルを列挙
- **使用状況解析**: ソースコード全体から参照を検索
- **ファイルデコレーション**: Explorer 上に使用/未使用の状態を表示
- **パターンマッチング**: 多様な import/参照パターンに対応

#### 国際化（i18n）

- **対応言語**: 英語 / 日本語
- **実装**: VS Code の言語設定に応じた動的ロード
- **関連ファイル**: `package.nls.json`, `package.nls.ja.json`

## テスト

### テスト構成

テストは `src/test/extension.test.ts` にあり、Mocha を使用しています。

### テストカテゴリ

1. **メディアファイル検出テスト**

   - 複数フォーマット対応
   - サブディレクトリ走査
   - シンボリックリンクの扱い

2. **使用検出テスト**

   - 直接参照
   - CSS `url()` パターン
   - Next.js Image コンポーネント
   - 大文字小文字を区別しないマッチ

3. **設定テスト**

   - メディア拡張子のカスタマイズ
   - 除外パターン
   - public ディレクトリ設定

4. **エラーハンドリング**
   - ファイル読み込みエラー
   - 不正な設定

### テストの実行

```bash
# 全テスト実行
pnpm test

# watch モードでテスト
pnpm run watch-tests

# テストのみコンパイル
pnpm run compile-tests
```

### テストを書く

```typescript
suite("Your Test Suite", () => {
  test("should do something", async () => {
    // Setup test environment
    // Execute functionality
    // Assert results
  });
});
```

## ビルドとパッケージング

### 開発ビルド

```bash
pnpm run compile
```

このビルドは以下の特性があります:

- ソースマップ有効
- minify 無効
- 高速なコンパイル

### 本番ビルド

```bash
pnpm run package
```

このビルドは以下の特性があります:

- minify 有効
- ソースマップ無効
- サイズ最適化

### VSIX パッケージ生成

```bash
# 事前に vsce をグローバルにインストール
pnpm add -g @vscode/vsce

# パッケージ生成
vsce package

# 生成物: nextjs-unused-media-checker-X.X.X.vsix
```

### Open VSX（Cursor/VSCodium など）向けパッケージ/公開

Open VSX Registry に公開する場合は `ovsx` CLI を使用します。

```bash
# 事前準備: Open VSX のアクセストークンを取得して環境変数に設定
export OVSX_PAT=your_open_vsx_personal_access_token

# パッケージ作成（必要に応じて）
pnpm run ovsx:package

# 公開
pnpm run ovsx:publish

# あるいは、ビルド→公開を一括実行
pnpm run release:ovsx
```

注:

- Open VSX の拡張 ID は通常 `publisher.name` です。本プロジェクトは `Takanaz.nextjs-unused-media-checker`。
- `publisher` 名は Open VSX 側にも存在している必要があります。未作成の場合は Open VSX 上で組織/パブリッシャーを作成し、拡張の所有権を紐付けてください。

## デバッグ

### 拡張機能のデバッグ

1. TypeScript ファイルにブレークポイントを設定
2. `F5` でデバッグ開始
3. Debug Console でログ出力などを確認
4. 拡張機能は別の Extension Host プロセスで動作

### デバッグ設定

`.vscode/launch.json` は例えば以下のようになります:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "preLaunchTask": "${workspaceFolder}/pnpm: watch"
    }
  ]
}
```

### ロギング

拡張機能の Output Channel を利用できます:

```typescript
import * as vscode from "vscode";

const outputChannel = vscode.window.createOutputChannel(
  "Next.js Unused Media Checker"
);
outputChannel.appendLine("Debug message");
outputChannel.show();
```

## コード品質

### Biome 設定

本プロジェクトは lint/format に Biome を使用します。設定は `biome.json` にあります。

### コーディングスタイル

- **TypeScript**: strict mode 有効
- **フォーマット**: 2 スペースインデント、シングルクォート
- **Imports**: 自動整理
- **命名**: 変数は camelCase、クラスは PascalCase

### pre-commit フック

```bash
# lefthook を未導入ならインストール
pnpm add -g lefthook

# フックをインストール
lefthook install
```

これにより、コミット前にコード品質チェックが実行されます。

## リリース手順

### 自動リリース（推奨）

1. **バージョン更新**: `package.json` の version を更新
2. **Changelog 更新**: `CHANGELOG.md` に変更点を追加
3. **Production にマージ**:
   ```bash
   git checkout develop
   git pull origin develop
   # Make your changes
   git checkout production
   git merge develop
   git push origin production
   ```
4. **GitHub Actions**: タグ/リリース作成および Marketplace への公開を自動実行

### 手動リリース

```bash
# ビルドとテスト
pnpm run package
pnpm test

# タグ作成・push
git tag -a v0.1.1 -m "Release version 0.1.1"
git push origin v0.1.1

# Marketplace 公開
vsce publish
```

### リリースチェックリスト

- [ ] `package.json` のバージョン更新
- [ ] `CHANGELOG.md` 更新
- [ ] テストが全て成功
- [ ] コード品質チェックが成功
- [ ] ドキュメント更新
- [ ] VSIX が生成できる

## トラブルシューティング

### よくある問題

#### 拡張機能が読み込まれない

```bash
# コンパイル確認
pnpm run compile

# TypeScript エラー確認
pnpm run check-types
```

#### テストが失敗する

```bash
# テストのコンパイルを確認
pnpm run compile-tests

# テスト環境確認
pnpm run pretest
```

#### パッケージビルドが失敗する

```bash
# クリーンして再ビルド
rm -rf dist/ out/
pnpm run compile
pnpm run package
```

#### VS Code 連携の問題

```bash
# VS Code を再読み込み
# Command Palette: "Developer: Reload Window"

# Extension Host のログ確認
# Help > Toggle Developer Tools > Console
```

### デバッグ用環境変数

```bash
# 詳細ログ
export VSCODE_EXTENSION_DEBUG=1

# Extension Host のデバッグ
export VSCODE_EXTENSION_HOST_DEBUG=1
```

### パフォーマンスプロファイリング

VS Code 内蔵のプロファイリング機能を利用できます:

1. Command Palette: "Developer: Startup Performance"
2. Command Palette: "Developer: Profile Extension Host"

## Contributing

コントリビューションのガイドラインは [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

### ヘルプ

- **Issues**: https://github.com/Takanaz/nextjs-unused-media-checker/issues
- **Discussions**: https://github.com/Takanaz/nextjs-unused-media-checker/discussions
- **Email**: takanaz.dev@gmail.com

## 参考リンク

- VS Code Extension API: https://code.visualstudio.com/api
- Extension Guidelines: https://code.visualstudio.com/api/references/extension-guidelines
- Publishing Extensions: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- Biome Documentation: https://biomejs.dev/

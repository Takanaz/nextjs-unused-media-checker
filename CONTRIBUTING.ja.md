# コントリビューションガイド（Next.js Unused Media Checker）

[English](CONTRIBUTING.md) | 日本語

このプロジェクトへの貢献に興味を持っていただきありがとうございます！

## はじめに

### 前提条件

- Node.js 16+
- VS Code または Cursor
- Git

### 開発環境セットアップ

1. **Fork & Clone**

```bash
git clone https://github.com/YOUR_USERNAME/nextjs-unused-media-checker.git
cd nextjs-unused-media-checker
```

2. **依存関係のインストール**

```bash
pnpm install
# または（pnpmを使わない場合）
npm install
```

3. **開発開始**

```bash
pnpm run watch
# または
npm run watch
```

4. **テスト実行**

```bash
pnpm test
# または
npm test
```

## 開発ワークフロー

### ビルド

```bash
# 開発ビルド
pnpm run compile

# 本番ビルド
pnpm run package

# 型チェック
pnpm run check-types

# コードチェック＆フォーマット
pnpm run check
pnpm run check:fix
```

### 拡張機能の動作確認

```bash
# VSIX を作成
pnpm run package
vsce package

# ローカルにインストール
code --install-extension nextjs-unused-media-checker-*.vsix
```

## コントリビューションガイドライン

### コードスタイル

- 既存の TypeScript の規約に合わせる
- lint/format は Biome を利用する
- 意味のあるコミットメッセージを書く
- 新機能には可能な限りテストを追加する

### Pull Request の流れ

1. `develop` から **ブランチを作成**

```bash
git checkout -b feature/your-feature-name
```

2. **変更を加える**

- スタイルガイドに沿って実装
- 必要に応じてテスト追加
- ドキュメント更新

3. **十分にテスト**

```bash
npm test
npm run check
npm run check-types
```

4. **分かりやすいメッセージでコミット**

```bash
git commit -m "feat: add support for additional media formats"
```

5. **push して PR を作成**

```bash
git push origin feature/your-feature-name
```

### コミットメッセージ規約

本プロジェクトは [Conventional Commits](https://www.conventionalcommits.org/) に従います:

- `feat:` - 新機能
- `fix:` - バグ修正
- `docs:` - ドキュメント変更
- `style:` - コードスタイル変更
- `refactor:` - リファクタリング
- `test:` - テスト追加
- `chore:` - メンテナンス作業

## Issue の報告

### バグ報告

[バグ報告テンプレート](.github/ISSUE_TEMPLATE/bug_report.md) を利用し、以下を含めてください:

- 問題の明確な説明
- 再現手順
- 期待する挙動と実際の挙動
- 環境情報
- 可能ならスクリーンショット

### 機能要望

[機能要望テンプレート](.github/ISSUE_TEMPLATE/feature_request.md) を利用し、以下を含めてください:

- 機能の明確な説明
- ユースケースと動機
- 実装案（あれば）

## 貢献できる領域

### 優先度: 高

- **検出パターン**: メディアファイル使用検出の改善
- **パフォーマンス**: 大規模プロジェクトでのスキャン最適化
- **i18n**: 対応言語の追加
- **テスト**: テストカバレッジ向上

### 優先度: 中

- **フレームワーク対応**: 他フレームワークのサポート
- **UI/UX**: 使い勝手の改善
- **レポート/統計**: より良い結果表示
- **設定**: 追加のカスタマイズ

### Good First Issue

`good first issue` ラベルの Issue は、初めての貢献におすすめです。

## 行動規範

### 基本方針

- 相互尊重と多様性の尊重
- 建設的なフィードバック
- 学び合いの促進
- プロフェッショナルなコミュニケーション

### 運用

不適切な振る舞いがあった場合、プロジェクトメンテナが状況に応じて対応します。

## 困ったとき

- **Issues**: バグ・機能要望
- **Email**: セキュリティ関連は takanaz.dev@gmail.com
- **Documentation**: まず README を確認してください

## 謝辞

コントリビューターは以下の形で紹介される場合があります:

- README への掲載
- リリースノートでの言及
- コミットメッセージでのクレジット

貢献してくださりありがとうございます！

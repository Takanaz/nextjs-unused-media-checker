# Next.js Unused Media Checker

<p align="center">
  <img src="https://img.shields.io/visual-studio-marketplace/v/Takanaz.nextjs-unused-media-checker?style=for-the-badge&logo=visual-studio-code" alt="Version">
  <img src="https://img.shields.io/visual-studio-marketplace/d/Takanaz.nextjs-unused-media-checker?style=for-the-badge" alt="Downloads">
  <img src="https://img.shields.io/github/license/Takanaz/nextjs-unused-media-checker?style=for-the-badge" alt="License">
  <a href="https://open-vsx.org/extension/Takanaz/nextjs-unused-media-checker"><img src="https://img.shields.io/open-vsx/v/Takanaz/nextjs-unused-media-checker?label=Open%20VSX&style=for-the-badge" alt="Open VSX"></a>
</p>

<p align="center"> 
<a href='./README.md'>English</a> | 日本語
</p>

Next.js プロジェクトにおける`public`ディレクトリ内の未使用メディアファイルを自動検出する VS Code Extension です。
リファクタリングの非常に強力な味方です。

---

## 主な機能

- 未使用ファイル一目で判断可能
- 並列バッチ処理 + `url()` / 文字列リテラルからの候補抽出で大規模プロジェクトでも使用可能
- JS/TS、CSS、HTML、JSON、Markdown ファイル内のメディアファイル参照を検出（URL のクエリ/ハッシュにも対応）
- 日本語完全対応
- ファイルタイプ、除外パターン、ディレクトリの設定によるカスタマイズが可能
- すべての処理がローカルで完結

## 対応拡張子

**画像ファイル:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.webp`, `.ico`, `.avif`, `.bmp`, `.tiff`  
**動画ファイル:** `.mp4`, `.webm`, `.avi`, `.mov`  
**音声ファイル:** `.mp3`, `.ogg`, `.wav`

## クイックスタート

### インストール

1. [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Takanaz.nextjs-unused-media-checker)からインストール
2. [Open VSX Registry](https://open-vsx.org/extension/Takanaz/nextjs-unused-media-checker) からインストール（Cursor, VSCodium など）
3. または拡張機能タブで「Next.js Unused Media Checker」を検索

### 使用方法

1. VS Code で Next.js プロジェクトを開く
2. コマンドパレット: `Ctrl/Cmd + Shift + P` → `Check Unused Media Files` を実行
3. エクスプローラーで結果を即座に確認:
   - 赤の ！ マーク = 未使用のメディアファイル
   - 緑の ✓ マーク = 使用されているメディアファイル
4. 通知をクリックして public フォルダを開きファイル管理

## 動作の仕組み

プロジェクト全体をスキャンし、メディアファイルの使用状況を検出します：

### スキャン対象

- **JavaScript/TypeScript**: `.js`, `.jsx`, `.ts`, `.tsx`
- **スタイルシート**: `.css`, `.scss`, `.sass`, `.less`
- **マークアップ**: `.html`, `.md`, `.mdx`
- **データ**: `.json`

### 対応検出パターン

- **直接インポート**: `import logo from '/logo.png'`
- **Next.js Image**: `<Image src="/hero.jpg" />`
- **CSS 背景画像**: `background: url('/bg.png')`
- **動的参照**: テンプレートリテラルや計算されたパス
- **大文字小文字を区別しない**: ファイル名の大文字小文字に関わらずマッチ

## 設定

VS Code 設定でカスタマイズ可能（`設定` → 「nextjs unused」で検索）：

| 設定              | 説明                                       | デフォルト                    |
| ----------------- | ------------------------------------------ | ----------------------------- |
| `publicDirectory` | メディアファイルをスキャンするディレクトリ | `"public"`                    |
| `mediaExtensions` | メディアとして扱うファイル拡張子           | `[".jpg", ".png", ...]`       |
| `excludePatterns` | 検索から除外するパターン                   | `["**/node_modules/**", ...]` |

<details>
<summary> 設定例</summary>

```json
{
  "nextjs-unused-media-checker.publicDirectory": "assets",
  "nextjs-unused-media-checker.excludePatterns": [
    "**/node_modules/**",
    "**/build/**",
    "**/.next/**"
  ],
  "nextjs-unused-media-checker.mediaExtensions": [
    ".jpg",
    ".png",
    ".gif",
    ".svg",
    ".webp"
  ]
}
```

</details>

## パフォーマンス

- **並列処理**: Promise.all によるバッチ処理で最高速度を実現
- **スマートフィルタリング**: 大きなファイル（>1MB）を自動的にスキップ
- **最適化されたデータ構造**: O(1)検索のための Set/Map 使用（ワークスペース互換のファイル I/O にも対応）
- **キャンセル可能な操作**: 長時間のスキャンを停止可能
- **メモリ効率**: 小さなバッチでファイルを処理

## 開発

以下の開発ようドキュメントをご参照ください：

- **[開発者ガイド](DEVELOPER.ja.md)** - 包括的な開発環境構築とワークフロー（日本語）/ English: [DEVELOPER.md](DEVELOPER.md)
- **[CONTRIBUTING ガイド](CONTRIBUTING.ja.md)** - プロジェクトへのコントリビューションガイド（日本語）/ English: [CONTRIBUTING.md](CONTRIBUTING.md)

クイックスタートについては、開発者ガイドの[環境構築](DEVELOPER.ja.md#環境構築)セクションをご覧ください。

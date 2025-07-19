# Next.js Unused Media Checker

<p align="center">
  <img src="https://img.shields.io/visual-studio-marketplace/v/Takanaz.nextjs-unused-media-checker?style=for-the-badge&logo=visual-studio-code" alt="Version">
  <img src="https://img.shields.io/visual-studio-marketplace/d/Takanaz.nextjs-unused-media-checker?style=for-the-badge" alt="Downloads">
  <img src="https://img.shields.io/github/license/Takanaz/nextjs-unused-media-checker?style=for-the-badge" alt="License">
</p>

<p align="center"> 
<a href='./README.md'>English</a> | 日本語
</p>

Next.js プロジェクトの`public`ディレクトリ内の未使用メディアファイルを自動検出する VS Code Extension です。
バンドルサイズの最適化とクリーンなコードベースの維持に有効で、リファクタリングの際に非常に有用です。

---

## 主な機能

- 未使用ファイル一目で判断可能
- 並列バッチ処理により大規模プロジェクトでも使用可能
- JS/TS、CSS、HTML、JSON、Markdown ファイル内のにおけるメディアファイルの参照を検出
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
2. または VS Code の拡張機能タブで「Next.js Unused Media Checker」を検索

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
- **最適化されたデータ構造**: O(1)検索のための Set/Map 使用
- **キャンセル可能な操作**: 長時間のスキャンを停止可能
- **メモリ効率**: 小さなバッチでファイルを処理

## 開発

詳細な手順は[Contributing Guide](CONTRIBUTING.md)をご覧ください。

<details>
<summary> クイック開発セットアップ</summary>

```bash
# クローンとセットアップ
git clone https://github.com/Takanaz/nextjs-unused-media-checker.git
cd nextjs-unused-media-checker
npm install

# 開発開始
npm run watch    # 変更時に自動リビルド
# VS CodeでF5キーを押して拡張機能ホストを起動

# 利用可能なコマンド
npm run compile      # 拡張機能をビルド
npm run test         # テストを実行
npm run lint         # ESLintを実行
npm run package      # VSIXパッケージを作成
```

</details>

# 変更履歴（Changelog）

[English](CHANGELOG.md) | 日本語

このファイルには、拡張機能「nextjs-unused-media-checker」の主な変更点を記録します。

## [0.1.13]

- セキュリティ: 残り1件の jsdiff 脆弱性（CVE-2026-24001）に対応するため、diff を 8.0.3 に固定
- メンテナンス: @types/vscode の最低バージョンを1.74.0にロールバック
- CI: リリースワークフローの pnpm バージョンを 10.28.2 から 10.32.1 へ更新
- CI: リリースワークフローの node バージョンを 20 から 24 へ更新

## [0.1.12]

- セキュリティ: pnpm overrides による推移依存の固定で、open 状態の Dependabot アラート 20 件に対応
- セキュリティ: undici (7.24.0)、minimatch (3.1.4/9.0.7/10.2.3)、serialize-javascript (7.0.3)、underscore (1.13.8)、ajv (8.18.0)、qs (6.14.2)、markdown-it (14.1.1) へ更新固定

## [0.1.11]

- 修正: @types/vscode を ^1.74.0 に戻し、engines.vscode との整合性を回復（vsce パブリッシュエラーの解消）
- CI: softprops/action-gh-release を v1 から v2.5.0 へアップグレード
- CI: リリースワークフローの pnpm バージョンを 10.15.0 から 10.28.2 へ更新

## [0.1.10]

- セキュリティ: @isaacs/brace-expansion の無制限リソース消費脆弱性に対応（CVE-2026-25547, High／推移依存を 5.0.1 へ更新）
- セキュリティ: lodash の `_.unset`・`_.omit` における Prototype Pollution 脆弱性に対応（CVE-2025-13465, Medium／推移依存を 4.17.23 へ更新）
- セキュリティ: undici の Content-Encoding 経由の無制限展開チェーン脆弱性に対応（CVE-2026-22036, Medium／推移依存を 7.20.0 へ更新）
- セキュリティ: jsdiff (diff) の parsePatch/applyPatch における DoS 脆弱性に対応（CVE-2026-24001, Low／pnpm overrides により diff@8.0.3 に固定）
- メンテナンス: ovsx を 0.10.9 へ更新
- メンテナンス: typescript を 5.9.3 へ更新

## [0.1.9]

- セキュリティ: qs の arrayLimit バイパス脆弱性に対応（推移依存 qs を 6.14.1 へ更新）
- メンテナンス: ovsx を 0.10.8 へ更新
- メンテナンス: @vscode/test-cli を 0.0.12 へ更新

## [0.1.8]

- セキュリティ: js-yaml の prototype pollution 脆弱性に対応（pnpm overrides により js-yaml@4.1.1 に固定）

## [0.1.7]

- Open VSX Registry (ovsx)のネームスペースを変更

## [0.1.6]

- 未使用判定の精度を改善（拡張子なしファイル名の単純一致による誤検出を低減）
- 未使用検出の性能を改善（`url()` と文字列リテラルから候補を抽出して照合する方式へ変更）
- basename（ファイル名のみ）参照の曖昧さを低減（ユニークな場合のみ「使用中」と判定）
- ワークスペース互換性を改善（`vscode.workspace.fs` による読み取り/size 取得、`findFiles` の除外パターン適用の修正）
- CI に Aikido Safe Chain を導入し、依存インストールを保護（malware action: block）
- 既存コメント直下に日本語コメントを追加

## [0.1.5]

- npm/yarn から pnpm へ移行（CI 含む）
- セキュリティ: glob CLI のコマンドインジェクション脆弱性に対応（pnpm overrides により glob@10.5.0 に固定）

## [0.1.4]

- Open VSX Registry（ovsx）への公開に対応
- 日本語版ドキュメントを拡充（日本語版の追加・相互リンク整備）

## [0.1.3]

- VS Code 互換エディターでも `public` フォルダを安定して開けるように改善

## [0.1.2]

- 自動公開のための GitHub Actions ワークフローを修正
- CI/CD を Node.js 20 と最新の @vscode/vsce を利用するよう更新
- リリース自動化とエラーハンドリングを改善

## [0.1.1]

- 一貫性とパフォーマンス向上のため、ESLint から Biome に移行
- 開発コマンドとドキュメントを更新
- コードフォーマットと lint のワークフローを改善

## [0.1.0]

- 初回リリース
- `public` ディレクトリのメディアファイル検出
- Explorer 上のファイルデコレーション（未使用: ！、使用中: ✓）
- 高性能な並列ファイル処理
- 国際化対応（英語、日本語）
- 除外パターンとメディア拡張子の設定
- サマリー通知と `public` フォルダへの導線
- 高度な検出パターン:
  - 直接参照
  - CSS の url() パターン
  - Next.js Image コンポーネントのパターン
  - 動的 import / テンプレートリテラル
  - 大文字小文字を区別しないマッチ
- 1MB のファイルサイズ上限つきバッチ処理
- キャンセル可能な操作
- 包括的なエラーハンドリング
- TypeScript strict mode
- テストカバレッジ
- Biome による lint/format 設定

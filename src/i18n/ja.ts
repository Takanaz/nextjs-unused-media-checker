export const ja = {
  // 拡張機能
  'extension.activated': 'Next.js 未使用メディアチェッカーが有効になりました！',
  'extension.noWorkspace': 'ワークスペースフォルダーが見つかりません',
  'extension.noPublicDirectory':
    'ワークスペースにpublicディレクトリが見つかりません',
  'extension.checkingFiles': '未使用メディアファイルをチェック中...',
  'extension.foundFiles': 'メディアファイルを発見しました...',
  'extension.analysisComplete': '解析完了！',
  'extension.allFilesUsed':
    'publicディレクトリ内のすべてのメディアファイルが使用されています',
  'extension.errorChecking':
    '未使用メディアチェック中にエラーが発生しました: {0}',
  'extension.unableToOpenFile': 'ファイルを開けません: {0}',
  'extension.checkingProgress': 'ファイルをチェック中: {0}/{1}',
  'extension.summaryMessage':
    '{0}個の未使用メディアファイルが見つかりました ({1})。ファイルエクスプローラーで装飾を確認してください。',
  'extension.openFolder': 'Publicフォルダーを開く',

  // Webview
  'webview.title': 'Public ディレクトリ内の未使用メディアファイル',
  'webview.totalFiles': '未使用ファイル総数',
  'webview.totalSize': '総サイズ',
  'webview.averageSize': '平均ファイルサイズ',
  'webview.filePath': 'ファイルパス',
  'webview.size': 'サイズ',
  'webview.lastModified': '最終更新日',
  'webview.copyFileList': 'ファイルリストをコピー',
  'webview.exportAsJson': 'JSONでエクスポート',
  'webview.unknown': '不明',
  'webview.copySuccess': 'ファイルリストをクリップボードにコピーしました！',
  'webview.exportFileName': 'unused-media-files.json',

  // ヒント
  'tips.title': 'ヒント',
  'tips.clickFile': 'ファイル名をクリックするとエディターで開きます',
  'tips.sortedFiles':
    'ファイルはディレクトリ順、次に名前順でソートされています',
  'tips.checkedFiles':
    'このツールは JS、TS、CSS、HTML、JSON、Markdown ファイル内の参照をチェックします',
  'tips.dynamicDetection': '動的インポートとテンプレートリテラルも検出されます',

  // 単位
  bytes: 'バイト',
  kb: 'KB',
  mb: 'MB',
  gb: 'GB',

  // エラーメッセージ
  'error.directoryRead': 'ディレクトリ {0} を読み取れません: {1}',
  'error.fileProcess': '{0} を処理できません: {1}',
  'error.fileRead': 'ファイル {0} を読み取れません: {1}',

  // 設定
  'config.title': 'Next.js 未使用メディアチェッカー',
  'config.excludePatterns.description': 'ファイル検索から除外するパターン',
  'config.mediaExtensions.description': 'メディアファイルとして扱う拡張子',
  'config.publicDirectory.description': 'スキャンするpublicディレクトリの名前',

  // コマンド
  'command.checkUnusedMedia': '未使用メディアファイルをチェック',

  // ファイルデコレーション
  'decoration.unused':
    'このメディアファイルはプロジェクト内で使用されていません',
  'decoration.used': 'このメディアファイルはプロジェクト内で使用されています',
} as const;

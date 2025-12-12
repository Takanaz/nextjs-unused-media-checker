import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { initializeI18n, t } from './i18n';

// File decoration provider for unused media files
// 未使用メディアファイルに対してエクスプローラー上のデコレーションを提供
class MediaFileDecorationProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations: vscode.EventEmitter<
    vscode.Uri | vscode.Uri[] | undefined
  > = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
  readonly onDidChangeFileDecorations: vscode.Event<
    vscode.Uri | vscode.Uri[] | undefined
  > = this._onDidChangeFileDecorations.event;

  private unusedFiles: Set<string> = new Set();
  private usedFiles: Set<string> = new Set();

  updateFileStatus(
    publicPath: string,
    unusedFiles: string[],
    allMediaFiles: string[]
  ) {
    this.unusedFiles = new Set(
      unusedFiles.map((file) => path.join(publicPath, file))
    );
    this.usedFiles = new Set(
      allMediaFiles
        .filter((file) => !unusedFiles.includes(file))
        .map((file) => path.join(publicPath, file))
    );

    // Trigger decoration update
    // デコレーション更新イベントを発火して表示を更新
    this._onDidChangeFileDecorations.fire(undefined);
  }

  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    const filePath = uri.fsPath;

    if (this.unusedFiles.has(filePath)) {
      return {
        badge: '⚠',
        tooltip: t('decoration.unused'),
        color: new vscode.ThemeColor('errorForeground'),
      };
    }

    if (this.usedFiles.has(filePath)) {
      return {
        badge: '✓',
        tooltip: t('decoration.used'),
        color: new vscode.ThemeColor('charts.green'),
      };
    }

    return undefined;
  }
}

const decorationProvider = new MediaFileDecorationProvider();

export function activate(context: vscode.ExtensionContext) {
  initializeI18n();
  console.log(t('extension.activated'));

  // Register file decoration provider
  // ファイルデコレーションプロバイダーを登録
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(decorationProvider)
  );

  const disposable = vscode.commands.registerCommand(
    'nextjs-unused-media-checker.checkUnusedMedia',
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage(t('extension.noWorkspace'));
        return;
      }

      const rootPath = workspaceFolders[0].uri.fsPath;
      const config = vscode.workspace.getConfiguration(
        'nextjs-unused-media-checker'
      );
      const publicDirName = config.get<string>('publicDirectory', 'public');
      const publicPath = path.join(rootPath, publicDirName);

      try {
        await fsPromises.access(publicPath);
      } catch {
        vscode.window.showErrorMessage(t('extension.noPublicDirectory'));
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t('extension.checkingFiles'),
          cancellable: true,
        },
        async (progress, token) => {
          try {
            // Check for cancellation
            // ユーザーによるキャンセルで中断
            if (token.isCancellationRequested) {
              return;
            }

            const mediaFiles = await findMediaFiles(publicPath);
            progress.report({
              increment: 30,
              message: t('extension.foundFiles'),
            });

            if (token.isCancellationRequested) {
              return;
            }

            const unusedFiles = await findUnusedMediaFiles(mediaFiles, token);
            progress.report({
              increment: 70,
              message: t('extension.analysisComplete'),
            });

            showResults(unusedFiles, publicPath, mediaFiles);
          } catch (error) {
            vscode.window.showErrorMessage(
              t(
                'extension.errorChecking',
                error instanceof Error ? error.message : String(error)
              )
            );
          }
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}

export async function findMediaFiles(publicPath: string): Promise<string[]> {
  const config = vscode.workspace.getConfiguration(
    'nextjs-unused-media-checker'
  );
  const mediaExtensions = config.get<string[]>('mediaExtensions', [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.svg',
    '.webp',
    '.ico',
    '.mp4',
    '.webm',
    '.mp3',
    '.avif',
    '.bmp',
    '.tiff',
    '.ogg',
    '.wav',
    '.avi',
    '.mov',
  ]);
  const mediaFiles: string[] = [];

  async function scanDirectory(dirPath: string): Promise<void> {
    let files: fs.Dirent[];

    try {
      files = await fsPromises.readdir(dirPath, { withFileTypes: true });
    } catch (error) {
      console.warn(t('error.directoryRead', dirPath, String(error)));
      return;
    }

    for (const file of files) {
      const filePath = path.join(dirPath, file.name);

      try {
        if (file.isDirectory()) {
          // Check if it's a symbolic link
          // シンボリックリンクかどうかの判定
          const stats = await fsPromises.lstat(filePath);
          if (!stats.isSymbolicLink()) {
            await scanDirectory(filePath);
          }
        } else if (file.isFile()) {
          const ext = path.extname(file.name).toLowerCase();
          if (mediaExtensions.includes(ext)) {
            const relativePath = path.relative(publicPath, filePath);
            mediaFiles.push(relativePath);
          }
        }
      } catch (error) {
        console.warn(t('error.fileProcess', filePath, String(error)));
      }
    }
  }

  await scanDirectory(publicPath);
  return mediaFiles;
}

export async function findUnusedMediaFiles(
  mediaFiles: string[],
  token: vscode.CancellationToken
): Promise<string[]> {
  const unusedFiles = new Set(mediaFiles);
  const config = vscode.workspace.getConfiguration(
    'nextjs-unused-media-checker'
  );
  const excludePatterns = config.get<string[]>('excludePatterns', [
    '**/node_modules/**',
    '**/build/**',
    '**/dist/**',
    '**/.next/**',
    '**/out/**',
    '**/.git/**',
    '**/coverage/**',
    '**/.cache/**',
  ]);
  const searchPatterns = [
    '**/*.{js,jsx,ts,tsx,css,scss,sass,less,html,json,md,mdx}',
    ...excludePatterns.map((pattern) => `!${pattern}`),
  ];

  const files = await vscode.workspace.findFiles(
    searchPatterns[0],
    `{${searchPatterns.slice(1).join(',')}}`
  );

  const totalFiles = files.length;
  let processedFiles = 0;

  // Create a map for faster lookups
  // 参照検出を高速化するためのマッピング
  const mediaFileMap = new Map<string, string[]>();
  for (const mediaFile of mediaFiles) {
    const fileName = path.basename(mediaFile);
    const fileNameWithoutExt = path.basename(
      mediaFile,
      path.extname(mediaFile)
    );

    // Store various search patterns for each media file
    // メディアファイルごとに複数の検索パターンを保持
    mediaFileMap.set(mediaFile, [
      mediaFile.toLowerCase(),
      fileName.toLowerCase(),
      fileNameWithoutExt.toLowerCase(),
    ]);
  }

  // Process files in batches for better performance
  // パフォーマンス向上のためにファイルをバッチ処理
  const BATCH_SIZE = 20;
  const MAX_FILE_SIZE = 1024 * 1024; // 1MB limit for files to process

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    if (token.isCancellationRequested) {
      break;
    }

    const batch = files.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (file) => {
        try {
          // Skip large files
          // 大きなファイルはスキップ
          const stats = await fsPromises.stat(file.fsPath);
          if (stats.size > MAX_FILE_SIZE) {
            console.log(
              `Skipping large file: ${file.fsPath} (${stats.size} bytes)`
            );
            return;
          }

          const content = await fsPromises.readFile(file.fsPath, 'utf-8');
          const contentLower = content.toLowerCase();

          // Check each unused file
          // 未使用候補の各メディアファイルについて参照有無を確認
          for (const [mediaFile, searchTerms] of mediaFileMap.entries()) {
            if (!unusedFiles.has(mediaFile)) {
              continue; // Already found to be used
            }

            // Quick check for any of the search terms
            // 検索語の簡易チェック（早期判定）
            const isUsed = searchTerms.some((term) =>
              contentLower.includes(term)
            );

            if (isUsed) {
              // Do more detailed check only if quick check passed
              // 簡易チェックに引っかかった場合のみ詳細チェック
              const fileName = path.basename(mediaFile);
              const fileNameWithoutExt = path.basename(
                mediaFile,
                path.extname(mediaFile)
              );

              const patterns = [
                // Direct paths
                // 先頭スラッシュ付きの直接パス
                `/${mediaFile}`,
                `"/${mediaFile}"`,
                `'/${mediaFile}'`,
                `\`/${mediaFile}\``,
                // Without leading slash
                // 先頭スラッシュなしのパス
                mediaFile,
                `"${mediaFile}"`,
                `'${mediaFile}'`,
                `\`${mediaFile}\``,
                // Just filename
                // ファイル名のみ
                fileName,
                `"${fileName}"`,
                `'${fileName}'`,
                `\`${fileName}\``,
                // Filename without extension
                // 拡張子なしのファイル名
                fileNameWithoutExt,
                // CSS url() patterns
                // CSSの url() パターン
                `url(/${mediaFile})`,
                `url("/${mediaFile}")`,
                `url('/${mediaFile}')`,
                `url(${mediaFile})`,
                `url("${mediaFile}")`,
                `url('${mediaFile}')`,
                // Next.js Image component patterns
                // Next.js Imageコンポーネントの参照パターン
                `src={"/${mediaFile}"}`,
                `src={'/${mediaFile}'}`,
                `src={\`/${mediaFile}\`}`,
                `src="${mediaFile}"`,
                `src='${mediaFile}'`,
              ];

              const staticPatternCheck = patterns.some((pattern) => {
                return contentLower.includes(pattern.toLowerCase());
              });

              // Dynamic pattern detection using regex
              // 正規表現で動的参照っぽい記述も検出
              const dynamicPatterns = [
                new RegExp(`['"\`].*${escapeRegExp(fileName)}['"\`]`, 'i'),
                new RegExp(
                  `['"\`].*${escapeRegExp(fileNameWithoutExt)}.*['"\`]`,
                  'i'
                ),
              ];

              const dynamicPatternCheck = dynamicPatterns.some((regex) =>
                regex.test(content)
              );

              if (staticPatternCheck || dynamicPatternCheck) {
                unusedFiles.delete(mediaFile);
              }
            }
          }
        } catch (error) {
          console.warn(`Error reading file ${file.fsPath}: ${error}`);
        }
      })
    );

    processedFiles += batch.length;

    // Update progress more frequently
    // 進捗表示をより高頻度で更新
    vscode.window.setStatusBarMessage(
      t(
        'extension.checkingProgress',
        processedFiles.toString(),
        totalFiles.toString()
      ),
      1000
    );
  }

  return Array.from(unusedFiles);
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function showResults(
  unusedFiles: string[],
  publicPath: string,
  allMediaFiles: string[]
) {
  // Update file decorations
  // 検出結果に基づいてファイルデコレーションを更新
  decorationProvider.updateFileStatus(publicPath, unusedFiles, allMediaFiles);

  if (unusedFiles.length === 0) {
    vscode.window.showInformationMessage(t('extension.allFilesUsed'));
    return;
  }

  // Calculate total size
  // 未使用ファイルの合計サイズを計算
  const totalSize = unusedFiles.reduce((sum, file) => {
    const filePath = path.join(publicPath, file);
    try {
      const stats = fs.statSync(filePath);
      return sum + stats.size;
    } catch {
      return sum;
    }
  }, 0);

  // Show simple notification with summary
  // 概要（件数・容量）を通知で表示
  const message = t(
    'extension.summaryMessage',
    unusedFiles.length.toString(),
    formatFileSize(totalSize)
  );

  vscode.window
    .showInformationMessage(message, t('extension.openFolder'))
    .then(async (selection) => {
      if (selection === t('extension.openFolder')) {
        try {
          await vscode.commands.executeCommand('workbench.view.explorer');
        } catch (_ignoredError) {
          // Intentionally ignore; fallbacks handle next step.
          // ここは失敗しても後続のフォールバックで対応するため無視する
        }
        try {
          await vscode.commands.executeCommand(
            'revealInExplorer',
            vscode.Uri.file(publicPath)
          );
        } catch (_ignoredError) {
          // Intentionally ignore; try OS-level reveal next.
          // ここは失敗してもOS側で開くフォールバックを試すため無視する
          try {
            await vscode.commands.executeCommand(
              'revealFileInOS',
              vscode.Uri.file(publicPath)
            );
          } catch (_ignoredError) {
            // Final fallback: open via OS default handler.
            // 最後の手段としてOS既定のハンドラで開く
            await vscode.env.openExternal(vscode.Uri.file(publicPath));
          }
        }
      }
    });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return `0 ${t('bytes')}`;
  }
  const k = 1024;
  const sizes = [t('bytes'), t('kb'), t('mb'), t('gb')];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function deactivate() {
  // Extension cleanup logic would go here if needed
  // 拡張機能のクリーンアップ処理（必要になったら実装）
}

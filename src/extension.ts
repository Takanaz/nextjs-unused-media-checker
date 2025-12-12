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

  // Build indexes for fast lookups
  // 高速化のためのインデックス（パス一致 / basename一致）を作成
  const mediaByPathLower = new Map<string, string>();
  const mediaByBasenameLower = new Map<string, string[]>();

  for (const mediaFile of mediaFiles) {
    const normalized = mediaFile.replace(/\\/g, '/');
    const key = normalized.toLowerCase();
    mediaByPathLower.set(key, mediaFile);

    const base = path.posix.basename(normalized).toLowerCase();
    const list = mediaByBasenameLower.get(base) ?? [];
    list.push(mediaFile);
    mediaByBasenameLower.set(base, list);
  }

  const EXTERNAL_URL_RE = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;
  const DATA_URL_RE = /^data:/i;

  function normalizeCandidate(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }
    if (EXTERNAL_URL_RE.test(trimmed) || DATA_URL_RE.test(trimmed)) {
      return null;
    }

    // Normalize slashes, strip query/hash, and remove leading prefixes
    // パスの区切りを統一し、クエリ/ハッシュを除去し、先頭のプレフィックス除去
    let value = trimmed.replace(/\\/g, '/');
    value = value.split('?')[0]?.split('#')[0] ?? value;
    value = value.replace(/^\.\/+/, '');
    value = value.replace(/^\/+/, '');
    value = value.replace(/^public\/+/, '');

    value = value.trim();
    return value ? value.toLowerCase() : null;
  }

  function markUsedByCandidate(candidateLower: string) {
    const direct = mediaByPathLower.get(candidateLower);
    if (direct) {
      unusedFiles.delete(direct);
      return;
    }

    // basename-only references can be ambiguous. Only mark used if unique.
    // ファイル名のみの参照は曖昧になり得るため、ユニークな場合のみ「使用中」とみなす
    const base = path.posix.basename(candidateLower);
    const matches = mediaByBasenameLower.get(base);
    if (matches && matches.length === 1) {
      unusedFiles.delete(matches[0]);
    }
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

          // Extract candidates from url() and string literals, then match against indexes.
          // url() や文字列リテラルから候補を抽出し、インデックスと照合
          const urlRe = /url\(\s*(['"`]?)([^'"`)\r\n]+)\1\s*\)/gi;
          const strRe = /['"`]([^'"`\r\n]+)['"`]/g;

          for (const match of content.matchAll(urlRe)) {
            if (token.isCancellationRequested) {
              return;
            }
            const candidate = normalizeCandidate(match[2] ?? '');
            if (candidate) {
              markUsedByCandidate(candidate);
            }
          }

          for (const match of content.matchAll(strRe)) {
            if (token.isCancellationRequested) {
              return;
            }
            const raw = match[1] ?? '';
            // Heuristic: only consider strings that look like paths/filenames
            // Heuristic: パス/ファイル名っぽい文字列のみを候補として扱う
            if (
              !raw.includes('/') &&
              !raw.includes('.') &&
              !raw.includes('\\')
            ) {
              continue;
            }
            const candidate = normalizeCandidate(raw);
            if (candidate) {
              markUsedByCandidate(candidate);
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

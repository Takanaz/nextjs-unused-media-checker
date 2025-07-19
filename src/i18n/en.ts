export const en = {
  // Extension messages
  "extension.activated": "Next.js Unused Media Checker is now active!",
  "extension.noWorkspace": "No workspace folder found",
  "extension.noPublicDirectory": "No public directory found in the workspace",
  "extension.checkingFiles": "Checking for unused media files...",
  "extension.foundFiles": "Found media files...",
  "extension.analysisComplete": "Analysis complete!",
  "extension.allFilesUsed":
    "All media files in the public directory are being used!",
  "extension.errorChecking": "Error checking unused media: {0}",
  "extension.unableToOpenFile": "Unable to open file: {0}",
  "extension.checkingProgress": "Checking files: {0}/{1}",
  "extension.summaryMessage":
    "Found {0} unused media files ({1}). Check file explorer for decorations.",
  "extension.openFolder": "Open Public Folder",

  // Webview content
  "webview.title": "Unused Media Files in Public Directory",
  "webview.totalFiles": "Total unused files",
  "webview.totalSize": "Total size",
  "webview.averageSize": "Average file size",
  "webview.filePath": "File Path",
  "webview.size": "Size",
  "webview.lastModified": "Last Modified",
  "webview.copyFileList": "Copy File List",
  "webview.exportAsJson": "Export as JSON",
  "webview.unknown": "Unknown",
  "webview.copySuccess": "File list copied to clipboard!",
  "webview.exportFileName": "unused-media-files.json",

  // Tips
  "tips.title": "Tips",
  "tips.clickFile": "Click on a file name to open it in the editor",
  "tips.sortedFiles": "Files are sorted by directory and then by name",
  "tips.checkedFiles":
    "This tool checks for file references in JS, TS, CSS, HTML, JSON, and Markdown files",
  "tips.dynamicDetection":
    "Dynamic imports and template literals are also detected",

  // File formats
  bytes: "Bytes",
  kb: "KB",
  mb: "MB",
  gb: "GB",

  // Error messages
  "error.directoryRead": "Unable to read directory {0}: {1}",
  "error.fileProcess": "Unable to process {0}: {1}",
  "error.fileRead": "Unable to read file {0}: {1}",

  // Configuration
  "config.title": "Next.js Unused Media Checker",
  "config.excludePatterns.description": "Patterns to exclude from file search",
  "config.mediaExtensions.description":
    "File extensions to consider as media files",
  "config.publicDirectory.description": "Name of the public directory to scan",

  // Commands
  "command.checkUnusedMedia": "Check Unused Media Files",

  // File decorations
  "decoration.unused": "This media file is not used in the project",
  "decoration.used": "This media file is used in the project",
} as const;

export type MessageKey = keyof typeof en;

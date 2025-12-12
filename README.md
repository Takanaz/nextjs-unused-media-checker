# Next.js Unused Media Checker

<p align="center">
  <img src="https://img.shields.io/visual-studio-marketplace/v/Takanaz.nextjs-unused-media-checker?style=for-the-badge&logo=visual-studio-code" alt="Version">
  <img src="https://img.shields.io/visual-studio-marketplace/d/Takanaz.nextjs-unused-media-checker?style=for-the-badge" alt="Downloads">
  <img src="https://img.shields.io/github/license/Takanaz/nextjs-unused-media-checker?style=for-the-badge" alt="License">
  <a href="https://open-vsx.org/extension/takanaz/nextjs-unused-media-checker"><img src="https://img.shields.io/open-vsx/v/takanaz/nextjs-unused-media-checker?label=Open%20VSX&style=for-the-badge" alt="Open VSX"></a>
</p>

<p align="center"> 
English | <a href='./README.ja.md'>日本語</a> 
</p>

A powerful **VS Code extension** that automatically detects unused media files in your Next.js project's `public` directory, helping you **optimize your bundle size** and keep your codebase clean, and be very useful for refactoring.

---

## Key Features

- **Visual File Decorations**: Instantly see unused (!) and used (✓) media files directly in the Explorer
- **High Performance**: Parallel processing with smart batching for large projects
- **Smart Detection**: Finds references in JS/TS, CSS, HTML, JSON, and Markdown files
- **Multilingual**: English and Japanese interface support
- **Highly Configurable**: Customize file types, exclude patterns, and directories
- **Zero Dependencies**: No external services - all processing happens locally

## Supported File Types

**Images:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.webp`, `.ico`, `.avif`, `.bmp`, `.tiff`  
**Videos:** `.mp4`, `.webm`, `.avi`, `.mov`  
**Audio:** `.mp3`, `.ogg`, `.wav`

## Quick Start

### Installation

1. Install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Takanaz.nextjs-unused-media-checker)
2. Or install from [Open VSX Registry](https://open-vsx.org/extension/takanaz/nextjs-unused-media-checker) (for Cursor, VSCodium, etc.)
3. Or search "Next.js Unused Media Checker" in the Extensions tab

### Usage

1. **Open** your Next.js project in VS Code
2. **Run command**: `Ctrl/Cmd + Shift + P` → `Check Unused Media Files`
3. **View results** instantly in the Explorer:
   - ！ **Red warning** = Unused media files
   - ✓ **Green check** = Used media files
4. **Manage files**: Click notification to open public folder

## How It Works

The extension performs **intelligent analysis** to detect media file usage across your entire project:

### Scan Targets

- **JavaScript/TypeScript**: `.js`, `.jsx`, `.ts`, `.tsx`
- **Stylesheets**: `.css`, `.scss`, `.sass`, `.less`
- **Markup**: `.html`, `.md`, `.mdx`
- **Data**: `.json`

### Detection Patterns

- **Direct imports**: `import logo from '/logo.png'`
- **Next.js Image**: `<Image src="/hero.jpg" />`
- **CSS backgrounds**: `background: url('/bg.png')`
- **Dynamic references**: Template literals and computed paths
- **Case-insensitive**: Matches regardless of filename casing

## Configuration

Customize the extension behavior via VS Code settings (`Settings` → search "nextjs unused"):

| Setting           | Description                          | Default                       |
| ----------------- | ------------------------------------ | ----------------------------- |
| `publicDirectory` | Directory to scan for media files    | `"public"`                    |
| `mediaExtensions` | File extensions to consider as media | `[".jpg", ".png", ...]`       |
| `excludePatterns` | Patterns to exclude from search      | `["**/node_modules/**", ...]` |

<details>
<summary> Example Configuration</summary>

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

## Performance Features

- **Parallel Processing**: Batch processing with Promise.all for maximum speed
- **Smart Filtering**: Skips large files (>1MB) automatically
- **Optimized Data Structures**: Set/Map usage for O(1) lookups
- **Cancellable Operations**: User can stop long-running scans
- **Memory Efficient**: Processes files in small batches

## Development

Interested in contributing? Check out our development resources:

- **[Developer Guide](DEVELOPER.md)** - Comprehensive development setup and workflow
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute to the project

For a quick start, see the [Environment Setup](DEVELOPER.md#environment-setup) section in the Developer Guide.

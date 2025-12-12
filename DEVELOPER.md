# Developer Guide

English | [日本語](DEVELOPER.ja.md)

This guide provides comprehensive information for developers who want to contribute to or understand the Next.js Unused Media Checker extension.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Development Workflow](#development-workflow)
- [Architecture Overview](#architecture-overview)
- [Testing](#testing)
- [Build & Package](#build--package)
- [Debugging](#debugging)
- [Code Quality](#code-quality)
- [Release Process](#release-process)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: Version 18 or higher
- **yarn**: Latest version (comes with Node.js)
- **VS Code**: Latest version
- **Git**: For version control

### Recommended Tools

- **VS Code Extensions**:
  - TypeScript and JavaScript Language Features
  - Biome (for linting and formatting)
  - Extension Test Runner
- **Terminal**: Any modern terminal (PowerShell, Bash, Zsh)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Takanaz/nextjs-unused-media-checker.git
cd nextjs-unused-media-checker
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Initial Build

```bash
yarn run compile
```

### 4. Verify Setup

```bash
# Run type checking
yarn run check-types

# Run code quality checks
yarn run check

# Run tests
yarn test
```

## Development Workflow

### Starting Development

```bash
# Start watch mode for automatic rebuilding
yarn run watch
```

This command runs multiple watchers in parallel:

- `esbuild` watcher for TypeScript compilation
- TypeScript compiler for type checking

### Opening Extension Host

1. Open the project in VS Code
2. Press `F5` or go to `Run and Debug` → `Run Extension`
3. A new VS Code window opens with your extension loaded
4. Test your changes in this Extension Development Host

### Development Commands

```bash
# Build for development
yarn run compile

# Build for production
yarn run package

# Type checking only
yarn run check-types

# Code quality check (lint + format)
yarn run check

# Auto-fix code quality issues
yarn run check:fix

# Format code only
yarn run format
yarn run format:fix

# Run all tests
yarn test

# Create VSIX package
yarn run package
```

## Architecture Overview

### Project Structure

```
src/
├── extension.ts          # Main extension entry point
├── i18n/                # Internationalization
│   ├── index.ts         # i18n loader
│   ├── en.ts           # English translations
│   └── ja.ts           # Japanese translations
└── test/
    └── extension.test.ts # Extension tests

dist/                    # Compiled output
out/                     # Test compilation output
.github/workflows/       # CI/CD workflows
images/                  # Extension assets
```

### Key Components

#### Extension Activation

- **Entry Point**: `src/extension.ts`
- **Activation Events**: `workspaceContains:**/package.json`
- **Commands**: `nextjs-unused-media-checker.checkUnusedMedia`

#### Core Functionality

- **Media Detection**: Scans public directory for media files
- **Usage Analysis**: Searches source files for media references
- **File Decorations**: Shows status in VS Code Explorer
- **Pattern Matching**: Supports various import/reference patterns

#### Internationalization

- **Supported Languages**: English, Japanese
- **Implementation**: Dynamic loading based on VS Code language
- **Files**: `package.nls.json`, `package.nls.ja.json`

## Testing

### Test Structure

Tests are located in `src/test/extension.test.ts` and use the Mocha framework.

### Test Categories

1. **Media File Detection Tests**

   - Various file format support
   - Subdirectory handling
   - Symbolic link handling

2. **Usage Detection Tests**

   - Direct file references
   - CSS `url()` patterns
   - Next.js Image components
   - Case-insensitive matching

3. **Configuration Tests**

   - Custom media extensions
   - Exclude patterns
   - Public directory configuration

4. **Error Handling Tests**
   - File read errors
   - Invalid configurations

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn run watch-tests

# Compile tests only
yarn run compile-tests
```

### Writing Tests

```typescript
suite("Your Test Suite", () => {
  test("should do something", async () => {
    // Setup test environment
    // Execute functionality
    // Assert results
  });
});
```

## Build & Package

### Development Build

```bash
yarn run compile
```

This creates a development build with:

- Source maps enabled
- No minification
- Fast compilation

### Production Build

```bash
yarn run package
```

This creates a production build with:

- Minification enabled
- Source maps disabled
- Optimized for size

### Creating VSIX Package

```bash
# Ensure you have vsce installed globally
yarn add -G vsce

# Create package
vsce package

# This creates: nextjs-unused-media-checker-X.X.X.vsix
```

### Open VSX (for Cursor/VSCodium, etc.) Packaging/Publishing

To publish to Open VSX Registry, use the `ovsx` CLI.

```bash
# Prerequisite: create an Open VSX Personal Access Token and set it as an env var
export OVSX_PAT=your_open_vsx_personal_access_token

# Create a package (optional)
yarn run ovsx:package

# Publish
yarn run ovsx:publish

# Or run build -> publish in one go
yarn run release:ovsx
```

Notes:

- The Open VSX extension ID is typically `publisher.name`. For this project: `Takanaz.nextjs-unused-media-checker`.
- The `publisher` must exist on Open VSX. If you haven't created it yet, create an organization/publisher on Open VSX and ensure your account has permission to publish under it.

## Debugging

### Extension Debugging

1. Set breakpoints in TypeScript files
2. Press `F5` to start debugging
3. Use the Debug Console for output
4. The extension runs in a separate Extension Host process

### Debug Configuration

The `.vscode/launch.json` should contain:

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
      "preLaunchTask": "${workspaceFolder}/yarn: watch"
    }
  ]
}
```

### Logging

Use the extension's output channel:

```typescript
import * as vscode from "vscode";

const outputChannel = vscode.window.createOutputChannel(
  "Next.js Unused Media Checker"
);
outputChannel.appendLine("Debug message");
outputChannel.show();
```

## Code Quality

### Biome Configuration

The project uses Biome for linting and formatting. Configuration is in `biome.json`.

### Code Style Guidelines

- **TypeScript**: Strict mode enabled
- **Formatting**: 2-space indentation, single quotes
- **Imports**: Organized automatically
- **Naming**: camelCase for variables, PascalCase for classes

### Pre-commit Hooks

```bash
# Install lefthook if not already installed
yarn add -G lefthook

# Install hooks
lefthook install
```

This ensures code quality checks run before commits.

## Release Process

### Automated Release (Recommended)

1. **Update Version**: Modify `package.json` version
2. **Update Changelog**: Add changes to `CHANGELOG.md`
3. **Merge to Production**:
   ```bash
   git checkout develop
   git pull origin develop
   # Make your changes
   git checkout production
   git merge develop
   git push origin production
   ```
4. **GitHub Actions**: Automatically creates tag, release, and publishes to marketplace

### Manual Release

```bash
# Build and test
yarn run package
yarn test

# Create and push tag
git tag -a v0.1.1 -m "Release version 0.1.1"
git push origin v0.1.1

# Publish to marketplace
vsce publish
```

### Release Checklist

- [ ] Version number updated in `package.json`
- [ ] `CHANGELOG.md` updated
- [ ] All tests passing
- [ ] Code quality checks passing
- [ ] Documentation updated
- [ ] VSIX package builds successfully

## Troubleshooting

### Common Issues

#### Extension Not Loading

```bash
# Check compilation
yarn run compile

# Check for TypeScript errors
yarn run check-types
```

#### Tests Failing

```bash
# Ensure test compilation
yarn run compile-tests

# Check test environment
yarn run pretest
```

#### Package Build Fails

```bash
# Clean and rebuild
rm -rf dist/ out/
yarn run compile
yarn run package
```

#### VS Code Integration Issues

```bash
# Reload VS Code window
# Command Palette: "Developer: Reload Window"

# Check extension host logs
# Help > Toggle Developer Tools > Console
```

### Debug Environment Variables

```bash
# Enable verbose logging
export VSCODE_EXTENSION_DEBUG=1

# Enable extension host debugging
export VSCODE_EXTENSION_HOST_DEBUG=1
```

### Performance Profiling

Use VS Code's built-in profiling:

1. Command Palette: "Developer: Startup Performance"
2. Command Palette: "Developer: Profile Extension Host"

## Contributing

For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/Takanaz/nextjs-unused-media-checker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Takanaz/nextjs-unused-media-checker/discussions)
- **Email**: takanaz.dev@gmail.com

## Additional Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Biome Documentation](https://biomejs.dev/)

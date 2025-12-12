# Changelog

English | [日本語](CHANGELOG.ja.md)

All notable changes to the "nextjs-unused-media-checker" extension will be documented in this file.

## [0.1.8]

- Security: address js-yaml prototype pollution advisory by forcing js-yaml@4.1.1 via pnpm overrides

## [0.1.7]

- Change Namespaces of Open VSX Registry (ovsx)

## [0.1.6]

- Improve unused detection accuracy by reducing false positives from plain filename-stem matches
- Improve detection performance by extracting reference candidates from `url()` and string literals instead of scanning every media file against every source file
- Reduce ambiguous basename-only matches (only treat as used when unique)
- Improve workspace compatibility by using `vscode.workspace.fs` for file reads/stats and correctly applying exclude patterns in `findFiles`
- Add Aikido Safe Chain to CI to protect dependency installs (malware action: block)
- Add Japanese comments alongside existing code comments

## [0.1.5]

- Migrate from npm/yarn to pnpm (including CI)
- Security: address glob CLI command injection advisory by forcing glob@10.5.0 via pnpm overrides

## [0.1.4]

- Add publishing support for Open VSX Registry (ovsx)
- Expand Japanese documentation (add Japanese versions of docs and cross-links)

## [0.1.3]

- Ensure that VSCode-compatible editors reliably open the public folder

## [0.1.2]

- Fixed GitHub Actions workflow for automated publishing
- Updated CI/CD pipeline to use Node.js 20 and latest @vscode/vsce
- Improved release automation and error handling

## [0.1.1]

- Migrated from ESLint to Biome for better performance and consistency
- Updated development commands and documentation
- Improved code formatting and linting workflow

## [0.1.0]

- Initial release
- Media file detection in public directory
- File decorations in Explorer ( ！ with ref for unused, ✓ with green for used files )
- High-performance parallel file processing
- Internationalization support (English, Japanese)
- Configurable exclude patterns and media extensions
- Summary notifications with public folder access
- Advanced pattern detection:

  - Direct file references
  - CSS url() patterns
  - Next.js Image component patterns
  - Dynamic imports and template literals
  - Case-insensitive matching

- Batch processing with 1MB file size limit
- Cancellable operations
- Comprehensive error handling
- TypeScript strict mode
- Full test coverage
- Biome configuration for linting and formatting

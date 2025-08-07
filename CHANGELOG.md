# Change Log

All notable changes to the "nextjs-unused-media-checker" extension will be documented in this file.

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

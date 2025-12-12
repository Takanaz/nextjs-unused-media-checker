# Security Policy

English | [日本語](SECURITY.ja.md)

## Data Privacy

This extension:

- **Does NOT collect any personal data**
- **Does NOT send data to external servers**
- **Only analyzes files locally within your workspace**
- **Does NOT access files outside your project directory**

## File Access

The extension only accesses:

- Files within your workspace directory
- Files matching the configured media extensions
- Source code files for reference detection

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.4   | :white_check_mark: |

## Security Best Practices

- Extension runs entirely in VS Code's sandbox
- No network requests are made
- No external dependencies at runtime
- Source code is available for audit

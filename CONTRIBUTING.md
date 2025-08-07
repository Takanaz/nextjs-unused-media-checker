# Contributing to Next.js Unused Media Checker

Thank you for your interest in contributing to this project! 🎉

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- VS Code or Cursor
- Git

### Development Setup

1. **Fork & Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/nextjs-unused-media-checker.git
   cd nextjs-unused-media-checker
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start Development**

   ```bash
   npm run watch
   # or
   yarn run watch
   ```

4. **Run Tests**
   ```bash
   npm test
   # or
   yarn test
   ```

## 🛠️ Development Workflow

### Building

```bash
# Development build
npm run compile

# Production build
npm run package

# Type checking
npm run check-types

# Code checking and formatting
npm run check
npm run check:fix
```

### Testing Extension

```bash
# Create VSIX package
npm run package
vsce package

# Install locally
code --install-extension nextjs-unused-media-checker-*.vsix
```

## 📋 Contributing Guidelines

### Code Style

- Follow existing TypeScript conventions
- Use Biome for linting and formatting
- Write meaningful commit messages
- Add tests for new features

### Pull Request Process

1. **Create a branch** from `develop`

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Write code following our style guide
   - Add tests if applicable
   - Update documentation

3. **Test thoroughly**

   ```bash
   npm test
   npm run check
   npm run check-types
   ```

4. **Commit with clear messages**

   ```bash
   git commit -m "feat: add support for additional media formats"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 🐛 Reporting Issues

### Bug Reports

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests

Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation (if any)

## 📝 Areas for Contribution

### High Priority

- 🔍 **Detection Patterns**: Improve media file usage detection
- 🚀 **Performance**: Optimize scanning for large projects
- 🌐 **i18n**: Add more language translations
- 🧪 **Testing**: Increase test coverage

### Medium Priority

- 📱 **Framework Support**: Support for other frameworks
- 🎨 **UI/UX**: Improve user interface and experience
- 📊 **Analytics**: Better reporting and statistics
- ⚙️ **Configuration**: More customization options

### Good First Issues

Look for issues labeled `good first issue` - these are perfect for new contributors!

## 🤝 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professional communication

### Enforcement

Project maintainers are responsible for clarifying standards and will take appropriate action for unacceptable behavior.

## 📞 Getting Help

- 💬 **Issues**: For bugs and feature requests
- 📧 **Email**: takanaz.dev@gmail.com for security issues
- 📖 **Documentation**: Check README.md first

## 🙏 Recognition

Contributors will be:

- Listed in our README.md
- Mentioned in release notes
- Given credit in commit messages

Thank you for contributing to make Next.js development more efficient! 🚀

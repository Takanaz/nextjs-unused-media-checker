import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { promises as fsPromises } from "fs";
import * as os from "os";

// Mock workspace configuration
const createMockConfig = (values: Record<string, unknown> = {}) => ({
  get: (key: string, defaultValue?: unknown) => {
    return values[key] !== undefined ? values[key] : defaultValue;
  },
  update: () => Promise.resolve(),
  inspect: () => undefined,
  has: (key: string) => values[key] !== undefined,
});

suite("Extension Test Suite", () => {
  let tempDir: string;
  let publicDir: string;
  let srcDir: string;

  suiteSetup(async () => {
    // Create temporary directory structure for testing
    tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "nextjs-test-"));
    publicDir = path.join(tempDir, "public");
    srcDir = path.join(tempDir, "src");
    
    await fsPromises.mkdir(publicDir, { recursive: true });
    await fsPromises.mkdir(srcDir, { recursive: true });
  });

  suiteTeardown(async () => {
    // Clean up temporary directory
    if (tempDir) {
      await fsPromises.rm(tempDir, { recursive: true, force: true });
    }
  });

  suite("Media File Detection", () => {
    test("should detect various media file types", async () => {
      // Create test media files
      const mediaFiles = [
        "image.jpg",
        "photo.PNG", // Test case insensitive
        "icon.svg",
        "video.mp4",
        "audio.mp3",
        "modern.webp",
        "favicon.ico",
        "animation.gif",
        "background.jpeg",
        "movie.webm",
        "sound.ogg",
        "picture.avif",
        "document.bmp",
        "large.tiff",
        "clip.avi",
        "track.wav",
        "film.mov"
      ];

      for (const file of mediaFiles) {
        await fsPromises.writeFile(path.join(publicDir, file), "test content");
      }

      // Import and test the findMediaFiles function
      const { findMediaFiles } = await import("../extension.js");
      const result = await findMediaFiles(publicDir);

      assert.strictEqual(result.length, mediaFiles.length);
      
      // Check that all media files are detected
      for (const file of mediaFiles) {
        assert.ok(result.includes(file), `Should detect ${file}`);
      }
    });

    test("should ignore non-media files", async () => {
      // Create non-media files
      const nonMediaFiles = [
        "script.js",
        "style.css",
        "data.json",
        "readme.txt",
        "config.xml"
      ];

      for (const file of nonMediaFiles) {
        await fsPromises.writeFile(path.join(publicDir, file), "test content");
      }

      const { findMediaFiles } = await import("../extension.js");
      const result = await findMediaFiles(publicDir);

      // Should not detect non-media files
      for (const file of nonMediaFiles) {
        assert.ok(!result.includes(file), `Should not detect ${file}`);
      }
    });

    test("should handle subdirectories", async () => {
      // Create subdirectory structure
      const subDir = path.join(publicDir, "images", "gallery");
      await fsPromises.mkdir(subDir, { recursive: true });

      const subDirFile = "nested.jpg";
      await fsPromises.writeFile(path.join(subDir, subDirFile), "test content");

      const { findMediaFiles } = await import("../extension.js");
      const result = await findMediaFiles(publicDir);

      const expectedPath = path.join("images", "gallery", subDirFile);
      assert.ok(result.includes(expectedPath), `Should detect file in subdirectory: ${expectedPath}`);
    });

    test("should handle symbolic links correctly", async () => {
      const realFile = path.join(publicDir, "real.jpg");
      const linkDir = path.join(publicDir, "link-dir");
      
      await fsPromises.writeFile(realFile, "test content");
      
      try {
        await fsPromises.symlink(publicDir, linkDir);
        
        const { findMediaFiles } = await import("../extension.js");
        const result = await findMediaFiles(publicDir);
        
        // Should detect the real file but not follow the symbolic link
        assert.ok(result.includes("real.jpg"));
        // Should not have duplicate entries from following symlinks
        const realFileCount = result.filter((file: string) => file === "real.jpg").length;
        assert.strictEqual(realFileCount, 1);
      } catch (error) {
        // Skip test if symlinks are not supported (e.g., Windows without admin rights)
        console.warn("Skipping symlink test:", error);
      }
    });
  });

  suite("Usage Detection", () => {
    test("should detect direct file references", async () => {
      // Create test files
      await fsPromises.writeFile(path.join(publicDir, "used.jpg"), "test content");
      await fsPromises.writeFile(path.join(publicDir, "unused.jpg"), "test content");

      // Create source file that references used.jpg
      const sourceContent = `
        import React from 'react';
        const MyComponent = () => {
          return <img src="/used.jpg" alt="test" />;
        };
        export default MyComponent;
      `;
      await fsPromises.writeFile(path.join(srcDir, "component.tsx"), sourceContent);

      // Mock vscode.workspace.findFiles
      const originalFindFiles = vscode.workspace.findFiles;
      vscode.workspace.findFiles = async () => [
        { fsPath: path.join(srcDir, "component.tsx") } as vscode.Uri
      ];

      // Mock vscode.workspace.getConfiguration
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = () => createMockConfig();

      try {
        const { findUnusedMediaFiles } = await import("../extension.js");
        const mockToken = { isCancellationRequested: false } as vscode.CancellationToken;
        const result = await findUnusedMediaFiles(["used.jpg", "unused.jpg"], mockToken);

        assert.strictEqual(result.length, 1);
        assert.ok(result.includes("unused.jpg"));
        assert.ok(!result.includes("used.jpg"));
      } finally {
        vscode.workspace.findFiles = originalFindFiles;
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test("should detect CSS url() references", async () => {
      await fsPromises.writeFile(path.join(publicDir, "background.jpg"), "test content");

      const cssContent = `
        .hero {
          background-image: url('/background.jpg');
        }
      `;
      await fsPromises.writeFile(path.join(srcDir, "styles.css"), cssContent);

      const originalFindFiles = vscode.workspace.findFiles;
      vscode.workspace.findFiles = async () => [
        { fsPath: path.join(srcDir, "styles.css") } as vscode.Uri
      ];

      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = () => createMockConfig();

      try {
        const { findUnusedMediaFiles } = await import("../extension.js");
        const mockToken = { isCancellationRequested: false } as vscode.CancellationToken;
        const result = await findUnusedMediaFiles(["background.jpg"], mockToken);

        assert.strictEqual(result.length, 0, "Should detect CSS url() reference");
      } finally {
        vscode.workspace.findFiles = originalFindFiles;
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test("should detect Next.js Image component references", async () => {
      await fsPromises.writeFile(path.join(publicDir, "hero.png"), "test content");

      const jsxContent = `
        import Image from 'next/image';
        const Hero = () => {
          return <Image src="/hero.png" alt="hero" width={800} height={600} />;
        };
      `;
      await fsPromises.writeFile(path.join(srcDir, "hero.tsx"), jsxContent);

      const originalFindFiles = vscode.workspace.findFiles;
      vscode.workspace.findFiles = async () => [
        { fsPath: path.join(srcDir, "hero.tsx") } as vscode.Uri
      ];

      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = () => createMockConfig();

      try {
        const { findUnusedMediaFiles } = await import("../extension.js");
        const mockToken = { isCancellationRequested: false } as vscode.CancellationToken;
        const result = await findUnusedMediaFiles(["hero.png"], mockToken);

        assert.strictEqual(result.length, 0, "Should detect Next.js Image component reference");
      } finally {
        vscode.workspace.findFiles = originalFindFiles;
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test("should handle case-insensitive matching", async () => {
      await fsPromises.writeFile(path.join(publicDir, "Logo.PNG"), "test content");

      const content = `<img src="/logo.png" alt="logo" />`;
      await fsPromises.writeFile(path.join(srcDir, "index.html"), content);

      const originalFindFiles = vscode.workspace.findFiles;
      vscode.workspace.findFiles = async () => [
        { fsPath: path.join(srcDir, "index.html") } as vscode.Uri
      ];

      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = () => createMockConfig();

      try {
        const { findUnusedMediaFiles } = await import("../extension.js");
        const mockToken = { isCancellationRequested: false } as vscode.CancellationToken;
        const result = await findUnusedMediaFiles(["Logo.PNG"], mockToken);

        assert.strictEqual(result.length, 0, "Should detect case-insensitive reference");
      } finally {
        vscode.workspace.findFiles = originalFindFiles;
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });
  });

  suite("Configuration", () => {
    test("should use custom media extensions", async () => {
      const customExtensions = [".jpg", ".png"];
      
      // Create files with different extensions
      await fsPromises.writeFile(path.join(publicDir, "image.jpg"), "test content");
      await fsPromises.writeFile(path.join(publicDir, "image.png"), "test content");
      await fsPromises.writeFile(path.join(publicDir, "image.gif"), "test content"); // Should be ignored

      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = () => createMockConfig({
        mediaExtensions: customExtensions
      });

      try {
        const { findMediaFiles } = await import("../extension.js");
        const result = await findMediaFiles(publicDir);

        assert.strictEqual(result.length, 2);
        assert.ok(result.includes("image.jpg"));
        assert.ok(result.includes("image.png"));
        assert.ok(!result.includes("image.gif"));
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test("should use custom exclude patterns", async () => {
      await fsPromises.writeFile(path.join(publicDir, "used.jpg"), "test content");
      
      const sourceContent = `<img src="/used.jpg" />`;
      await fsPromises.writeFile(path.join(srcDir, "component.jsx"), sourceContent);

      const originalFindFiles = vscode.workspace.findFiles;
      vscode.workspace.findFiles = async () => [
        { fsPath: path.join(srcDir, "component.jsx") } as vscode.Uri
      ];

      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = () => createMockConfig({
        excludePatterns: ["**/src/**"] // Exclude src directory
      });

      try {
        const { findUnusedMediaFiles } = await import("../extension.js");
        const mockToken = { isCancellationRequested: false } as vscode.CancellationToken;
        const result = await findUnusedMediaFiles(["used.jpg"], mockToken);

        // Should not find the file because src directory is excluded
        assert.strictEqual(result.length, 1);
        assert.ok(result.includes("used.jpg"));
      } finally {
        vscode.workspace.findFiles = originalFindFiles;
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test("should use custom public directory name", async () => {
      const customPublicDir = path.join(tempDir, "assets");
      await fsPromises.mkdir(customPublicDir, { recursive: true });
      await fsPromises.writeFile(path.join(customPublicDir, "logo.png"), "test content");

      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = () => createMockConfig({
        publicDirectory: "assets"
      });

      try {
        const { findMediaFiles } = await import("../extension.js");
        const result = await findMediaFiles(customPublicDir);

        assert.strictEqual(result.length, 1);
        assert.ok(result.includes("logo.png"));
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });
  });

  suite("Error Handling", () => {
    test("should handle file read errors gracefully", async () => {
      const originalFindFiles = vscode.workspace.findFiles;
      vscode.workspace.findFiles = async () => [
        { fsPath: "/nonexistent/file.js" } as vscode.Uri
      ];

      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = () => createMockConfig();

      try {
        const { findUnusedMediaFiles } = await import("../extension.js");
        const mockToken = { isCancellationRequested: false } as vscode.CancellationToken;
        const result = await findUnusedMediaFiles(["test.jpg"], mockToken);

        // Should not throw an error and should return the original list
        assert.strictEqual(result.length, 1);
        assert.ok(result.includes("test.jpg"));
      } finally {
        vscode.workspace.findFiles = originalFindFiles;
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test("should handle directory read errors gracefully", async () => {
      const nonExistentDir = path.join(tempDir, "nonexistent");
      
      const { findMediaFiles } = await import("../extension.js");
      const result = await findMediaFiles(nonExistentDir);

      // Should not throw an error and should return empty array
      assert.strictEqual(result.length, 0);
    });

    test("should handle cancellation token", async () => {
      await fsPromises.writeFile(path.join(publicDir, "test.jpg"), "test content");

      const originalFindFiles = vscode.workspace.findFiles;
      vscode.workspace.findFiles = async () => [
        { fsPath: path.join(srcDir, "test.js") } as vscode.Uri
      ];

      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = () => createMockConfig();

      // Create a cancelled token
      const mockToken = { isCancellationRequested: true } as vscode.CancellationToken;

      try {
        const { findUnusedMediaFiles } = await import("../extension.js");
        const result = await findUnusedMediaFiles(["test.jpg"], mockToken);

        // Should respect cancellation and return original array
        assert.strictEqual(result.length, 1);
        assert.ok(result.includes("test.jpg"));
      } finally {
        vscode.workspace.findFiles = originalFindFiles;
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });
  });

  suite("Utility Functions", () => {
    test("should format file sizes correctly", async () => {
      const { formatFileSize } = await import("../extension.js");

      assert.strictEqual(formatFileSize(0), "0 Bytes");
      assert.strictEqual(formatFileSize(1024), "1 KB");
      assert.strictEqual(formatFileSize(1024 * 1024), "1 MB");
      assert.strictEqual(formatFileSize(1024 * 1024 * 1024), "1 GB");
      assert.strictEqual(formatFileSize(1536), "1.5 KB");
    });

    test("should escape regex patterns correctly", async () => {
      const { escapeRegExp } = await import("../extension.js");

      assert.strictEqual(escapeRegExp("test.jpg"), "test\\.jpg");
      assert.strictEqual(escapeRegExp("image (1).png"), "image \\(1\\)\\.png");
      assert.strictEqual(escapeRegExp("special[chars]"), "special\\[chars\\]");
    });
  });
});
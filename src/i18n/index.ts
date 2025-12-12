import * as vscode from 'vscode';
import { en, type MessageKey } from './en';
import { ja } from './ja';

type Messages = Record<MessageKey, string>;

const messages: Record<string, Messages> = {
  en: en,
  ja: ja as Messages,
};

let currentLocale = 'en';

export function initializeI18n(): void {
  // Get VSCode's locale
  // VS Code のlocale（言語設定）を取得
  const vscodeLocale = vscode.env.language;

  // Map VSCode locale to our supported locales
  // VS Code のlocaleを、この拡張が対応しているlocaleにマッピング
  if (vscodeLocale.startsWith('ja')) {
    currentLocale = 'ja';
  } else {
    currentLocale = 'en';
  }
}

export function t(key: MessageKey, ...args: string[]): string {
  const messageMap = messages[currentLocale] || messages['en'];
  let message: string = messageMap[key] || key;

  // Replace placeholders {0}, {1}, etc. with provided arguments
  // プレースホルダー {0}, {1}... を引数で置換
  args.forEach((arg, index) => {
    message = message.replace(`{${index}}`, arg);
  });

  return message;
}

export function getCurrentLocale(): string {
  return currentLocale;
}

export function setLocale(locale: string): void {
  if (messages[locale]) {
    currentLocale = locale;
  }
}

export function getSupportedLocales(): string[] {
  return Object.keys(messages);
}

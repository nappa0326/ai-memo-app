import { encryptApiKey, decryptApiKey } from './claude';

const API_KEY_STORAGE_KEY = 'ai-memo-app-api-key';

/**
 * APIキーをローカルストレージに保存する
 * @param apiKey 保存するAPIキー
 */
export function saveApiKey(apiKey: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // APIキーを暗号化して保存
    const encryptedApiKey = encryptApiKey(apiKey);
    localStorage.setItem(API_KEY_STORAGE_KEY, encryptedApiKey);
  } catch (error) {
    console.error('Failed to save API key:', error);
  }
}

/**
 * ローカルストレージからAPIキーを取得する
 * @returns 保存されているAPIキー、存在しない場合はnull
 */
export function getApiKey(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const encryptedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!encryptedApiKey) {
      return null;
    }

    // 暗号化されたAPIキーを復号化
    return decryptApiKey(encryptedApiKey);
  } catch (error) {
    console.error('Failed to get API key:', error);
    return null;
  }
}

/**
 * ローカルストレージからAPIキーを削除する
 */
export function removeApiKey(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to remove API key:', error);
  }
}

/**
 * APIキーが設定されているかどうかを確認する
 * @returns APIキーが設定されているかどうか
 */
export function hasApiKey(): boolean {
  return getApiKey() !== null;
}
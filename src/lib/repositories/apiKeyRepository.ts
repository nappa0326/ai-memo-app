import { encryptApiKey, decryptApiKey } from '@/lib/claude';
import * as dbApiKeys from '@/lib/db/apiKeys';

/**
 * APIキーリポジトリのインターフェース
 * 将来的なDB実装への移行を容易にするための抽象化レイヤー
 */
export interface ApiKeyRepository {
  saveApiKey(apiKey: string): Promise<void>;
  getApiKey(): Promise<string | null>;
  removeApiKey(): Promise<void>;
  hasApiKey(): Promise<boolean>;
}

/**
 * ローカルストレージを使用したAPIキーリポジトリの実装
 */
export class LocalStorageApiKeyRepository implements ApiKeyRepository {
  private readonly STORAGE_KEY = 'ai-memo-app-api-key';
  
  /**
   * APIキーをローカルストレージに保存する
   * @param apiKey 保存するAPIキー
   */
  async saveApiKey(apiKey: string): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      // APIキーを暗号化して保存
      const encryptedApiKey = encryptApiKey(apiKey);
      localStorage.setItem(this.STORAGE_KEY, encryptedApiKey);
    } catch (error) {
      console.error('Failed to save API key:', error);
      throw error;
    }
  }
  
  /**
   * ローカルストレージからAPIキーを取得する
   * @returns 保存されているAPIキー、存在しない場合はnull
   */
  async getApiKey(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    
    try {
      const encryptedApiKey = localStorage.getItem(this.STORAGE_KEY);
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
  async removeApiKey(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove API key:', error);
      throw error;
    }
  }
  
  /**
   * APIキーが設定されているかどうかを確認する
   * @returns APIキーが設定されているかどうか
   */
  async hasApiKey(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    return apiKey !== null;
  }
}

/**
 * データベースを使用したAPIキーリポジトリの実装
 */
export class DbApiKeyRepository implements ApiKeyRepository {
  /**
   * APIキーをデータベースに保存する
   * @param apiKey 保存するAPIキー
   */
  async saveApiKey(apiKey: string): Promise<void> {
    // 暗号化したAPIキーを保存
    const encryptedApiKey = encryptApiKey(apiKey);
    const success = await dbApiKeys.saveApiKey(encryptedApiKey);
    if (!success) {
      throw new Error('Failed to save API key to database');
    }
  }
  
  /**
   * データベースからAPIキーを取得する
   * @returns 保存されているAPIキー、存在しない場合はnull
   */
  async getApiKey(): Promise<string | null> {
    const encryptedApiKey = await dbApiKeys.getApiKey();
    if (!encryptedApiKey) {
      return null;
    }
    
    // 暗号化されたAPIキーを復号化
    return decryptApiKey(encryptedApiKey);
  }
  
  /**
   * データベースからAPIキーを削除する
   */
  async removeApiKey(): Promise<void> {
    const success = await dbApiKeys.removeApiKey();
    if (!success) {
      throw new Error('Failed to remove API key from database');
    }
  }
  
  /**
   * APIキーが設定されているかどうかを確認する
   * @returns APIキーが設定されているかどうか
   */
  async hasApiKey(): Promise<boolean> {
    return await dbApiKeys.hasApiKey();
  }
}

/**
 * 現在の環境に適したAPIキーリポジトリのインスタンスを取得する
 * 将来的にDB実装に切り替える際は、この関数を修正するだけで良い
 */
export function getApiKeyRepository(): ApiKeyRepository {
  // データベース実装を返す
  return new DbApiKeyRepository();
}
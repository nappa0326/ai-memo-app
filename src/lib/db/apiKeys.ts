import { sql } from '@vercel/postgres';
import { sqliteDb, isVercelEnv } from './index';

/**
 * APIキーを保存する
 * 既存のAPIキーがある場合は上書きする
 * @param apiKey 保存するAPIキー
 * @returns 保存が成功したかどうか
 */
export async function saveApiKey(apiKey: string): Promise<boolean> {
  try {
    if (isVercelEnv) {
      // Vercel Postgres
      // 既存のAPIキーをすべて削除
      await sql`DELETE FROM api_keys`;
      
      // 新しいAPIキーを保存
      const result = await sql`INSERT INTO api_keys (key) VALUES (${apiKey})`;
      return result.rowCount ? result.rowCount > 0 : false;
    } else {
      // SQLite
      if (!sqliteDb) throw new Error('SQLiteデータベースが初期化されていません');
      
      // 既存のAPIキーをすべて削除
      const deleteStmt = sqliteDb.prepare('DELETE FROM api_keys');
      deleteStmt.run();

      // 新しいAPIキーを保存
      const insertStmt = sqliteDb.prepare('INSERT INTO api_keys (key) VALUES (?)');
      const result = insertStmt.run(apiKey);
      
      return result.changes > 0;
    }
  } catch (error) {
    console.error('Failed to save API key to database:', error);
    return false;
  }
}

/**
 * APIキーを取得する
 * @returns 保存されているAPIキー、存在しない場合はnull
 */
export async function getApiKey(): Promise<string | null> {
  try {
    if (isVercelEnv) {
      // Vercel Postgres
      const { rows } = await sql`SELECT key FROM api_keys ORDER BY created_at DESC LIMIT 1`;
      return rows.length > 0 ? rows[0].key : null;
    } else {
      // SQLite
      if (!sqliteDb) throw new Error('SQLiteデータベースが初期化されていません');
      
      const stmt = sqliteDb.prepare('SELECT key FROM api_keys ORDER BY created_at DESC LIMIT 1');
      const result = stmt.get() as { key: string } | undefined;
      
      return result ? result.key : null;
    }
  } catch (error) {
    console.error('Failed to get API key from database:', error);
    return null;
  }
}

/**
 * APIキーを削除する
 * @returns 削除が成功したかどうか
 */
export async function removeApiKey(): Promise<boolean> {
  try {
    if (isVercelEnv) {
      // Vercel Postgres
      const result = await sql`DELETE FROM api_keys`;
      return result.rowCount ? result.rowCount > 0 : false;
    } else {
      // SQLite
      if (!sqliteDb) throw new Error('SQLiteデータベースが初期化されていません');
      
      const stmt = sqliteDb.prepare('DELETE FROM api_keys');
      const result = stmt.run();
      
      return result.changes > 0;
    }
  } catch (error) {
    console.error('Failed to remove API key from database:', error);
    return false;
  }
}

/**
 * APIキーが存在するかどうかを確認する
 * @returns APIキーが存在するかどうか
 */
export async function hasApiKey(): Promise<boolean> {
  return (await getApiKey()) !== null;
}
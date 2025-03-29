import { sql } from '@vercel/postgres';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// 環境変数でVercel環境かどうかを判断
const isVercelEnv = process.env.VERCEL === '1';

// SQLiteデータベースの初期化（ローカル環境用）
let sqliteDb: Database.Database | null = null;

if (!isVercelEnv) {
  // ローカル環境ではSQLiteを使用
  const dbPath = path.join(process.cwd(), 'data', 'memos.db');
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  sqliteDb = new Database(dbPath);
  
  // メモテーブルを作成（存在しない場合）
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS memos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // APIキーテーブルを作成（存在しない場合）
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('SQLiteデータベーステーブルが初期化されました');
}

// PostgreSQLデータベースの初期化（Vercel環境用）
export async function initPostgresDatabase() {
  if (!isVercelEnv) return; // ローカル環境では実行しない
  
  try {
    // メモテーブルを作成
    await sql`
      CREATE TABLE IF NOT EXISTS memos (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // APIキーテーブルを作成
    await sql`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Postgresデータベーステーブルが初期化されました');
  } catch (error) {
    console.error('Postgresデータベース初期化エラー:', error);
  }
}

// SQLiteデータベース接続をエクスポート
export { sqliteDb, isVercelEnv };

// 型定義はそのまま維持
export interface Memo {
  id: number;
  title: string;
  content: string;
  summary?: string;
  created_at: string;
  updated_at: string;
}

export interface NewMemo {
  title: string;
  content: string;
}

export interface UpdateMemo {
  title?: string;
  content?: string;
  summary?: string;
}
import { sql } from '@vercel/postgres';
import { sqliteDb, isVercelEnv, Memo, NewMemo, UpdateMemo } from './index';

/**
 * すべてのメモを取得する
 * @returns メモの配列
 */
export async function getAllMemos(): Promise<Memo[]> {
  if (isVercelEnv) {
    // Vercel Postgres
    const { rows } = await sql`SELECT * FROM memos ORDER BY updated_at DESC`;
    return rows as Memo[];
  } else {
    // SQLite
    if (!sqliteDb) throw new Error('SQLiteデータベースが初期化されていません');
    const stmt = sqliteDb.prepare('SELECT * FROM memos ORDER BY updated_at DESC');
    return stmt.all() as Memo[];
  }
}

/**
 * 特定のIDのメモを取得する
 * @param id メモのID
 * @returns メモオブジェクト、存在しない場合はnull
 */
export async function getMemoById(id: number): Promise<Memo | null> {
  if (isVercelEnv) {
    // Vercel Postgres
    const { rows } = await sql`SELECT * FROM memos WHERE id = ${id}`;
    return rows.length > 0 ? (rows[0] as Memo) : null;
  } else {
    // SQLite
    if (!sqliteDb) throw new Error('SQLiteデータベースが初期化されていません');
    const stmt = sqliteDb.prepare('SELECT * FROM memos WHERE id = ?');
    return stmt.get(id) as Memo | null;
  }
}

/**
 * 新しいメモを作成する
 * @param memo 新しいメモのデータ
 * @returns 作成されたメモのID
 */
export async function createMemo(memo: NewMemo): Promise<number> {
  if (isVercelEnv) {
    // Vercel Postgres
    const { rows } = await sql`
      INSERT INTO memos (title, content) 
      VALUES (${memo.title}, ${memo.content}) 
      RETURNING id
    `;
    return rows[0].id as number;
  } else {
    // SQLite
    if (!sqliteDb) throw new Error('SQLiteデータベースが初期化されていません');
    const stmt = sqliteDb.prepare(
      'INSERT INTO memos (title, content) VALUES (?, ?)'
    );
    const result = stmt.run(memo.title, memo.content);
    return result.lastInsertRowid as number;
  }
}

/**
 * メモを更新する
 * @param id 更新するメモのID
 * @param memo 更新するメモのデータ
 * @returns 更新が成功したかどうか
 */
export async function updateMemo(id: number, memo: UpdateMemo): Promise<boolean> {
  if (isVercelEnv) {
    // Vercel Postgres
    let result;
    
    // 更新するフィールドに応じて異なるクエリを実行
    if (memo.title !== undefined && memo.content !== undefined && memo.summary !== undefined) {
      result = await sql`
        UPDATE memos 
        SET title = ${memo.title}, content = ${memo.content}, summary = ${memo.summary}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `;
    } else if (memo.title !== undefined && memo.content !== undefined) {
      result = await sql`
        UPDATE memos 
        SET title = ${memo.title}, content = ${memo.content}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `;
    } else if (memo.title !== undefined && memo.summary !== undefined) {
      result = await sql`
        UPDATE memos 
        SET title = ${memo.title}, summary = ${memo.summary}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `;
    } else if (memo.content !== undefined && memo.summary !== undefined) {
      result = await sql`
        UPDATE memos 
        SET content = ${memo.content}, summary = ${memo.summary}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `;
    } else if (memo.title !== undefined) {
      result = await sql`
        UPDATE memos 
        SET title = ${memo.title}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `;
    } else if (memo.content !== undefined) {
      result = await sql`
        UPDATE memos 
        SET content = ${memo.content}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `;
    } else if (memo.summary !== undefined) {
      result = await sql`
        UPDATE memos 
        SET summary = ${memo.summary}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `;
    } else {
      // 更新するフィールドがない場合は何もしない
      return false;
    }
    
    return result.rowCount ? result.rowCount > 0 : false;
  } else {
    // SQLite
    if (!sqliteDb) throw new Error('SQLiteデータベースが初期化されていません');
    
    // 更新するフィールドを動的に構築
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (memo.title !== undefined) {
      fields.push('title = ?');
      values.push(memo.title);
    }

    if (memo.content !== undefined) {
      fields.push('content = ?');
      values.push(memo.content);
    }

    if (memo.summary !== undefined) {
      fields.push('summary = ?');
      values.push(memo.summary);
    }

    // 更新日時を常に更新
    fields.push('updated_at = CURRENT_TIMESTAMP');

    // 更新するフィールドがない場合は何もしない
    if (fields.length === 1) {
      return false;
    }

    const stmt = sqliteDb.prepare(
      `UPDATE memos SET ${fields.join(', ')} WHERE id = ?`
    );
    values.push(id);

    const result = stmt.run(...values);
    return result.changes > 0;
  }
}

/**
 * メモを削除する
 * @param id 削除するメモのID
 * @returns 削除が成功したかどうか
 */
export async function deleteMemo(id: number): Promise<boolean> {
  if (isVercelEnv) {
    // Vercel Postgres
    const result = await sql`DELETE FROM memos WHERE id = ${id}`;
    return result.rowCount ? result.rowCount > 0 : false;
  } else {
    // SQLite
    if (!sqliteDb) throw new Error('SQLiteデータベースが初期化されていません');
    const stmt = sqliteDb.prepare('DELETE FROM memos WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

/**
 * メモの要約を更新する
 * @param id メモのID
 * @param summary 要約テキスト
 * @returns 更新が成功したかどうか
 */
export async function updateMemoSummary(id: number, summary: string): Promise<boolean> {
  if (isVercelEnv) {
    // Vercel Postgres
    const result = await sql`
      UPDATE memos 
      SET summary = ${summary}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id}
    `;
    return result.rowCount ? result.rowCount > 0 : false;
  } else {
    // SQLite
    if (!sqliteDb) throw new Error('SQLiteデータベースが初期化されていません');
    const stmt = sqliteDb.prepare(
      'UPDATE memos SET summary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    const result = stmt.run(summary, id);
    return result.changes > 0;
  }
}
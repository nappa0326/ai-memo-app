import { NextRequest, NextResponse } from 'next/server';
import { getAllMemos, createMemo } from '@/lib/db/memos';
import { NewMemo } from '@/lib/db/index';
import { ZodError, z } from 'zod';

// メモ作成のバリデーションスキーマ
const createMemoSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),
  content: z.string().min(1, 'メモ内容は必須です'),
});

/**
 * GET /api/memos - メモの一覧を取得
 */
export async function GET() {
  try {
    const memos = await getAllMemos();
    return NextResponse.json(memos);
  } catch (error) {
    console.error('Failed to get memos:', error);
    return NextResponse.json(
      { error: 'メモの取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/memos - 新しいメモを作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validatedData = createMemoSchema.parse(body);
    
    // メモを作成
    const newMemo: NewMemo = {
      title: validatedData.title,
      content: validatedData.content,
    };
    
    const id = await createMemo(newMemo);
    
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('Failed to create memo:', error);
    
    // バリデーションエラーの場合
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'メモの作成に失敗しました' },
      { status: 500 }
    );
  }
}
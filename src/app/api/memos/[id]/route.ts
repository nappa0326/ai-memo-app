import { NextRequest, NextResponse } from 'next/server';
import { getMemoById, updateMemo, deleteMemo } from '@/lib/db/memos';
import { UpdateMemo } from '@/lib/db/index';
import { ZodError, z } from 'zod';

// メモ更新のバリデーションスキーマ
const updateMemoSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください').optional(),
  content: z.string().min(1, 'メモ内容は必須です').optional(),
  summary: z.string().optional(),
});

/**
 * GET /api/memos/[id] - 特定のメモを取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
    }
    
    const memo = await getMemoById(id);
    
    if (!memo) {
      return NextResponse.json(
        { error: 'メモが見つかりませんでした' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(memo);
  } catch (error) {
    console.error('Failed to get memo:', error);
    return NextResponse.json(
      { error: 'メモの取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/memos/[id] - メモを更新
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // バリデーション
    const validatedData = updateMemoSchema.parse(body);
    
    // メモを更新
    const updateData: UpdateMemo = {};
    
    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
    }
    
    if (validatedData.content !== undefined) {
      updateData.content = validatedData.content;
    }
    
    if (validatedData.summary !== undefined) {
      updateData.summary = validatedData.summary;
    }
    
    const success = await updateMemo(id, updateData);
    
    if (!success) {
      return NextResponse.json(
        { error: 'メモが見つかりませんでした' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update memo:', error);
    
    // バリデーションエラーの場合
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'メモの更新に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/memos/[id] - メモを削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
    }
    
    const success = await deleteMemo(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'メモが見つかりませんでした' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete memo:', error);
    return NextResponse.json(
      { error: 'メモの削除に失敗しました' },
      { status: 500 }
    );
  }
}
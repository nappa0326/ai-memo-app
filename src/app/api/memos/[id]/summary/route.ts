import { NextRequest, NextResponse } from 'next/server';
import { getMemoById, updateMemoSummary } from '@/lib/db/memos';
import { generateSummary } from '@/lib/claude';
import { getApiKeyRepository } from '@/lib/repositories/apiKeyRepository';

/**
 * POST /api/memos/[id]/summary - メモの要約を生成
 */
export async function POST(
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
    
    // メモを取得
    const memo = await getMemoById(id);
    
    if (!memo) {
      return NextResponse.json(
        { error: 'メモが見つかりませんでした' },
        { status: 404 }
      );
    }
    
    // APIキーリポジトリからAPIキーを取得
    const apiKeyRepository = getApiKeyRepository();
    const apiKey = await apiKeyRepository.getApiKey();
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません' },
        { status: 400 }
      );
    }
    
    // 要約を生成
    const summary = await generateSummary(apiKey, memo.content);
    
    // 要約をデータベースに保存
    await updateMemoSummary(id, summary);
    
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Failed to generate summary:', error);
    
    // エラーメッセージを取得
    const errorMessage = error instanceof Error
      ? error.message
      : '要約の生成に失敗しました';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
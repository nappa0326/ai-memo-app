import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/claude';
import { ZodError, z } from 'zod';
import { getApiKeyRepository } from '@/lib/repositories/apiKeyRepository';

// APIキーリポジトリのインスタンスを取得
const apiKeyRepository = getApiKeyRepository();

// APIキー設定のバリデーションスキーマ
const apiKeySchema = z.object({
  apiKey: z.string().min(1, 'APIキーは必須です'),
});

/**
 * GET /api/settings/api-key - APIキーの存在を確認
 */
export async function GET() {
  try {
    // APIキーが存在するかどうかを確認
    const hasKey = await apiKeyRepository.hasApiKey();
    
    return NextResponse.json({ hasKey });
  } catch (error) {
    console.error('Failed to check API key:', error);
    
    return NextResponse.json(
      { error: 'APIキーの確認に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/api-key - APIキーを保存
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validatedData = apiKeySchema.parse(body);
    const { apiKey } = validatedData;
    
    // APIキーが有効かどうかを確認
    const isValid = await validateApiKey(apiKey);
    
    if (!isValid) {
      return NextResponse.json(
        { error: '無効なAPIキーです' },
        { status: 400 }
      );
    }
    
    // APIキーを保存（リポジトリを使用）
    await apiKeyRepository.saveApiKey(apiKey);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save API key:', error);
    
    // バリデーションエラーの場合
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'APIキーの保存に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings/api-key - APIキーを削除
 */
export async function DELETE() {
  try {
    // APIキーを削除（リポジトリを使用）
    await apiKeyRepository.removeApiKey();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove API key:', error);
    
    return NextResponse.json(
      { error: 'APIキーの削除に失敗しました' },
      { status: 500 }
    );
  }
}
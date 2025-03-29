'use client';

import Link from 'next/link';
import MemoForm from '@/components/MemoForm';
import { useApiKey } from '@/hooks/useApiKey';
import ApiKeyForm from '@/components/ApiKeyForm';

export default function NewMemoPage() {
  const { hasKey, isLoading } = useApiKey();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // APIキーが設定されていない場合はAPIキー入力画面を表示
  if (!hasKey) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">APIキーの設定が必要です</h1>
          <p className="text-gray-600">
            メモを作成するには、Claude APIキーを設定してください。
          </p>
        </div>
        <ApiKeyForm />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 transition"
        >
          ← メモ一覧に戻る
        </Link>
      </div>

      <MemoForm />
    </div>
  );
}
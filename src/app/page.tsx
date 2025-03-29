'use client';

import { useEffect, useState } from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import ApiKeyForm from '@/components/ApiKeyForm';
import MemoCard from '@/components/MemoCard';
import Link from 'next/link';
import { Memo } from '@/lib/db/index';

export default function Home() {
  const { hasKey, isLoading: isLoadingApiKey } = useApiKey();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // メモ一覧を取得
  useEffect(() => {
    if (hasKey) {
      fetchMemos();
    }
  }, [hasKey]);

  const fetchMemos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/memos');
      
      if (!response.ok) {
        throw new Error('メモの取得に失敗しました');
      }
      
      const data = await response.json();
      setMemos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      console.error('Failed to fetch memos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // APIキーが設定されていない場合はAPIキー入力画面を表示
  if (isLoadingApiKey) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">AIメモアシスタントへようこそ</h1>
          <p className="text-gray-600">
            メモを作成・保存し、AIを使ってメモの要約を生成するアプリです。
            <br />
            利用を開始するには、Claude APIキーを設定してください。
          </p>
        </div>
        <ApiKeyForm onSuccess={fetchMemos} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">メモ一覧</h1>
        <Link
          href="/memo/new"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          新規メモ作成
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : memos.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-8 rounded-lg text-center">
          <p className="mb-4">メモがまだありません。</p>
          <Link
            href="/memo/new"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            最初のメモを作成する
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memos.map((memo) => (
            <MemoCard key={memo.id} memo={memo} />
          ))}
        </div>
      )}
    </div>
  );
}

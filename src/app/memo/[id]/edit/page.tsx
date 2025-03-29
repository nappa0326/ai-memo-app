'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import MemoForm from '@/components/MemoForm';
import { Memo } from '@/lib/db/index';

interface EditMemoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditMemoPage({ params }: EditMemoPageProps) {
  const [memo, setMemo] = useState<Memo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = use(params).id;

  // メモを取得
  useEffect(() => {
    const fetchMemo = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/memos/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('メモが見つかりませんでした');
          }
          throw new Error('メモの取得に失敗しました');
        }
        
        const data = await response.json();
        setMemo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
        console.error('Failed to fetch memo:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemo();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 transition"
        >
          ← メモ一覧に戻る
        </Link>
      </div>
    );
  }

  if (!memo) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          メモが見つかりませんでした
        </div>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 transition"
        >
          ← メモ一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link
          href={`/memo/${id}`}
          className="text-blue-600 hover:text-blue-800 transition"
        >
          ← メモの詳細に戻る
        </Link>
      </div>

      <MemoForm memo={memo} isEdit={true} />
    </div>
  );
}
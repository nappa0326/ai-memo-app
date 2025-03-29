'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Memo } from '@/lib/db/index';
import { useApiKey } from '@/hooks/useApiKey';

interface MemoDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MemoDetailPage({ params }: MemoDetailPageProps) {
  const { hasKey } = useApiKey();
  const [memo, setMemo] = useState<Memo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const id = use(params).id;

  // メモを取得
  useEffect(() => {
    fetchMemo();
  }, [id]);

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

  // メモを削除
  const handleDelete = async () => {
    if (!confirm('このメモを削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/memos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('メモの削除に失敗しました');
      }
      
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      console.error('Failed to delete memo:', err);
    }
  };

  // 要約を生成
  const generateSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      const response = await fetch(`/api/memos/${id}/summary`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('要約の生成に失敗しました');
      }
      
      await response.json();
      
      // メモを再取得して最新の要約を表示
      fetchMemo();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      console.error('Failed to generate summary:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          href="/"
          className="text-blue-600 hover:text-blue-800 transition"
        >
          ← メモ一覧に戻る
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{memo.title}</h1>
          <div className="flex space-x-2">
            <Link
              href={`/memo/${id}/edit`}
              className="text-blue-600 hover:text-blue-800 transition"
            >
              編集
            </Link>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 transition"
            >
              削除
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p>作成日: {formatDate(memo.created_at)}</p>
          <p>更新日: {formatDate(memo.updated_at)}</p>
        </div>

        <div className="prose max-w-none mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">メモ内容</h2>
          <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-gray-700">
            {memo.content}
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-800">AI要約</h2>
            {hasKey ? (
              <button
                onClick={generateSummary}
                disabled={isGeneratingSummary}
                className="bg-blue-600 text-white py-1 px-3 text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition"
              >
                {isGeneratingSummary ? '生成中...' : (memo.summary ? 'AI要約を再生成' : 'AI要約を生成')}
              </button>
            ) : (
              <Link
                href="/settings/api-key"
                className="bg-blue-600 text-white py-1 px-3 text-sm rounded-md hover:bg-blue-700 transition"
              >
                APIキーを設定
              </Link>
            )}
          </div>
          
          {memo.summary ? (
            <div className="bg-blue-50 p-4 rounded-md text-gray-700">
              {memo.summary}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
              <p>まだ要約が生成されていません。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
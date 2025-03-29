'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ApiKeyForm from '@/components/ApiKeyForm';
import { useApiKey } from '@/hooks/useApiKey';
import { useRouter } from 'next/navigation';

export default function ApiKeySettingsPage() {
  const { hasKey: initialHasKey, isLoading, refreshApiKey } = useApiKey();
  const [hasKey, setHasKey] = useState<boolean | null>(initialHasKey);
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  // initialHasKeyが変更されたときにhasKeyを更新
  useEffect(() => {
    if (initialHasKey !== null) {
      setHasKey(initialHasKey);
    }
  }, [initialHasKey]);

  // APIキーの状態が変更されたときに呼び出される関数
  const handleApiKeyChange = (newHasKey: boolean) => {
    console.log('APIキー状態変更:', newHasKey);
    setHasKey(newHasKey);
  };

  const handleRemoveApiKey = async () => {
    console.log('APIキー削除ボタンクリック');
    if (confirm('APIキーを削除してもよろしいですか？')) {
      console.log('APIキー削除確認');
      setIsRemoving(true);
      
      try {
        // APIエンドポイントを使用してAPIキーを削除
        const response = await fetch('/api/settings/api-key', {
          method: 'DELETE',
        });
        
        const data = await response.json();
        console.log('APIレスポンス受信:', response.status, data);
        
        if (!response.ok) {
          throw new Error(data.error || 'APIキーの削除に失敗しました');
        }
        
        console.log('APIキー削除完了');
        
        // APIキーの状態を更新
        refreshApiKey();
        setHasKey(false);
        
        // カスタムイベントを発火させて他のコンポーネントに通知
        const event = new CustomEvent('apiKeyChange', { detail: { hasKey: false } });
        window.dispatchEvent(event);
        
        // ページを更新
        router.refresh();
      } catch (error) {
        console.error('Failed to remove API key:', error);
        alert('APIキーの削除に失敗しました');
      } finally {
        setIsRemoving(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">APIキー設定</h1>

        {hasKey ? (
          <div className="mb-8">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              APIキーが設定されています
            </div>
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleRemoveApiKey}
                disabled={isRemoving}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition"
              >
                {isRemoving ? 'APIキーを削除中...' : 'APIキーを削除'}
              </button>
              <p className="text-gray-600 text-sm">
                APIキーを削除すると、要約機能が使用できなくなります。
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
                APIキーが設定されていません
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                APIキーを設定
              </h2>
              <ApiKeyForm
                onSuccess={() => router.push('/')}
                onApiKeyChange={handleApiKeyChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
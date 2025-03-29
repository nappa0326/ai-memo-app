import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApiKey } from '@/hooks/useApiKey';

interface ApiKeyFormProps {
  onSuccess?: () => void;
  onApiKeyChange?: (hasKey: boolean) => void;
}

export default function ApiKeyForm({ onSuccess, onApiKeyChange }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refreshApiKey } = useApiKey(); // 新しいフックを使用

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('APIキーフォーム送信開始:', apiKey.substring(0, 5) + '...');
    setIsLoading(true);
    setError(null);

    try {
      console.log('APIリクエスト送信中...');
      const response = await fetch('/api/settings/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();
      console.log('APIレスポンス受信:', response.status, data);

      if (!response.ok) {
        throw new Error(data.error || 'APIキーの保存に失敗しました');
      }

      // 成功時の処理
      console.log('APIキー保存成功');
      
      // APIキーの状態を更新
      refreshApiKey();
      
      // カスタムイベントを発火させて他のコンポーネントに通知
      const event = new CustomEvent('apiKeyChange', { detail: { hasKey: true } });
      window.dispatchEvent(event);
      
      // コールバックを実行
      if (onApiKeyChange) {
        console.log('onApiKeyChange コールバック実行:', true);
        onApiKeyChange(true);
      }
      
      // ページを更新
      router.refresh();
      
      // 成功コールバックを実行またはルートページに遷移
      if (onSuccess) {
        console.log('onSuccess コールバック実行');
        onSuccess();
      } else {
        console.log('ルートページに遷移');
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Claude APIキーの設定</h2>
      <p className="text-gray-600 mb-4">
        AIメモの要約機能を使用するには、Claude APIキーが必要です。
        <a
          href="https://console.anthropic.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          Anthropicコンソール
        </a>
        からAPIキーを取得してください。
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-gray-700 font-medium mb-2">
            APIキー
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500 placeholder-gray-300"
            placeholder="sk-ant-api03-..."
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition"
        >
          {isLoading ? '保存中...' : 'APIキーを保存'}
        </button>
      </form>
    </div>
  );
}
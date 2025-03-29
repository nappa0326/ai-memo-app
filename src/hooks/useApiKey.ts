import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

/**
 * APIキーの存在を確認するカスタムフック
 * APIエンドポイントを使用して状態を管理する
 * @returns APIキーの存在状態と読み込み状態、更新関数
 */
export function useApiKey() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname(); // 現在のパスを取得

  /**
   * APIキーの存在を確認する関数
   * APIエンドポイントを使用して状態を取得する
   */
  const checkApiKey = useCallback(async () => {
    try {
      console.log('APIキー存在確認リクエスト送信');
      const response = await fetch('/api/settings/api-key');
      const data = await response.json();
      
      console.log('APIキー存在確認レスポンス受信:', data.hasKey);
      setHasKey(data.hasKey);
    } catch (error) {
      console.error('Failed to check API key:', error);
      setHasKey(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // APIキーの状態を更新する関数（外部から呼び出し可能）
  const refreshApiKey = useCallback(() => {
    console.log('APIキー状態更新リクエスト');
    setIsLoading(true);
    checkApiKey();
  }, [checkApiKey]);

  useEffect(() => {
    // コンポーネントのマウント時またはパス変更時にAPIキーの存在を確認
    console.log('useEffect: APIキー確認');
    checkApiKey();

    // カスタムイベントのリスナーを追加（同一ウィンドウ内での変更を検知するため）
    const handleApiKeyChange = (event: CustomEvent<{ hasKey: boolean }>) => {
      console.log('カスタムイベント検知:', event.detail.hasKey);
      setHasKey(event.detail.hasKey);
    };

    // イベントリスナーを登録
    window.addEventListener('apiKeyChange', handleApiKeyChange as EventListener);

    // クリーンアップ関数
    return () => {
      window.removeEventListener('apiKeyChange', handleApiKeyChange as EventListener);
    };
  }, [pathname, checkApiKey]); // パスが変わるたびに再実行（ページ遷移を検知）

  return { hasKey, isLoading, refreshApiKey };
}
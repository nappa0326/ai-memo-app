import Anthropic from '@anthropic-ai/sdk';
import CryptoJS from 'crypto-js';

// 暗号化のための秘密鍵を環境変数から取得
const SECRET_KEY = process.env.SECRET_KEY || 'ai-memo-app-secret-key';

/**
 * APIキーを暗号化する
 * @param apiKey 暗号化するAPIキー
 * @returns 暗号化されたAPIキー
 */
export function encryptApiKey(apiKey: string): string {
  return CryptoJS.AES.encrypt(apiKey, SECRET_KEY).toString();
}

/**
 * 暗号化されたAPIキーを復号化する
 * @param encryptedApiKey 暗号化されたAPIキー
 * @returns 復号化されたAPIキー
 */
export function decryptApiKey(encryptedApiKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedApiKey, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Claude APIを使用してテキストの要約を生成する
 * @param apiKey Claude APIキー
 * @param text 要約するテキスト
 * @returns 生成された要約
 */
export async function generateSummary(apiKey: string, text: string): Promise<string> {
  try {
    const anthropic = new Anthropic({
      apiKey,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `以下のテキストを144文字以内に要約してください。簡潔で分かりやすい日本語で、最も重要なポイントを含めてください。
          
テキスト:
${text}`,
        },
      ],
    });

    // content[0]がtextプロパティを持つオブジェクトであることを確認
    if (response.content[0].type === 'text') {
      return response.content[0].text;
    }
    return '要約を生成できませんでした。';
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('要約の生成中にエラーが発生しました。APIキーが正しいか確認してください。');
  }
}

/**
 * APIキーが有効かどうかを確認する
 * @param apiKey 確認するAPIキー
 * @returns APIキーが有効かどうか
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const anthropic = new Anthropic({
      apiKey,
    });

    // 簡単なリクエストを送信してAPIキーが有効かどうかを確認
    await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Hello',
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}
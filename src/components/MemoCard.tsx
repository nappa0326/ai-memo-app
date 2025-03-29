import Link from 'next/link';
import { Memo } from '@/lib/db/index';

interface MemoCardProps {
  memo: Memo;
}

export default function MemoCard({ memo }: MemoCardProps) {
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

  // メモの内容を省略表示
  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 表示するテキストを決定（要約があれば要約を、なければ元の内容を表示）
  const displayText = memo.summary || truncateContent(memo.content);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition flex flex-col h-full">
      <div className="flex-grow">
        <Link href={`/memo/${memo.id}`} className="block">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">{memo.title}</h2>
          <p className="text-gray-600">{displayText}</p>
        </Link>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-500 mt-4 pt-2 border-t border-gray-100">
        <span>更新日: {formatDate(memo.updated_at)}</span>
        <div className="flex space-x-2">
          <Link
            href={`/memo/${memo.id}/edit`}
            className="text-blue-500 hover:text-blue-700 transition"
          >
            編集
          </Link>
          <Link
            href={`/memo/${memo.id}`}
            className="text-green-500 hover:text-green-700 transition"
          >
            詳細
          </Link>
        </div>
      </div>
    </div>
  );
}
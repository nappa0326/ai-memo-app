import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-blue-200 transition">
          AIメモアシスタント
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:text-blue-200 transition">
                メモ一覧
              </Link>
            </li>
            <li>
              <Link href="/memo/new" className="hover:text-blue-200 transition">
                新規メモ
              </Link>
            </li>
            <li>
              <Link href="/settings/api-key" className="hover:text-blue-200 transition">
                API設定
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
import { Footprints } from 'lucide-preact';
import { Link } from 'wouter-preact';

export function NotFound() {
  return (
    <>
      <div className="mt-6 flex flex-col space-y-3 w-fit p-16 rounded-xl text-black dark:text-white items-center border-1 border-solid border-outline">
        <p className="text-2xl">Такой страницы не существует!</p>
        <Link to="/">
          <p className="text-xl text-cyan-500 underline">На главную</p>
        </Link>
        <Footprints className="mt-2 size-32" />
      </div>
    </>
  );
}

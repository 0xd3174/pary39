import { CalendarDays, Settings, SquareLibrary } from 'lucide-preact';
import { Link } from 'wouter-preact';

export function Navbar() {
  return (
    <>
      <div className="fixed bottom-4 flex w-[calc(75%-2rem)] md:w-max md:gap-20 justify-between p-4 pr-8 pl-8 bg-outline/25 backdrop-blur-sm rounded-2xl text-white border-1 border-solid border-outline">
        <Link to="/about">
          <SquareLibrary />
        </Link>
        <Link to="/">
          <CalendarDays />
        </Link>
        <Link to="/settings">
          <Settings />
        </Link>
      </div>
    </>
  );
}

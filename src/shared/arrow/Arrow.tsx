import { ChevronRight } from 'lucide-preact';

interface ArrowProps {
  orientation: 'right' | 'left';
  callback: () => void;
  className: string;
}

export function Arrow({ className, orientation, callback }: ArrowProps) {
  return (
    <ChevronRight
      className={`cursor-pointer text-white transition-colors duration-200 rounded-lg hover:bg-white/10 ${
        orientation === 'left' ? 'rotate-180' : ''
      } ${className}`}
      onClick={callback}
    />
  );
}

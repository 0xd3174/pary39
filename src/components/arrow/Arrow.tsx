import { ChevronRight } from 'lucide-preact';
import { BaseHTMLAttributes } from 'preact/compat';

interface ArrowProps extends BaseHTMLAttributes<HTMLDivElement> {
  className?: string;
  orientation: 'right' | 'left';
}

export function Arrow({ className, orientation, ...rest }: ArrowProps) {
  return (
    <div
      className={`flex justify-center items-center cursor-pointer text-black dark:text-white transition-colors duration-200 rounded-lg hover:bg-outline/20 dark:hover:bg-outline ${className}`}
      {...rest}
    >
      <ChevronRight className={orientation === 'left' ? 'rotate-180' : ''} />
    </div>
  );
}

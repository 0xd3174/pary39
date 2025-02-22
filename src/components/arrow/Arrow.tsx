import { ChevronRight } from 'lucide-preact';
import { BaseHTMLAttributes } from 'preact/compat';

interface ArrowProps extends BaseHTMLAttributes<HTMLDivElement> {
  orientation: 'right' | 'left';
  className: string;
}

export function Arrow({ className, orientation, ...rest }: ArrowProps) {
  return (
    <div
      className={`cursor-pointer text-white transition-colors duration-200 rounded-lg hover:bg-white/10 ${className}`}
      {...rest}
    >
      <ChevronRight className={orientation === 'left' ? 'rotate-180' : ''} />
    </div>
  );
}

import arrowIcon from '/src/svg/arrow.svg';

interface ArrowProps {
  orientation: 'right' | 'left';
  callback: () => void;
  className: string;
}

export function Arrow({ className, orientation, callback }: ArrowProps) {
  return (
    <img
      className={`cursor-pointer filter-[var(--gray-lighter-filter)] transition-colors duration-200 rounded-full hover:bg-white ${
        orientation === 'left' ? 'rotate-180' : ''
      } ${className}`}
      src={arrowIcon}
      onClick={callback}
    ></img>
  );
}

import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useDropdownStore } from '../../stores/dropdown';
import { generateComponentId } from '../../utils/generate-id';
import './dropdown.css';

interface DropdownProps {
  className?: string;
  title: string;
  items: string[];
  disabled?: boolean;
  handler: (item: string) => void;
}

export function Dropdown({
  className,
  title,
  items,
  disabled,
  handler,
}: DropdownProps) {
  const id = useMemo(() => generateComponentId('d'), []);
  const [selectedTitle, setSelectedTitle] = useState<Maybe<string>>(null);

  const openState = useDropdownStore((state) => state);
  const isOpen = openState.id === id;

  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!listRef.current) return;

    const animDuration = Math.min((items.length + 1) * 0.025, 0.1);
    const animOrientation = 'step-' + (isOpen ? 'end' : 'start');
    const transitionProperties = `max-height ${animDuration}s ease-in-out, border-color ${animDuration}s ${animOrientation}, z-index ${animDuration}s ${animOrientation}, border-width ${animDuration}s ${animOrientation}`;

    listRef.current.style.transition = transitionProperties;
  }, [isOpen]);

  const handleItemClick = (item: string) => {
    setSelectedTitle(item);
    openState.close();
    handler(item);
  };

  const renderItems = () => {
    if (disabled) {
      return (
        <ul
          ref={listRef}
          className={`absolute bg-[var(--color-bg)] border-solid border-outline rounded-md overflow-auto w-[calc(100%-3rem)] ${
            isOpen ? 'border-1 max-h-32 z-50' : 'border-0 max-h-0 z-0'
          }`}
        >
          <li className="dropdown-item">Ничего не найдено</li>
        </ul>
      );
    }

    return (
      <ul
        ref={listRef}
        className={`absolute bg-[var(--color-bg)] border-solid border-outline rounded-md overflow-auto w-[calc(100%-3rem)] ${
          isOpen ? 'border-1 max-h-32 z-50' : 'border-0 max-h-0 z-0'
        }`}
      >
        {items.map((item) => (
          <li className="dropdown-item" onClick={() => handleItemClick(item)}>
            {item}
          </li>
        ))}
      </ul>
    );
  };

  const toggleDropdown = () => {
    if (isOpen) {
      openState.change(id);
    } else {
      openState.open(id);
    }
  };

  return (
    <div className="clear-both">
      <p
        className={`${className} mb-px pt-2 pb-2 pl-3 pr-3 border-1 border-solid border-outline rounded-md cursor-pointer transition-colors hover:bg-outline text-white`}
        onClick={toggleDropdown}
      >
        {selectedTitle || title}
      </p>
      {renderItems()}
    </div>
  );
}

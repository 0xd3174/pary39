import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useDropdownStore } from '../../stores/dropdown';
import { generateComponentId } from '../../utils/generate-id';
import './dropdown.css';

interface DropdownSearchProps {
  title: string;
  items: string[];
  disabled?: boolean;
  handler: (item: string) => void;
}

export function DropdownSearch({
  title,
  items,
  disabled,
  handler,
}: DropdownSearchProps) {
  const id = useMemo(() => generateComponentId('d'), []);
  const [selectedTitle, setSelectedTitle] = useState<Maybe<string>>(null);

  const openState = useDropdownStore((state) => state);
  const isOpen = openState.id === id;

  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchBar, setSearchBar] = useState<string>('');


  useEffect(() => {
    if (!listRef.current) return;

    if (inputRef.current) inputRef.current.focus();

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
          className={`dropdown-list ${isOpen ? 'opened' : 'closed'}`}
        >
          <li className="dropdown-item disabled">Ничего не найдено</li>
        </ul>
      );
    }

    return (
      <ul ref={listRef} className={`dropdown-list ${isOpen ? 'opened' : 'closed'}`}>
        {items.map((item) => {
          if (!searchBar || item.toLowerCase().includes(searchBar)) {
            return (
              <li
                className="dropdown-item"
                onClick={() => handleItemClick(item)}
              >
                {item}
              </li>
            );
          }
        })}
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
    <div className="dropdown">
      {isOpen && !disabled ? (
        <input
          ref={inputRef}
          className="dropdown-title dropdown-search-title"
          onInput={(i) => setSearchBar(i.currentTarget.value.toLowerCase())}
          onClick={toggleDropdown}
          type="text"
        />
      ) : (
        <p className={`dropdown-title ${selectedTitle ? 'dropdown-title-selected' : ''}`} onClick={toggleDropdown}>
        {selectedTitle || title}
      </p>
      )}
      {renderItems()}
    </div>
  );
}

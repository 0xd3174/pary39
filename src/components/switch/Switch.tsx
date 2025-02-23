import { Dispatch, StateUpdater } from 'preact/hooks';

interface ArrowProps {
  title: string;
  isChecked: boolean;
  setChecked: Dispatch<StateUpdater<boolean>>;
  className?: string;
}

export function Switch({ title, isChecked, setChecked, className }: ArrowProps) {
  return (
    <>
      <div
        onClick={() => setChecked(!isChecked)}
        className={`flex items-center space-x-2 ${className}`}
      >
        <button
          className={`w-9 h-5 inline-flex items-center border-2 border-transparent transition-all ${
            isChecked ? 'bg-black dark:bg-white' : 'bg-outline/20 dark:bg-outline'
          } rounded-xl cursor-pointer`}
        >
          <div
            className={`h-4 w-4 rounded-xl transition-all ${
              isChecked ? 'translate-x-4 bg-white dark:bg-black' : 'translate-x-0 bg-black dark:bg-white'
            }`}
          ></div>
        </button>
        <div className="text-black dark:text-white">{title}</div>
      </div>
    </>
  );
}

import { MutableRef, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useDateStore } from '../../stores/date';
import { useModalStore } from '../../stores/modal';
import calendarIcon from '/src/svg/calendar.svg';
import arrowIcon from '/src/svg/arrow.svg';
import { generateComponentId } from '../../utils/generate-id';
import { getMonthAsMatrix, monthNumberToString } from '../../utils/date';
import './calendar.css';
import { Arrow } from '../../shared/arrow/Arrow';

export function Calendar() {
  const dateState = useDateStore((state) => state);

  const modalState = useModalStore((state) => state);
  const modalId = useMemo(() => generateComponentId('m'), []);
  const isLocalModalOpen = modalId === modalState.id;

  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (isLocalModalOpen) {
      ref.current.showModal();
    } else {
      ref.current.close();
    }
  }, [isLocalModalOpen]);

  return (
    <>
      <div
        class="calendar mt-1 w-[75%] max-w-[330px] p-4 bg-gray-800 border-2 border-solid border-gray-600 rounded-xl hover:border-cyan-700 flex justify-between font-normal"
        onClick={() => modalState.open(modalId)}
      >
        <p class="text-gray-300 font-semibold">{dateState.dateString()}</p>
        <img className="w-4" src={calendarIcon}></img>
      </div>

      {isLocalModalOpen && <CalendarModal dialogRef={ref} />}
    </>
  );
}

interface CalendarModalProps {
  dialogRef: MutableRef<HTMLDialogElement | null>;
}

enum IChoose {
  YEAR,
  MONTH,
  DAY,
}

function CalendarModal({ dialogRef }: CalendarModalProps) {
  const closeModal = useModalStore((state) => {
    return state.close;
  });

  const dateState = useDateStore((state) => state);

  const [choose, setChoose] = useState<IChoose>(IChoose.DAY);
  const [localDate, setLocalDate] = useState<Date>(new Date(dateState.date));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
      }
    };

    if (dialogRef.current) {
      dialogRef.current.addEventListener('click', ({ target }) => {
        if ((target as HTMLDialogElement).nodeName === 'DIALOG') {
          closeModal();
        }
      });
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderHeader = () => {
    let r;
    let cb;

    switch (choose) {
      case IChoose.YEAR:
        r = <p>2020-2032</p>;
        cb = () => {};
        break;
      case IChoose.MONTH:
        r = (
          <p
            className="hover:text-cyan-400 transition-colors"
            onClick={() => setChoose(IChoose.YEAR)}
          >
            {localDate.getFullYear()}
          </p>
        );
        cb = (e: number) => {
          const tDate = new Date(localDate);
          tDate.setFullYear(tDate.getFullYear() + e);
          setLocalDate(tDate);
        };
        break;
      case IChoose.DAY:
        r = (
          <>
            <p
              className="hover:text-cyan-400 transition-colors"
              onClick={() => setChoose(IChoose.MONTH)}
            >
              {monthNumberToString(localDate.getMonth())}
            </p>
            <p
              className="ml-1 hover:text-cyan-400 transition-colors"
              onClick={() => setChoose(IChoose.YEAR)}
            >
              {localDate.getFullYear()}
            </p>
          </>
        );
        cb = (e: number) => {
          const tDate = new Date(localDate);
          tDate.setMonth(tDate.getMonth() + e);
          setLocalDate(tDate);
        };
        break;
    }

    return (
      <>
        <Arrow className="w-8 p-1.5" orientation='left' callback={() => cb(-1)} />
        <div className="flex text-white">{r}</div>
        <Arrow className="w-8 p-1.5" orientation='right' callback={() => cb(1)} />
      </>
    );
  };

  const renderModal = () => {
    let r;

    switch (choose) {
      case IChoose.YEAR:
        r = renderYears();
        break;
      case IChoose.MONTH:
        r = renderMonths();
        break;
      case IChoose.DAY:
        r = renderDays();
        break;
    }

    return r;
  };

  const renderYears = () => {
    const matrix = [
      [2020, 2026],
      [2021, 2027],
      [2022, 2029],
      [2023, 2030],
      [2024, 2031],
      [2025, 2032],
    ];

    return matrix.map((row) => {
      return (
        <div className="flex flex-row justify-between">
          {row.map((e) => (
            <p
              className="text-center p-4 w-[calc(100%/7)] text-gray-600 transition-colors duration-200 border-full"
              onClick={() => {
                const tDate = new Date(localDate);
                tDate.setFullYear(e);
                setLocalDate(tDate);
                setChoose(IChoose.MONTH);
              }}
            >
              {e}
            </p>
          ))}
        </div>
      );
    });
  };

  const renderMonths = () => {
    const matrix = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [9, 10, 11],
    ];

    return matrix.map((row) => {
      return (
        <div className="first:mt-0.5 flex flex-row justify-between">
          {row.map((e) => (
            <p
              className="text-center p-1 w-[calc(100%/7)] text-gray-600 transition-colors duration-200 border-full"
              onClick={() => {
                const tDate = new Date(localDate);
                tDate.setMonth(e);
                setLocalDate(tDate);
                setChoose(IChoose.DAY);
              }}
            >
              {monthNumberToString(e)}
            </p>
          ))}
        </div>
      );
    });
  };

  const renderDays = () => {
    const matrix = getMonthAsMatrix(localDate);

    return matrix.map((row) => {
      return (
        <div className="first:mt-0.5 flex flex-row justify-between">
          {row.map((e) => (
            <p
              className={
                'calendar-item ' + (e > 0 ? 'cursor-pointer' : 'opacity-30')
              }
              onClick={
                e > 0
                  ? () => {
                      const tDate = new Date(localDate);
                      tDate.setDate(e);
                      setLocalDate(tDate);
                      dateState.set(tDate);
                      closeModal();
                    }
                  : undefined
              }
            >
              {Math.abs(e)}
            </p>
          ))}
        </div>
      );
    });
  };

  return (
    <>
      <dialog
        className="w-[calc(100%-3rem)] max-w-[650px] p-4 rounded-xl border-1 border-solid border-gray-600 bg-gray-800 overflow-visible m-auto focus:outline-none"
        ref={dialogRef}
      >
        <div className="flex flex-row justify-between border-b-1 border-solid border-gray-600 pb-2">
          {renderHeader()}
        </div>
        <div className="flex flex-col mt-2">{renderModal()}</div>
      </dialog>
    </>
  );
}

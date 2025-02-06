import { MutableRef, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useDateStore } from '../../stores/date';
import { useModalStore } from '../../stores/modal';
import './calendar.css';
import calendarIcon from '/src/svg/calendar.svg';
import arrowIcon from '/src/svg/arrow.svg';
import { generateComponentId } from '../../utils/generate-id';
import { getMonthAsMatrix, monthNumberToString } from '../../utils/date';

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
      <div class="calendar" onClick={() => modalState.open(modalId)}>
        <p class="calendar-title">{dateState.dateString()}</p>
        <img src={calendarIcon}></img>
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
          <p onClick={() => setChoose(IChoose.YEAR)}>
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
            <p onClick={() => setChoose(IChoose.MONTH)}>
              {monthNumberToString(localDate.getMonth())}
            </p>
            <p onClick={() => setChoose(IChoose.YEAR)}>
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
        <img src={arrowIcon} onClick={() => cb(-1)}></img>
        <div className="cm-header-text">{r}</div>
        <img src={arrowIcon} onClick={() => cb(1)}></img>
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
        <div className="cm-row">
          {row.map((e) => (
            <p
              className="cm-item"
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
        <div className="cm-row">
          {row.map((e) => (
            <p
              className="cm-item"
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
        <div className="cm-row">
          {row.map((e) => (
            <p
              className={'cm-item' + (e > 0 ? '' : ' disabled')}
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
      <dialog className="calendar-modal" ref={dialogRef}>
        <div className="cm-header">{renderHeader()}</div>
        <div className="cm-body">{renderModal()}</div>
      </dialog>
    </>
  );
}

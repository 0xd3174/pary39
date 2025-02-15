import { useEffect, useRef, useState } from 'preact/hooks';
import {
  getScheduleForDay,
  getScheduleForWeek,
  IClass,
} from '../../utils/scrape';
import { useGroupStore } from '../../stores/group';
import { useClassesStore } from '../../stores/classes';
import { useDateStore } from '../../stores/date';
import { dayNumberToString, isDateInCurrentWeek } from '../../utils/date';
import arrowIcon from '/src/svg/arrow.svg';
import { Arrow } from '../../shared/arrow/Arrow';

export function Classes() {
  const containerRef = useRef<HTMLDivElement>(null);

  const dateState = useDateStore((state) => state);
  const group = useGroupStore((state) => state.group);
  const classesState = useClassesStore((state) => state);

  useEffect(() => {
    if (!group) return;

    if (classesState.classes[dateState.dateString()]) return;

    const getClasses = async () => {
      let classes;

      if (isDateInCurrentWeek(dateState.date)) {
        classes = await getScheduleForWeek(dateState.dateString(), group);
      } else {
        classes = await getScheduleForDay(dateState.dateString(), group);
      }

      for (const [key, value] of Object.entries(classes)) {
        classesState.add(key, value);
      }
    };

    getClasses();
  }, [group, dateState.date]);

  useEffect(() => {
    if (!containerRef.current) return;

    let touchstartX = 0;
    let touchendX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchstartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchendX = e.changedTouches[0].screenX;
      checkDirection();
    };

    const checkDirection = () => {
      const deltaX = touchstartX - touchendX;

      if (deltaX > 100) {
        // Swipe left
        updateDate(1);
      } else if (deltaX < -100) {
        // Swipe right
        updateDate(-1);
      }
    };

    const updateDate = (direction: number) => {
      const tDate = new Date(dateState.date);
      tDate.setDate(tDate.getDate() + direction);
      dateState.set(tDate);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [containerRef.current, dateState]);

  const renderClasses = () => {
    if (classesState.classes[dateState.dateString()] === undefined) {
      return <p className="cc-loading">Loading....</p>;
    }

    if (
      Array.isArray(classesState.classes[dateState.dateString()]) &&
      classesState.classes[dateState.dateString()].length === 0
    ) {
      return <p className="cc-empty">Пар нет</p>;
    }

    return classesState.classes[dateState.dateString()].map((e) => (
      <Class props={e} />
    ));
  };

  const swapClass = (n: number) => {
    const date = new Date(dateState.date);
    date.setDate(date.getDate() + n);
    dateState.set(date);
  };

  return (
    <>
      <div className="mt-3 pr-4 pl-4 pb-32 w-full" ref={containerRef}>
        <div className="flex flex-row justify-between pt-4">
          <Arrow
            className="w-8 p-1.5"
            orientation="left"
            callback={() => swapClass(-1)}
          />
          <div className="flex text-2xl text-white">
            {dayNumberToString(dateState.date.getDay())}
          </div>
          <Arrow
            className="w-8 p-1.5"
            orientation="right"
            callback={() => swapClass(1)}
          />
        </div>
        <div className="cc-body">{renderClasses()}</div>
      </div>
    </>
  );
}

const Class = ({ props }: { props: IClass }) => {
  const [subgroup, setSubgroup] = useState<number>();

  useEffect(() => {
    setSubgroup(Object.keys(props.subjects).length > 1 ? 1 : 0);
  }, [props.subjects]);

  const handleClick = () => {
    setSubgroup((prevSubgroup) => (prevSubgroup === 1 ? 0 : 1));
  };

  const defineRow = (prop: string) => {
    if (subgroup === undefined) return '';

    if (props.subjects[subgroup]) {
      // @ts-expect-error
      return props.subjects[subgroup][prop];
    }
    // @ts-expect-error
    return props.subjects[0][prop] || '';
  };

  const renderSubgroups = (subjects: IClass['subjects']) => {
    const subgroups = Object.keys(subjects);

    if (subgroup === undefined) return null;

    return subgroups.map((e) => (
      <p
        className={
          'pt-1 pb-1 pl-2 pr-2' +
          (e === subgroup.toString() ? ' bg-cyan-700 rounded-xl' : '')
        }
      >
        Подгруппа {+e + 1}
      </p>
    ));
  };

  return (
    <>
      <div className="mt-4 p-4 rounded-xl border-1 border-solid border-gray-600">
        <div className="flex justify-between">
          <p className="text-white">
            {props.count}, <span className="text-gray-400">{props.time}</span>
          </p>
          <p className="text-gray-400">{defineRow('type')}</p>
        </div>
        <p className="text-2xl text-white">{defineRow('item')}</p>
        <p className="text-gray-400">{defineRow('teacher')}</p>
        <p className="text-gray-400">{defineRow('place')}</p>
        <button
          onClick={handleClick}
          className="p-0 text-gray-200 bg-gray-600 font-semibold flex w-fit mt-1 rounded-xl border-none cursor-pointer"
        >
          {renderSubgroups(props.subjects)}
        </button>
      </div>
    </>
  );
};

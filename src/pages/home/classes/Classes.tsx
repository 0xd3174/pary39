import { useEffect, useRef, useState } from 'preact/hooks';
import {
  getScheduleForDay,
  getScheduleForWeek,
  IClass,
} from '../../../utils/scrape';
import { useGroupStore } from '../../../stores/group';
import { useClassesStore } from '../../../stores/classes';
import { useDateStore } from '../../../stores/date';
import { dayNumberToString, isDateInCurrentWeek } from '../../../utils/date';
import { Arrow } from '../../../components/arrow/Arrow';
import { LoaderCircle, PartyPopper } from 'lucide-preact';

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

      if (deltaX > 70) {
        // Swipe left
        updateDate(1);
      } else if (deltaX < -70) {
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
      // return <p className="cc-loading">Loading....</p>;
      return (
        <div className="mt-8 flex flex-col w-fit p-16 rounded-xl text-white items-center border-1 border-solid border-outline">
          <p className="text-3xl">Загрузка...</p>
          <LoaderCircle className="mt-2 animate-spin size-8" />
        </div>
      );
    }

    if (
      Array.isArray(classesState.classes[dateState.dateString()]) &&
      classesState.classes[dateState.dateString()].length === 0
    ) {
      return (
        <div className="mt-8 flex flex-col w-fit p-16 rounded-xl text-white items-center border-1 border-solid border-outline">
          <p className="text-3xl">Пар нет!</p>
          <PartyPopper className="mt-2 size-32" />
        </div>
      );
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
            className="size-9 p-1.5"
            orientation="left"
            onClick={() => swapClass(-1)}
          />
          <div className="flex text-2xl text-white">
            {dayNumberToString(dateState.date.getDay())}
          </div>
          <Arrow
            className="size-9 p-1.5"
            orientation="right"
            onClick={() => swapClass(1)}
          />
        </div>
        <div className="flex flex-col items-center">{renderClasses()}</div>
      </div>
    </>
  );
}

const Class = ({ props }: { props: IClass }) => {
  const [subgroup, setSubgroup] = useState<number>();

  useEffect(() => {
    setSubgroup(Object.keys(props.subjects).length > 1 ? 1 : 0);
  }, [props.subjects]);

  const handleClick = (subjects: IClass['subjects']) => {
    if (Object.keys(subjects).length > 1) {
      setSubgroup((prevSubgroup) => (prevSubgroup === 1 ? 0 : 1));
    }
  };

  const defineRow = (prop: string) => {
    if (subgroup === undefined) return '';

    if (
      prop === 'place' &&
      (
        (props.subjects[subgroup] && props.subjects[subgroup][prop]) ||
        props.subjects[0][prop]
      ).startsWith('http')
    ) {
      if (props.subjects[subgroup]) {
        return (
          <a
            className="text-cyan-600 underline"
            href={props.subjects[subgroup][prop]}
          >
            Ссылка
          </a>
        );
      }
      return (
        <a
          className="text-cyan-600 underline"
          href={props.subjects[0][prop] || ''}
        >
          Ссылка
        </a>
      );
    }

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

    const subgroupStr = subgroup.toString();

    return subgroups.map((e) => {
      const subgroupKey = parseInt(e);
      const subject = subjects[subgroupKey];

      const subgroupText =
        subject.subgroup !== -1 ? `Подгруппа ${subject.subgroup}` : 'Общая';

      return (
        <div
          className={`pt-1 pb-1 pl-2 pr-2 ${
            e === subgroupStr ? 'bg-outline rounded-[calc(0.75rem-2px)]' : ''
          }`}
        >
          {subgroupText}
        </div>
      );
    });
  };

  return (
    <>
      <div className="mt-4 p-4 rounded-xl border-1 border-solid border border-outline w-full">
        <div className="mb-1 flex justify-between">
          <p className="text-white">
            {props.count.trim()},{' '}
            <span className="text-zinc-500">{props.time}</span>
          </p>
          <p className="text-zinc-500">{defineRow('type')}</p>
        </div>
        <p className="mb-1 text-2xl text-white">{defineRow('item')}</p>
        <p className="mb-1 text-zinc-500">{defineRow('teacher')}</p>
        <p className="mb-2 text-zinc-500">{defineRow('place')}</p>
        <button
          onClick={() => handleClick(props.subjects)}
          className="border-1 border-solid border-outline p-0 text-gray-200 font-semibold flex w-fit mt-1 rounded-xl cursor-pointer"
        >
          {renderSubgroups(props.subjects)}
        </button>
      </div>
    </>
  );
};

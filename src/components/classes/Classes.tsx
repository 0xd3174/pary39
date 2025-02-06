import { useEffect, useRef, useState } from 'preact/hooks';
import {
  getScheduleForDay,
  getScheduleForWeek,
  IClass,
} from '../../utils/scrape';
import './classes.css';
import { useGroupStore } from '../../stores/group';
import { useClassesStore } from '../../stores/classes';
import { useDateStore } from '../../stores/date';
import { dayNumberToString, isDateInCurrentWeek } from '../../utils/date';
import arrowIcon from '/src/svg/arrow.svg';

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
      <div class="classes-container" ref={containerRef}>
        <div class="cc-header">
          <img src={arrowIcon} onClick={() => swapClass(-1)}></img>
          <div className="cc-header-text">
            {dayNumberToString(dateState.date.getDay())}
          </div>
          <img src={arrowIcon} onClick={() => swapClass(1)}></img>
        </div>
        <div class="cc-body">{renderClasses()}</div>
      </div>
    </>
  );
}

const renderSubgroups = (subjects: IClass['subjects'], subgroup?: number) => {
  const subgroups = Object.keys(subjects);

  if (subgroup === undefined) return null;

  if (subgroups.length > 1) {
    return subgroups.map((e) => (
      <p className={e === subgroup.toString() ? 'active' : ''}>
        Подгруппа {+e + 1}
      </p>
    ));
  } else {
    return <p>Общая</p>;
  }
};

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

  return (
    <>
      <div className="class-card">
        <div className="cs-header-container">
          <p className="cs-header-title-count">
            {props.count},{' '}
            <span className="cs-header-title-time">{props.time}</span>
          </p>
          <p className="cs-header-type">{defineRow('type')}</p>
        </div>
        <p className="cs-item">{defineRow('item')}</p>
        <p className="cs-teacher">{defineRow('teacher')}</p>
        <p className="cs-place">{defineRow('place')}</p>
        <button onClick={handleClick} className="subgroup">
          {renderSubgroups(props.subjects, subgroup)}
        </button>
      </div>
    </>
  );
};

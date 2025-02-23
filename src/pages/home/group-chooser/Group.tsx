import { MutableRef, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useModalStore } from '../../../stores/modal';
import { useGroupChooserStore, useGroupStore } from '../../../stores/group';
import { Dropdown } from '../../../components/dropdown/Dropdown';
import { generateComponentId } from '../../../utils/generate-id';
import { useDropdownStore } from '../../../stores/dropdown';
import { TargetedEvent } from 'preact/compat';
import { getGroups } from '../../../utils/get-groups';
import { DropdownSearch } from '../../../components/dropdown/DropdownSearch';

const EDUCATION_LEVELS = [
  'СПО',
  'Бакалавриат',
  'Магистратура',
  'Специалитет',
  'Аспирантура',
  'Ординатура',
];

const COURSES_BY_LEVEL: Record<string, string[]> = {
  СПО: ['1', '2', '3', '4', '5'],
  Бакалавриат: ['1', '2', '3', '4', '5'],
  Магистратура: ['1', '2'],
  Специалитет: ['1', '2', '3', '4', '5'],
  Аспирантура: ['1', '2', '3', '4'],
  Ординатура: [],
};

const ABBREVIATIONS_BY_LEVEL: Record<string, string> = {
  СПО: '02',
  Бакалавриат: '03',
  Магистратура: '04',
  Специалитет: '05',
  Аспирантура: '06',
  Ординатура: '08',
};

export function GroupChooser() {
  const groupState = useGroupStore((state) => state);

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

  useEffect(() => {
    const selectedGroup = localStorage.getItem('selected-group');

    if (selectedGroup) {
      groupState.set(selectedGroup);
    }
  }, []);

  return (
    <>
      <div
        onClick={() => modalState.open(modalId)}
        className="cursor-pointer mr-auto ml-auto"
      >
        <p className="text-center text-dark dark:text-white text-lg font-bold">
          {groupState.group || 'Группа не выбрана'}
        </p>
        <p className="text-center text-zinc-500">
          Нажмите, чтобы выбрать группу
        </p>
      </div>

      {isLocalModalOpen && <GroupChooserModal dialogRef={ref} />}
    </>
  );
}

interface GroupChooserModalProps {
  dialogRef: MutableRef<HTMLDialogElement | null>;
}

function GroupChooserModal({ dialogRef }: GroupChooserModalProps) {
  const closeModal = useModalStore((state) => {
    return state.close;
  });
  const setGroup = useGroupStore((state) => state.set);
  const { level, setLevel, course, setCourse } = useGroupChooserStore(
    (state) => state
  );
  const closeDropdown = useDropdownStore((state) => state.close);
  const [groups, setGroups] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchGroups = async () => {
      const fetchedGroups = await getGroups();
      setGroups(fetchedGroups);
    };

    fetchGroups();
  }, []);

  const handleClickOutsideDropdowns = (e: TargetedEvent<HTMLDialogElement>) => {
    if (!(e.target instanceof HTMLParagraphElement)) {
      closeDropdown();
    }
  };

  const renderGroups = () => {
    if (!level || !course) return [];

    const date = new Date();
    const isNextCourse = date.getMonth() >= 9;
    const year = date.getFullYear() - (isNextCourse ? 1 : 0);
    const yearSuffix = year.toString().slice(-2);

    return groups.filter((group) => {
      const [abbreviation, , groupYear] = group.split('_');
      return (
        abbreviation === ABBREVIATIONS_BY_LEVEL[level] &&
        groupYear === (parseInt(yearSuffix) - parseInt(course)).toString()
      );
    });
  };

  return (
    <dialog
      className="w-[calc(100%-3rem)] max-w-[550px] p-6 rounded-xl border-1 border-solid bg-white dark:bg-black border-outline overflow-visible m-auto focus:outline animate-[modal_150ms_linear]"
      ref={dialogRef}
      onClick={handleClickOutsideDropdowns}
    >
      <h1 className="text-dark dark:text-white text-2xl mb-2">Выбор группы</h1>

      <Dropdown
        title="Уровень образования"
        items={EDUCATION_LEVELS}
        handler={setLevel}
      />

      <Dropdown
        className="mt-4"
        title="Курс"
        items={level ? COURSES_BY_LEVEL[level] : []}
        disabled={!level}
        handler={setCourse}
      />

      <DropdownSearch
        className="mt-4"
        title="Направление"
        items={course ? renderGroups() : []}
        disabled={!course}
        handler={(item) => {
          setGroup(item);
          localStorage.setItem('selected-group', item);
          closeModal();
        }}
      />
    </dialog>
  );
}

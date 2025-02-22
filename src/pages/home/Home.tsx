import { Calendar } from './calendar/Calendar.tsx';
import { GroupChooser } from './group-chooser/Group.tsx';
import { Classes } from './classes/Classes.tsx';

export function Home() {
  return (
    <>
      <GroupChooser />
      <Calendar />
      <Classes />
    </>
  );
}

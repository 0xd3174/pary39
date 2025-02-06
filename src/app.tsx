import { Calendar } from './components/calendar/Calendar.tsx';
import { GroupChooser } from './components/group-chooser/Group.tsx';
import { Classes } from './components/classes/Classes.tsx';
import './app.css';

export function App() {
  return (
    <>
      <GroupChooser />
      <Calendar />
      <Classes />
      <nav></nav>
    </>
  );
}

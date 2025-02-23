import { useEffect, useState } from 'preact/hooks';
import { Switch } from '../../components/switch/Switch';

export function Settings() {
  const [theme, setTheme] = useState<boolean>(false);
  const [subgroup, setSubgroup] = useState<boolean>(false);

  useEffect(() => {
    setTheme(localStorage.getItem('theme') === 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme ? 'dark' : 'light');

    document.documentElement.classList.toggle(
      'dark',
      localStorage.theme === 'dark' ||
        (!('theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  }, [theme]);

  return (
    <>
      <div className="w-full">
        <h1 className="text-black dark:text-white text-2xl mb-1">Настройки</h1>
        <Switch
          title={`Подгруппа ${+subgroup + 1} (не работает)`}
          isChecked={subgroup}
          setChecked={setSubgroup}
          className="mb-1"
        ></Switch>
        <Switch
          title={`Тёмная тема`}
          isChecked={theme}
          setChecked={setTheme}
        ></Switch>
      </div>
    </>
  );
}

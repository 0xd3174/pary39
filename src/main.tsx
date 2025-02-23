import { render } from 'preact';
import './index.css';
import { App } from './app.tsx';

document.documentElement.classList.toggle(
  'dark',
  localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
);

render(<App />, document.getElementById('app')!);

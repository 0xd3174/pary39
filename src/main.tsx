import { render } from 'preact';
import './index.css';
import { App } from './app.tsx';

document.documentElement.classList.toggle(
  'dark',
  localStorage.theme === 'dark'
);

render(<App />, document.getElementById('app')!);

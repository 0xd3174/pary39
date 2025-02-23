import { Route, Switch } from 'wouter-preact';
import { Home } from './pages/home/Home.tsx';
import { Settings } from './pages/settings/Settings.tsx';
import { Navbar } from './components/navbar/Navbar';
import { NotFound } from './pages/not-found/NotFound.tsx';

export function App() {
  return (
    <>
      <div className="container max-w-2xl flex items-center flex-col space-y-4 m-auto h-screen p-4">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/настройки" component={Settings} />
          <Route path="*" component={NotFound}></Route>
        </Switch>
        <Navbar />
      </div>
    </>
  );
}

import { Route, Switch } from 'wouter-preact';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';
import { Navbar } from './shared/navbar/Navbar';

export function App() {
  return (
    <>
      <div className="container max-w-2xl flex items-center flex-col m-auto h-screen">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/settings" component={Settings} />
        </Switch>
        <Navbar />
      </div>
    </>
  );
}

import SystemConsole from "./pages/SystemConsole";
import { SystemFacadeProvider } from "./contexts/SystemFacadeContext";
import Lobby from "./pages/Lobby";
import { ToastProvider } from "./contexts/ToastContext";
import { useState } from 'preact/hooks';
import { render } from 'preact';
import './index.css';

function App() {
  const [route, setRoute] = useState("lobby");
  return (
    <ToastProvider>
      <SystemFacadeProvider>
        {route === "lobby" ? (
          <Lobby onJoin={() => setRoute("session")} />
        ) : route === "session" ? (
          <SystemConsole onLeave={() => setRoute("lobby")} />
        ) : null}
      </SystemFacadeProvider>
    </ToastProvider>
  );
}

render(<App />, document.getElementById("root")!);

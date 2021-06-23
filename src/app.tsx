import { h, render } from "preact";
import { useState } from "preact/hooks";
import SystemConsole from "./pages/SystemConsole";
import { SystemFacadeProvider } from "./contexts/SystemFacadeContext";
import Lobby from "./pages/Lobby";
import { ToastProvider } from "./contexts/ToastContext";
import "./index.css";

function App() {
  const [route, setRoute] = useState("lobby");
  const [sessionId, setSessionId] = useState<number | null>(null);
  return (
    <ToastProvider>
      <SystemFacadeProvider>
        {route === "lobby" ? (
          <Lobby
            onJoin={(sessionId) => {
              setSessionId(sessionId);
              setRoute("session");
            }}
          />
        ) : route === "session" ? (
          <SystemConsole
            sessionId={sessionId!}
            onLeave={() => setRoute("lobby")}
          />
        ) : null}
      </SystemFacadeProvider>
    </ToastProvider>
  );
}

render(<App />, document.getElementById("root")!);

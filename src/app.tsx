import { h, render } from "preact";
import { useState } from "preact/hooks";
import SystemConsole from "./pages/SystemConsole";
import Lobby from "./pages/Lobby";
import { ToastProvider } from "./contexts/ToastContext";
import "./index.css";

function App() {
  const [route, setRoute] = useState("lobby");
  const [fileId, setFileId] = useState<string | null>(null);
  return (
    <ToastProvider>
      {route === "lobby" ? (
        <Lobby
          onJoin={(fileId) => {
            setFileId(fileId);
            setRoute("session");
          }}
        />
      ) : route === "session" ? (
        <SystemConsole fileId={fileId!} onLeave={() => setRoute("lobby")} />
      ) : null}
    </ToastProvider>
  );
}

render(<App />, document.getElementById("root")!);

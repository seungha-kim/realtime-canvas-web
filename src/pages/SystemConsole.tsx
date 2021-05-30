import { h } from "preact";
import Canvas from "../components/Canvas";
import DocumentHeader from "../components/DocumentHeader";
import SessionControl from "../components/SessionControl";
import DrawingToolbar from "../components/DrawingToolbar";
import LayerPanel from "../components/LayerPanel";
import AttrPanel from "../components/AttrPanel";
import { FocusProvider } from "../contexts/FocusContext";
import { PanzoomProvider } from "../contexts/PanzoomContext";
import { LivePointerProvider } from "../contexts/LivePointerContext";
import { useSystemFacade } from "../contexts/SystemFacadeContext";

type Props = {
  onLeave: () => void;
};

type InnerProps = Props;

function SystemConsoleInner(props: InnerProps) {
  return (
    <div>
      <DocumentHeader />
      <DrawingToolbar />
      <SessionControl onLeave={props.onLeave} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <LayerPanel />
        <Canvas />
        <AttrPanel />
      </div>
    </div>
  );
}

function SystemConsole(props: Props) {
  const systemFacade = useSystemFacade();
  return (
    <FocusProvider>
      <PanzoomProvider>
        <LivePointerProvider systemFacade={systemFacade}>
          <SystemConsoleInner {...props} />
        </LivePointerProvider>
      </PanzoomProvider>
    </FocusProvider>
  );
}

export default SystemConsole;

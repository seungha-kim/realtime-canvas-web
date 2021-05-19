import { h } from "preact";
import Canvas from "../components/Canvas";
import DocumentHeader from "../components/DocumentHeader";
import SessionControl from "../components/SessionControl";
import DrawingToolbar from "../components/DrawingToolbar";
import LayerPanel from "../components/LayerPanel";
import AttrPanel from "../components/AttrPanel";
import { FocusProvider, useFocusSelector } from "../contexts/FocusContext";

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
  return (
    <FocusProvider>
      <SystemConsoleInner {...props} />
    </FocusProvider>
  );
}

export default SystemConsole;

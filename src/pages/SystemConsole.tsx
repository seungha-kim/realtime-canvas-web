import { h } from "preact";
import Canvas from "../components/Canvas";
import DocumentHeader from "../components/DocumentHeader";
import SessionControl from "../components/SessionControl";
import DrawingToolbar from "../components/DrawingToolbar";
import LayerPanel from "../components/LayerPanel";
import AttrPanel from "../components/AttrPanel";
import {
  EditModeProvider,
  useEditModeSelector,
} from "../contexts/EditModeContext";

type Props = {
  onLeave: () => void;
};

type InnerProps = Props;

function SystemConsoleInner(props: InnerProps) {
  const [, updateEditMode] = useEditModeSelector(() => null);
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        updateEditMode(null);
      }}
    >
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
    <EditModeProvider>
      <SystemConsoleInner {...props} />
    </EditModeProvider>
  );
}

export default SystemConsole;

import Canvas from "../components/Canvas";
import DocumentHeader from "../components/DocumentHeader";
import SessionControl from "../components/SessionControl";
import DrawingToolbar from "../components/DrawingToolbar";
import LayerPanel from "../components/LayerPanel";
import AttrPanel from "../components/AttrPanel";
import { EditModeProvider } from "../contexts/EditModeContext";

type Props = {
  onLeave: () => void;
};

function SystemConsole(props: Props) {
  return (
    <div>
      <EditModeProvider>
        <DocumentHeader />
        <DrawingToolbar />
        <SessionControl onLeave={props.onLeave} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <LayerPanel />
          <Canvas />
          <AttrPanel />
        </div>
      </EditModeProvider>
    </div>
  );
}

export default SystemConsole;

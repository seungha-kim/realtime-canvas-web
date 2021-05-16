import Canvas from "../components/Canvas";
import DocumentHeader from "../components/DocumentHeader";
import SessionControl from "../components/SessionControl";
import DrawingToolbar from "../components/DrawingToolbar";
import LayerPanel from "../components/LayerPanel";

type Props = {
  onLeave: () => void;
};

function SystemConsole(props: Props) {
  return (
    <div>
      <DocumentHeader />
      <DrawingToolbar />
      <SessionControl onLeave={props.onLeave} />
      <div style={{ display: "flex" }}>
        <LayerPanel />
        <Canvas />
      </div>
    </div>
  );
}

export default SystemConsole;

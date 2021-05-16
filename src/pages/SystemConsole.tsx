import Canvas from "../components/Canvas";
import DocumentHeader from "../components/DocumentHeader";
import SessionControl from "../components/SessionControl";
import DrawingToolbar from "../components/DrawingToolbar";

type Props = {
  onLeave: () => void;
};

function SystemConsole(props: Props) {
  return (
    <div>
      <DocumentHeader />
      <DrawingToolbar />
      <SessionControl onLeave={props.onLeave} />
      <Canvas />
    </div>
  );
}

export default SystemConsole;

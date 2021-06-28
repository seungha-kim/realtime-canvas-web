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
import { SystemFacadeProvider } from "../contexts/SystemFacadeContext";
import { MaterialBroadcastProvider } from "../contexts/MaterialBroadcastContext";

type Props = {
  fileId: string;
  onLeave: () => void;
};

function SystemConsole(props: Props) {
  return (
    <SystemFacadeProvider fileId={props.fileId}>
      <FocusProvider>
        <PanzoomProvider>
          <LivePointerProvider>
            <MaterialBroadcastProvider>
              <div>
                <DocumentHeader fileId={props.fileId} />
                <DrawingToolbar />
                <SessionControl onLeave={props.onLeave} />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <LayerPanel />
                  <Canvas />
                  <AttrPanel />
                </div>
              </div>
            </MaterialBroadcastProvider>
          </LivePointerProvider>
        </PanzoomProvider>
      </FocusProvider>
    </SystemFacadeProvider>
  );
}

export default SystemConsole;

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
  sessionId: number;
  onLeave: () => void;
};

function SystemConsole(props: Props) {
  return (
    <SystemFacadeProvider sessionId={props.sessionId}>
      <FocusProvider>
        <PanzoomProvider>
          <LivePointerProvider>
            <MaterialBroadcastProvider>
              <div>
                <DocumentHeader sessionId={props.sessionId} />
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

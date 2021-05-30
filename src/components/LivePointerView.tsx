import { h } from "preact";
import { useLivePointer } from "../contexts/LivePointerContext";
import { usePanzoom$ } from "../contexts/PanzoomContext";
import { useSessionSnapshot } from "../hooks";

const LivePointerItemView = (props: { connectionId: number }) => {
  const livePointer = useLivePointer(props.connectionId);
  const panzoom$ = usePanzoom$();

  if (!livePointer) return null;

  const [left, top] = panzoom$.logicalToDomPoint([
    livePointer.x,
    livePointer.y,
  ]);

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        transition: "left 0.3s, top 0.3s",
      }}
    >
      {livePointer.connection_id}
    </div>
  );
};

export const LivePointerListView = () => {
  const sessionSnapshot = useSessionSnapshot();
  return (
    <div
      style={{
        width: 500,
        height: 500,
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {sessionSnapshot?.connections.map((connectionId) => (
        <LivePointerItemView key={connectionId} connectionId={connectionId} />
      ))}
    </div>
  );
};

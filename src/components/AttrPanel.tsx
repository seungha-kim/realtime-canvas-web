import { h } from "preact";
import { useFocusedObjectId } from "../contexts/FocusContext";
import ObjectAttr from "./attr/ObjectAttr";

function createInner(focusedObjectId: string | null) {
  if (focusedObjectId !== null) {
    return <ObjectAttr id={focusedObjectId} key={focusedObjectId} />;
  } else {
    return null;
  }
}

function AttrPanel() {
  const focusedObjectId = useFocusedObjectId();
  return (
    <div
      style={{
        backgroundColor: "silver",
        flex: "0 0 200px",
        overflow: "hidden",
      }}
    >
      {createInner(focusedObjectId)}
    </div>
  );
}

export default AttrPanel;

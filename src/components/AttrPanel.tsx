import { h } from "preact";
import {
  selectFocusedObjectId,
  useFocusSelector,
} from "../contexts/FocusContext";
import ObjectAttr from "./attr/ObjectAttr";

function createInner(editingObjectId: string | null) {
  if (editingObjectId !== null) {
    return <ObjectAttr id={editingObjectId} />;
  } else {
    return null;
  }
}

function AttrPanel() {
  const [editingObjectId] = useFocusSelector(selectFocusedObjectId);

  return (
    <div style={{ backgroundColor: "silver", flex: "0 0 200px" }}>
      {createInner(editingObjectId)}
    </div>
  );
}

export default AttrPanel;

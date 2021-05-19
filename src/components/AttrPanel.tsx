import { h } from "preact";
import {
  selectEditingObjectId,
  useEditingSelector,
} from "../contexts/EditingContext";
import ObjectAttr from "./attr/ObjectAttr";

function createInner(editingObjectId: string | null) {
  if (editingObjectId !== null) {
    return <ObjectAttr id={editingObjectId} />;
  } else {
    return null;
  }
}

function AttrPanel() {
  const [editingObjectId] = useEditingSelector(selectEditingObjectId);

  return (
    <div style={{ backgroundColor: "silver", flex: "0 0 200px" }}>
      {createInner(editingObjectId)}
    </div>
  );
}

export default AttrPanel;

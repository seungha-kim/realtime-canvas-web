import { EditMode, useEditMode } from "../contexts/EditModeContext";
import ObjectAttr from "./attr/ObjectAttr";

function createInner(mode: EditMode) {
  switch (mode?.type) {
    case "layerAttr":
      return <ObjectAttr id={mode.id} />;
    default:
      return null;
  }
}

function AttrPanel() {
  const { editMode } = useEditMode();
  return (
    <div style={{ backgroundColor: "silver", flex: "0 0 200px" }}>
      {createInner(editMode)}
    </div>
  );
}

export default AttrPanel;

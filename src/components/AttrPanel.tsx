import { h } from "preact";
import { useFocusedObjectId } from "../contexts/FocusContext";
import ObjectAttr from "./attr/ObjectAttr";
import { useSystemFacade } from "../contexts/SystemFacadeContext";

function AttrPanel() {
  const system = useSystemFacade();
  const focusedObjectId =
    useFocusedObjectId() ?? system.materializeDocument().id; // TODO: system 으로부터 document id 직접 받아오기
  return (
    <div
      style={{
        backgroundColor: "silver",
        flex: "0 0 200px",
        overflow: "hidden",
      }}
    >
      <ObjectAttr id={focusedObjectId} key={focusedObjectId} />
    </div>
  );
}

export default AttrPanel;

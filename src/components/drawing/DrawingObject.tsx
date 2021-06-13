import { h } from "preact";
import Oval from "./Oval";
import { useObjectMaterial } from "../../contexts/MaterialBroadcastContext";
import Frame from "./Frame";

type Props = {
  objectId: string;
};

function DrawingObject(props: Props) {
  const material = useObjectMaterial(props.objectId);
  if (material?.Oval) {
    return <Oval material={material.Oval} />;
  } else if (material?.Frame) {
    return <Frame material={material.Frame} />;
  } else {
    console.log(`Can't draw yet: ${material}`);
    return null;
  }
}

export default DrawingObject;

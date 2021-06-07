import { h } from "preact";
import Oval from "./Oval";
import { useObjectMaterial } from "../../contexts/MaterialBroadcastContext";

type Props = {
  objectId: string;
};

function DrawingObject(props: Props) {
  const material = useObjectMaterial(props.objectId);
  if (material?.Oval) {
    return <Oval material={material.Oval} />;
  } else {
    console.log(`Can't draw yet: ${material}`);
    return null;
  }
}

export default DrawingObject;

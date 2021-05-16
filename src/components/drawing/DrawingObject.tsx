import { ObjectMaterial } from "../../SystemFacade";
import Oval from "./Oval";

type Props = {
  material: ObjectMaterial;
};

function DrawingObject(props: Props) {
  if (props.material.Oval) {
    return <Oval material={props.material.Oval} />;
  } else {
    return null;
  }
}

export default DrawingObject;

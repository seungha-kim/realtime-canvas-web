import { useObjectMaterial } from "../../hooks";
import OvalAttr from "./OvalAttr";

type Props = {
  id: string;
};

function ObjectAttr(props: Props) {
  const material = useObjectMaterial(props.id);
  if (material?.Oval) {
    return <OvalAttr oval={material.Oval} />;
  } else {
    return null;
  }
}

export default ObjectAttr;

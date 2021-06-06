import { h } from "preact";
import { useDocumentMaterial, useObjectMaterial } from "../../hooks";
import OvalAttr from "./OvalAttr";

type Props = {
  id: string;
};

function ObjectAttr(props: Props) {
  const material = useObjectMaterial(props.id);
  const document = useDocumentMaterial();
  const index = document!.children.findIndex((id) => id === props.id);
  if (material?.Oval) {
    return <OvalAttr oval={material.Oval} index={index} />;
  } else {
    return null;
  }
}

export default ObjectAttr;

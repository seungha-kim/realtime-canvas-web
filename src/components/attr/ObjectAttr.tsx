import { h } from "preact";
import {
  useDocumentMaterial,
  useObjectMaterial,
} from "../../contexts/MaterialBroadcastContext";
import OvalAttr from "./OvalAttr";
import FrameAttr from "./FrameAttr";
import DocumentAttr from "./DocumentAttr";

type Props = {
  id: string;
};

function ObjectAttr(props: Props) {
  const material = useObjectMaterial(props.id);
  const document = useDocumentMaterial();
  const index = document!.children.findIndex((id) => id === props.id);
  if (material.Oval) {
    return <OvalAttr oval={material.Oval} index={index} />;
  } else if (material.Frame) {
    return <FrameAttr material={material.Frame} index={index} />;
  } else if (material.Document) {
    return <DocumentAttr document={material.Document} />;
  } else {
    return null;
  }
}

export default ObjectAttr;

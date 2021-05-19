import { h } from "preact";
import { ObjectMaterial } from "../SystemFacade";
import { useObjectMaterial } from "../hooks";

type Props = {
  id: string;
  onClick: () => void;
  onDblClick: () => void;
  selected: boolean;
};

type LayerDescription = {
  type: string;
  name: string;
};

function createDescription(material: ObjectMaterial): LayerDescription {
  if (material.Oval) {
    return {
      type: "Oval",
      name: material.Oval.name,
    };
  } else {
    return {
      type: "Undefined",
      name: "Undefined",
    };
  }
}

function LayerPanelItem(props: Props) {
  const material = useObjectMaterial(props.id);
  const desc = material && createDescription(material);
  return (
    <div
      style={{ backgroundColor: props.selected ? "red" : null }}
      onClick={(e) => {
        e.stopPropagation();
        props.onClick();
      }}
      onDblClick={(e) => {
        e.stopPropagation();
        props.onDblClick();
      }}
    >
      {desc?.type} - {desc?.name}
    </div>
  );
}

export default LayerPanelItem;

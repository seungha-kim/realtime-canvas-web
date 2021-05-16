import { ObjectMaterial } from "../SystemFacade";
import { useObjectMaterial } from "../hooks";

type Props = {
  id: string;
  onClick: () => void;
  onDblClick: () => void;
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
    <div onClick={props.onClick} onDblClick={props.onDblClick}>
      {desc?.type} - {desc?.name}
    </div>
  );
}

export default LayerPanelItem;

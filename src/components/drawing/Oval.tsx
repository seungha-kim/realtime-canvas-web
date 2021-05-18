import { ObjectMaterial } from "../../SystemFacade";
import { Component } from "preact";
import { useEditMode } from "../../contexts/EditModeContext";

type Props = {
  material: ObjectMaterial["Oval"];
};

type InnerProps = Props & {
  selected: boolean;
  onSelect: () => void;
};

type InnerState = {};

class OvalInner extends Component<InnerProps, InnerState> {
  render() {
    const { pos_x, pos_y, r_h, r_v } = this.props.material!;
    return (
      <>
        <ellipse
          onClick={(e) => {
            e.stopPropagation();
            this.props.onSelect();
          }}
          cx={pos_x}
          cy={pos_y}
          rx={r_h}
          ry={r_v}
        />
        {this.props.selected && (
          <rect
            x={pos_x - r_h}
            y={pos_y - r_v}
            width={r_h * 2}
            height={r_v * 2}
            stroke={"red"}
            fill={"none"}
          />
        )}
      </>
    );
  }
}

function Oval(props: Props) {
  const { editMode, updateEditMode } = useEditMode();
  const selected =
    (editMode?.type == "layerAttr" && editMode.id == props.material?.id) ??
    false;
  return (
    <OvalInner
      selected={selected}
      {...props}
      onSelect={() => {
        if (props.material) {
          updateEditMode({
            type: "layerAttr",
            id: props.material.id,
          });
        }
      }}
    />
  );
}

export default Oval;

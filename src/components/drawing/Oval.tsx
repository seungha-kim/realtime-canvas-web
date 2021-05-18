import { ObjectMaterial } from "../../SystemFacade";
import { Component } from "preact";
import {
  selectEditingObjectId,
  useEditModeSelector,
} from "../../contexts/EditModeContext";
import { useSystemFacade } from "../../contexts/SystemFacadeContext";

type Props = {
  material: ObjectMaterial["Oval"];
};

type InnerProps = Props & {
  selected: boolean;
  onSelect: () => void;
  onMoveFinished: (x: number, y: number) => void;
};

type InnerState = {
  controlMode:
    | null
    | { type: "prepareMoving"; initialMousePos: [number, number] }
    | {
        type: "moving";
        initialMousePos: [number, number];
        currentMousePos: [number, number];
      }
    | { type: "rotating" }
    | { type: "resizing" };
};

class OvalInner extends Component<InnerProps, InnerState> {
  state: InnerState = {
    controlMode: null,
  };

  render() {
    let { selected } = this.props;
    let { pos_x, pos_y, r_h, r_v } = this.props.material!;
    const { controlMode } = this.state;

    if (controlMode?.type == "moving") {
      const [initialX, initialY] = controlMode.initialMousePos;
      const [currentX, currentY] = controlMode.currentMousePos;
      const dx = currentX - initialX;
      const dy = currentY - initialY;
      pos_x += dx;
      pos_y += dy;
    }

    return (
      <>
        <ellipse
          onClick={(e) => {
            e.stopPropagation();
            this.props.onSelect();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (selected && !controlMode) {
              this.setState({
                controlMode: {
                  type: "prepareMoving",
                  initialMousePos: [e.clientX, e.clientY],
                },
              });
            }
          }}
          onMouseMove={(e) => {
            e.stopPropagation();
            if (!selected && controlMode !== null) {
              this.setState({
                controlMode: null,
              });
            } else if (controlMode && controlMode?.type === "prepareMoving") {
              this.setState({
                controlMode: {
                  type: "moving",
                  initialMousePos: controlMode.initialMousePos,
                  currentMousePos: [e.clientX, e.clientY],
                },
              });
            } else if (controlMode?.type === "moving") {
              this.setState({
                controlMode: {
                  ...controlMode,
                  currentMousePos: [e.clientX, e.clientY],
                },
              });
            }
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            if (
              controlMode?.type === "prepareMoving" ||
              controlMode?.type === "moving"
            ) {
              this.props.onMoveFinished(pos_x, pos_y);
              this.setState({
                controlMode: null,
              });
            }
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
  const [editingObjectId, updateEditMode] = useEditModeSelector(
    selectEditingObjectId
  );
  const system = useSystemFacade();
  const selected = editingObjectId === props.material?.id;
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
      onMoveFinished={(x, y) => {
        system.pushDocumentCommand({
          UpdatePosition: {
            id: props.material!.id,
            pos: [x, y],
          },
        });
      }}
    />
  );
}

export default Oval;

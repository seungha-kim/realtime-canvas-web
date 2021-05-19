import { Component, h, Fragment } from "preact";
import { ObjectMaterial } from "../../SystemFacade";
import {
  GlobalEditModeType,
  selectEditingObjectId,
  useEditingSelector,
} from "../../contexts/EditingContext";
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

  componentWillUnmount() {
    this.cleanupGlobalEventListeners();
  }

  private attachGlobalEventListeners() {
    document.addEventListener("mousemove", this.handleGlobalMouseMove);
    document.addEventListener("mouseup", this.handleGlobalMouseUp);
  }

  private cleanupGlobalEventListeners() {
    document.removeEventListener("mousemove", this.handleGlobalMouseMove);
    document.removeEventListener("mouseup", this.handleGlobalMouseUp);
  }

  handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    this.props.onSelect();
  };

  handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.props.selected && !this.state.controlMode) {
      this.attachGlobalEventListeners();

      this.setState({
        controlMode: {
          type: "prepareMoving",
          initialMousePos: [e.clientX, e.clientY],
        },
      });
    }
  };

  handleGlobalMouseMove = (e: MouseEvent) => {
    const { selected } = this.props;
    const { controlMode } = this.state;
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
  };

  handleGlobalMouseUp = () => {
    const { controlMode } = this.state;
    this.cleanupGlobalEventListeners();

    if (
      controlMode?.type === "prepareMoving" ||
      controlMode?.type === "moving"
    ) {
      const [pos_x, pos_y] = this.controlledPosition;
      this.props.onMoveFinished(pos_x, pos_y);
      this.setState({
        controlMode: null,
      });
    }
  };

  get controlledPosition(): [number, number] {
    const { controlMode } = this.state;
    let { pos_x, pos_y } = this.props.material!;
    if (controlMode?.type == "moving") {
      const [initialX, initialY] = controlMode.initialMousePos;
      const [currentX, currentY] = controlMode.currentMousePos;
      const dx = currentX - initialX;
      const dy = currentY - initialY;
      pos_x += dx;
      pos_y += dy;
    }
    return [pos_x, pos_y];
  }

  render() {
    let { r_h, r_v } = this.props.material!;
    let [pos_x, pos_y] = this.controlledPosition;

    return (
      <>
        <ellipse
          onClick={this.handleClick}
          onMouseDown={this.handleMouseDown}
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
  const [editingObjectId, updateEditMode] = useEditingSelector(
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
            type: GlobalEditModeType.canvasObject,
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

import { Component, h, Fragment } from "preact";
import { ObjectMaterial } from "../../SystemFacade";
import {
  FocusType,
  useFocus$,
  useFocusedObjectId,
} from "../../contexts/FocusContext";
import { useSystemFacade } from "../../contexts/SystemFacadeContext";
import { PanzoomObservable, usePanzoom$ } from "../../contexts/PanzoomContext";
import { CanvasInfo, useCanvasInfo } from "../../contexts/CanvasInfoContext";

type Props = {
  material: ObjectMaterial["Oval"];
};

type InnerProps = Props & {
  panzoomObservable: PanzoomObservable;
  selected: boolean;
  onSelect: () => void;
  onMoveFinished: (x: number, y: number) => void;
  canvasInfo: CanvasInfo;
};

type InnerState = {
  controlMode:
    | null
    | { type: "prepareMoving"; initialLogicalPoint: [number, number] }
    | {
        type: "moving";
        initialLogicalPoint: [number, number];
        currentLogicalPoint: [number, number];
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
    if (!this.props.selected) {
      this.props.onSelect();
    }
    if (!this.state.controlMode) {
      this.attachGlobalEventListeners();

      this.setState({
        controlMode: {
          type: "prepareMoving",
          initialLogicalPoint: this.props.canvasInfo.clientToLogicalPoint([
            e.clientX,
            e.clientY,
          ]),
        },
      });
    }
  };

  handleGlobalMouseMove = (e: MouseEvent) => {
    const { selected, panzoomObservable, canvasInfo } = this.props;
    const { controlMode } = this.state;
    if (!selected && controlMode !== null) {
      this.setState({
        controlMode: null,
      });
    }
    if (controlMode) {
      switch (controlMode.type) {
        case "prepareMoving":
          this.setState({
            controlMode: {
              type: "moving",
              initialLogicalPoint: controlMode.initialLogicalPoint,
              currentLogicalPoint: canvasInfo.clientToLogicalPoint([
                e.clientX,
                e.clientY,
              ]),
            },
          });
          break;
        case "moving":
          this.setState({
            controlMode: {
              ...controlMode,
              currentLogicalPoint: canvasInfo.clientToLogicalPoint([
                e.clientX,
                e.clientY,
              ]),
            },
          });
      }
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
      pos_x +=
        controlMode.currentLogicalPoint[0] - controlMode.initialLogicalPoint[0];
      pos_y +=
        controlMode.currentLogicalPoint[1] - controlMode.initialLogicalPoint[1];
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
  const focusedObjectId = useFocusedObjectId();
  const focus$ = useFocus$();
  const system = useSystemFacade();
  const panzoomObservable = usePanzoom$();
  const selected = focusedObjectId === props.material?.id;
  const canvasInfo = useCanvasInfo();
  return (
    <OvalInner
      selected={selected}
      panzoomObservable={panzoomObservable}
      canvasInfo={canvasInfo}
      {...props}
      onSelect={() => {
        if (props.material) {
          focus$.next({
            type: FocusType.canvasObject,
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

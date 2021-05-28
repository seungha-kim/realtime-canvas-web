import { h, Component, createRef } from "preact";
import { DocumentMaterial, SystemFacade } from "../SystemFacade";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import DrawingObject from "./drawing/DrawingObject";
import { useDocumentMaterial } from "../hooks";
import {
  Panzoom,
  PanzoomObservable,
  usePanzoomObservable,
} from "../contexts/PanzoomContext";

type Props = {};

type InnerProps = Props & {
  document: DocumentMaterial;
  system: SystemFacade;
  panzoomObservable: PanzoomObservable;
};

type InnerState = {};

enum PanningStateType {
  idle = "idle",
  ready = "ready",
  panning = "panning",
}

type PanningState =
  | {
      type: PanningStateType.idle;
    }
  | {
      type: PanningStateType.ready;
    }
  | {
      type: PanningStateType.panning;
      initialX: number;
      initialY: number;
    };

class CanvasInner extends Component<InnerProps, InnerState> {
  svgRef = createRef<SVGSVGElement>();
  panningState: PanningState = { type: PanningStateType.idle };

  componentDidMount() {
    document.addEventListener("keydown", this.handleGlobalKeyDown);
    document.addEventListener("keyup", this.handleGlobalKeyUp);
    this.props.panzoomObservable.addObserver(this.applyTransform);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleGlobalKeyDown);
    document.removeEventListener("keyup", this.handleGlobalKeyUp);
    this.props.panzoomObservable.removeObserver(this.applyTransform);
  }

  handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      if (e.repeat) {
        e.preventDefault();
        return;
      } else {
        this.preparePanning();
      }
    }
  };

  handleGlobalKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      this.finishPanning();
    }
  };

  handleMouseDown = (e: MouseEvent) => {
    this.startPanning(e.clientX, e.clientY);
  };

  handleGlobalMouseMove = (e: MouseEvent) => {
    this.props.panzoomObservable.pan(e.movementX, e.movementY);
  };

  handleGlobalMouseUp = (e: MouseEvent) => {
    this.pausePanning();
  };

  handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    const { panzoomObservable } = this.props;
    const { zoomLevel } = panzoomObservable.value;
    let newZoomLevel = zoomLevel + e.deltaY * -0.01;

    const rect = this.svgRef.current!.getBoundingClientRect();
    const domPivotX = e.clientX - rect.left;
    const domPivotY = e.clientY - rect.top;

    panzoomObservable.zoom(newZoomLevel, domPivotX, domPivotY);
  };

  preparePanning = () => {
    if (this.panningState.type !== PanningStateType.idle) {
      return;
    }
    this.panningState = { type: PanningStateType.ready };
    this.svgRef.current!.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("keyup", this.handleGlobalKeyUp);
  };

  startPanning = (initialX: number, initialY: number) => {
    if (this.panningState.type !== PanningStateType.ready) {
      return;
    }
    this.panningState = { type: PanningStateType.panning, initialX, initialY };
    document.addEventListener("mousemove", this.handleGlobalMouseMove);
    document.addEventListener("mouseup", this.handleGlobalMouseUp);
  };

  pausePanning = () => {
    if (this.panningState.type !== PanningStateType.panning) {
      return;
    }
    this.panningState = { type: PanningStateType.ready };
    document.removeEventListener("mousemove", this.handleGlobalMouseMove);
    document.removeEventListener("mouseup", this.handleGlobalMouseUp);
  };

  finishPanning = () => {
    if (
      this.panningState.type !== PanningStateType.panning &&
      this.panningState.type !== PanningStateType.ready
    ) {
      return;
    }
    if (this.panningState.type === PanningStateType.panning) {
      this.pausePanning();
    }
    this.panningState = { type: PanningStateType.idle };
    this.svgRef.current!.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("keyup", this.handleGlobalKeyUp);
  };

  applyTransform = (panzoom: Panzoom) => {
    const svg = this.svgRef.current!;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const vLeft = panzoom.panX;
    const vTop = panzoom.panY;
    const vRight = vLeft + width / panzoom.zoomLevel;
    const vBottom = vTop + height / panzoom.zoomLevel;
    svg.setAttribute(
      "viewBox",
      `${vLeft} ${vTop} ${vRight - vLeft} ${vBottom - vTop}`
    );
  };

  render() {
    return (
      <svg
        ref={this.svgRef}
        onMouseDown={this.handleMouseDown}
        onWheel={this.handleWheel}
        width={500}
        height={500}
        style={{
          border: "1px solid red",
        }}
      >
        {this.props.document.children.map((child) => {
          return <DrawingObject objectId={child} />;
        })}
      </svg>
    );
  }
}

function Canvas(props: Props) {
  const system = useSystemFacade();
  const document = useDocumentMaterial();
  const panzoomObservable = usePanzoomObservable();
  return (
    document && (
      <CanvasInner
        document={document}
        system={system}
        panzoomObservable={panzoomObservable}
        {...props}
      />
    )
  );
}

export default Canvas;

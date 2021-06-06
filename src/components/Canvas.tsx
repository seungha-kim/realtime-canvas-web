import { h, Component, createRef } from "preact";
import { DocumentMaterial, SystemFacade } from "../SystemFacade";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import DrawingObject from "./drawing/DrawingObject";
import { useDocumentMaterial } from "../contexts/MaterialBroadcastContext";
import {
  Panzoom,
  PanzoomObservable,
  usePanzoom$,
} from "../contexts/PanzoomContext";
import { CanvasInfo, CanvasInfoProvider } from "../contexts/CanvasInfoContext";
import { BehaviorSubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LivePointerListView } from "./LivePointerView";
import {
  LivePointerPushable,
  useLivePointerPushable,
} from "../contexts/LivePointerContext";

type Props = {};

type InnerProps = Props & {
  document: DocumentMaterial;
  system: SystemFacade;
  panzoom$: PanzoomObservable;
  livePointerPushable: LivePointerPushable;
};

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
      initialPanX: number;
      initialPanY: number;
      initialClientX: number;
      initialClientY: number;
    };

class CanvasInner extends Component<InnerProps, {}> {
  svgRef = createRef<SVGSVGElement>();
  outerGroupRef = createRef<SVGGElement>();

  panningState$ = new BehaviorSubject<PanningState>({
    type: PanningStateType.idle,
  });
  canvasInfo = new CanvasInfo(this.svgRef, this.props.panzoom$);
  teardown$ = new Subject<void>();

  componentDidMount() {
    document.addEventListener("keydown", this.handleGlobalKeyDown);
    document.addEventListener("keyup", this.handleGlobalKeyUp);
    this.panningState$
      .pipe(takeUntil(this.teardown$))
      .subscribe(this.handlePanningStateUpdate);
    this.props.panzoom$
      .pipe(takeUntil(this.teardown$))
      .subscribe(this.applyTransform);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleGlobalKeyDown);
    document.removeEventListener("keyup", this.handleGlobalKeyUp);
    this.teardown$.next();
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
    if (this.panningState$.value.type === PanningStateType.panning) {
      const {
        initialPanX,
        initialPanY,
        initialClientX,
        initialClientY,
      } = this.panningState$.value;
      const [
        initialLogicalX,
        initialLogicalY,
      ] = this.canvasInfo.clientToLogicalPoint([
        initialClientX,
        initialClientY,
      ]);
      const [
        currentLogicalX,
        currentLogicalY,
      ] = this.canvasInfo.clientToLogicalPoint([e.clientX, e.clientY]);

      this.props.panzoom$.pan(
        initialPanX - currentLogicalX + initialLogicalX,
        initialPanY - currentLogicalY + initialLogicalY
      );
    }
  };

  handleGlobalMouseUp = (e: MouseEvent) => {
    this.pausePanning();
  };

  handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    if (this.panningState$.value.type !== PanningStateType.idle) {
      return;
    }

    const { panzoom$ } = this.props;
    const { zoomLevel } = panzoom$.value;
    let newZoomLevel = zoomLevel + e.deltaY * -0.01;
    const [logicalX, logicalY] = this.canvasInfo.clientToLogicalPoint([
      e.clientX,
      e.clientY,
    ]);

    panzoom$.zoom(newZoomLevel, logicalX, logicalY);
  };

  handleClick = (e: MouseEvent) => {
    if (this.panningState$.value.type !== PanningStateType.idle) {
      // NOTE: to prevent from focusing out by global click handler
      e.stopPropagation();
    }
  };

  preparePanning = () => {
    if (this.panningState$.value.type !== PanningStateType.idle) {
      return;
    }
    this.panningState$.next({ type: PanningStateType.ready });
    this.svgRef.current!.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("keyup", this.handleGlobalKeyUp);
    this.outerGroupRef.current!.style.pointerEvents = "none";
  };

  startPanning = (initialClientX: number, initialClientY: number) => {
    if (this.panningState$.value.type !== PanningStateType.ready) {
      return;
    }
    this.panningState$.next({
      type: PanningStateType.panning,
      initialPanX: this.props.panzoom$.value.panX,
      initialPanY: this.props.panzoom$.value.panY,
      initialClientX,
      initialClientY,
    });
    document.addEventListener("mousemove", this.handleGlobalMouseMove);
    document.addEventListener("mouseup", this.handleGlobalMouseUp);
  };

  pausePanning = () => {
    if (this.panningState$.value.type !== PanningStateType.panning) {
      return;
    }
    this.panningState$.next({ type: PanningStateType.ready });
    document.removeEventListener("mousemove", this.handleGlobalMouseMove);
    document.removeEventListener("mouseup", this.handleGlobalMouseUp);
  };

  finishPanning = () => {
    if (
      this.panningState$.value.type !== PanningStateType.panning &&
      this.panningState$.value.type !== PanningStateType.ready
    ) {
      return;
    }
    if (this.panningState$.value.type === PanningStateType.panning) {
      this.pausePanning();
    }
    this.panningState$.next({ type: PanningStateType.idle });
    this.svgRef.current!.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("keyup", this.handleGlobalKeyUp);
    this.outerGroupRef.current!.style.pointerEvents = "auto";
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

  handlePanningStateUpdate = (newValue: PanningState) => {
    if (newValue.type !== PanningStateType.idle) {
      this.svgRef.current!.style.cursor = "grab";
    } else {
      this.svgRef.current!.style.cursor = "auto";
    }
  };

  handleMouseMove = (e: MouseEvent) => {
    const [logicalX, logicalY] = this.canvasInfo.clientToLogicalPoint([
      e.clientX,
      e.clientY,
    ]);
    this.props.livePointerPushable.pushEvent({
      x: logicalX,
      y: logicalY,
    });
  };

  render() {
    return (
      <CanvasInfoProvider canvasInfo={this.canvasInfo}>
        <div style={{ position: "relative" }}>
          <svg
            ref={this.svgRef}
            onMouseDown={this.handleMouseDown}
            onWheel={this.handleWheel}
            onClick={this.handleClick}
            onMouseMove={this.handleMouseMove}
            width={500}
            height={500}
            style={{
              border: "1px solid red",
            }}
          >
            <g ref={this.outerGroupRef}>
              {this.props.document.children.map((child) => {
                return <DrawingObject objectId={child} />;
              })}
            </g>
          </svg>
          <LivePointerListView />
        </div>
      </CanvasInfoProvider>
    );
  }
}

function Canvas(props: Props) {
  const system = useSystemFacade();
  const document = useDocumentMaterial();
  const panzoomObservable = usePanzoom$();
  const livePointerPushable = useLivePointerPushable();
  return (
    document && (
      <CanvasInner
        document={document}
        system={system}
        panzoom$={panzoomObservable}
        livePointerPushable={livePointerPushable}
        {...props}
      />
    )
  );
}

export default Canvas;

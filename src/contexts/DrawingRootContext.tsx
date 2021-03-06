import { h, Component, createContext, RefObject } from "preact";
import { useContext } from "preact/hooks";
import { PanzoomObservable } from "./PanzoomContext";

export class DrawingRoot {
  elementRef: RefObject<SVGSVGElement>;
  panzoomObservable: PanzoomObservable;

  constructor(
    svg: RefObject<SVGSVGElement>,
    panzoomObservable: PanzoomObservable
  ) {
    this.elementRef = svg;
    this.panzoomObservable = panzoomObservable;
  }

  startSoloPointerEvent() {
    const el = this.elementRef.current;
    if (el) {
      el.style.pointerEvents = "none";
    }
  }

  finishSoloPointerEvent() {
    const el = this.elementRef.current;
    if (el) {
      el.style.pointerEvents = "auto";
    }
  }

  clientToDomPoint(browserPoint: [number, number]): [number, number] {
    const rect = this.elementRef.current!.getBoundingClientRect();
    return [browserPoint[0] - rect.left, browserPoint[1] - rect.top];
  }

  clientToLogicalPoint(browserPoint: [number, number]): [number, number] {
    return this.panzoomObservable.domToLogicalPoint(
      this.clientToDomPoint(browserPoint)
    );
  }
}

const DrawingRootContext = createContext<DrawingRoot>(null as any);

type Props = {
  drawingRoot: DrawingRoot;
};

export class DrawingRootProvider extends Component<Props, {}> {
  render() {
    return (
      <DrawingRootContext.Provider value={this.props.drawingRoot}>
        {this.props.children}
      </DrawingRootContext.Provider>
    );
  }
}

export const useDrawingRoot = () => {
  return useContext(DrawingRootContext);
};

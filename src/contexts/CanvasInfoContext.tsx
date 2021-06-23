import { h, Component, createContext, RefObject } from "preact";
import { useContext } from "preact/hooks";
import { PanzoomObservable } from "./PanzoomContext";

export class CanvasInfo {
  elementRef: RefObject<Element>;
  panzoomObservable: PanzoomObservable;

  constructor(svg: RefObject<Element>, panzoomObservable: PanzoomObservable) {
    this.elementRef = svg;
    this.panzoomObservable = panzoomObservable;
  }

  startSoloPointerEvent() {
    // @ts-ignore
    this.elementRef.current!.style.pointerEvents = "none";
  }

  finishSoloPointerEvent() {
    // @ts-ignore
    this.elementRef.current!.style.pointerEvents = "auto";
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

const CanvasInfoContext = createContext<CanvasInfo>(null as any);

type Props = {
  canvasInfo: CanvasInfo;
};

export class CanvasInfoProvider extends Component<Props, {}> {
  render() {
    return (
      <CanvasInfoContext.Provider value={this.props.canvasInfo}>
        {this.props.children}
      </CanvasInfoContext.Provider>
    );
  }
}

export const useCanvasInfo = () => {
  return useContext(CanvasInfoContext);
};

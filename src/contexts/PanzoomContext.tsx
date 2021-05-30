import { h, Component, createContext } from "preact";
import { useContext } from "preact/hooks";
import { BehaviorSubject } from "rxjs";

export type Panzoom = {
  panX: number;
  panY: number;
  zoomLevel: number;
};

export class PanzoomObservable extends BehaviorSubject<Panzoom> {
  pan = (panX: number, panY: number) => {
    this.next({
      ...this.value,
      panX,
      panY,
    });
  };

  zoom = (
    newZoomLevel: number,
    logicalPivotX: number,
    logicalPivotY: number
  ) => {
    const { panX, panY, zoomLevel } = this.value;

    newZoomLevel = Math.min(Math.max(0.125, newZoomLevel), 4);

    const scale = newZoomLevel / zoomLevel;

    this.next({
      ...this.value,
      zoomLevel: newZoomLevel,
      panX: (panX + scale * logicalPivotX - logicalPivotX) / scale,
      panY: (panY + scale * logicalPivotY - logicalPivotY) / scale,
    });
  };

  domToLogicalPoint([x, y]: [number, number]): [number, number] {
    return [
      this.value.panX + x / this.value.zoomLevel,
      this.value.panY + y / this.value.zoomLevel,
    ];
  }

  logicalToDomPoint([x, y]: [number, number]): [number, number] {
    return [
      this.value.zoomLevel * (x - this.value.panX),
      this.value.zoomLevel * (y - this.value.panY),
    ];
  }

  domToLogicalLength(length: number): number {
    return length / this.value.zoomLevel;
  }
}

const PanzoomContext = createContext<PanzoomObservable>(null as any);

export class PanzoomProvider extends Component {
  observable = new PanzoomObservable({
    panX: 0,
    panY: 0,
    zoomLevel: 1,
  });

  render() {
    return (
      <PanzoomContext.Provider value={this.observable}>
        {this.props.children}
      </PanzoomContext.Provider>
    );
  }
}

export function usePanzoom$() {
  return useContext(PanzoomContext);
}

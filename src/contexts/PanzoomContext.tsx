import { h, Component, ComponentChildren, createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { Observable } from "../utils/Observable";

export type Panzoom = {
  panX: number;
  panY: number;
  zoomLevel: number;
};

export class PanzoomObservable extends Observable<Panzoom> {
  pan = (panX: number, panY: number) => {
    this.updateValue({
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

    this.updateValue({
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

export function usePanzoomObservable() {
  return useContext(PanzoomContext);
}

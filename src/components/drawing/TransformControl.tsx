import { Disposable } from "../../utils/Disposable";
import { getPos, SystemFacade } from "../../SystemFacade";
import {
  Focus,
  FocusObservable,
  FocusType,
  useFocus$,
} from "../../contexts/FocusContext";
import { CanvasInfo, useCanvasInfo } from "../../contexts/CanvasInfoContext";
import { ValueSubject } from "../../utils/ValueSubject";
import { Observable } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators";
import { useSystemFacade } from "../../contexts/SystemFacadeContext";
import { useEffect, useState } from "preact/hooks";

export type ControlMode =
  | null
  | { type: "prepareMoving"; initialLogicalPoint: [number, number] }
  | {
      type: "moving";
      initialLogicalPoint: [number, number];
      currentLogicalPoint: [number, number];
    }
  | { type: "rotating" }
  | { type: "resizing" };

export class TransformControl implements Disposable {
  private readonly id: string;
  private readonly system: SystemFacade;
  private readonly focus$: FocusObservable;
  private readonly canvasInfo: CanvasInfo;

  readonly controlMode$ = new ValueSubject<ControlMode>(null);
  readonly isSelected$: Observable<boolean>;

  constructor(
    id: string,
    system: SystemFacade,
    focus$: FocusObservable,
    canvasInfo: CanvasInfo
  ) {
    this.id = id;
    this.system = system;
    this.focus$ = focus$;
    this.canvasInfo = canvasInfo;
    this.isSelected$ = this.focus$.pipe(
      map(this.isSelectedMapper),
      distinctUntilChanged()
    );
  }

  dispose(): void {
    this.cleanupGlobalEventListeners();
    this.canvasInfo.finishSoloPointerEvent();
  }

  private attachGlobalEventListeners() {
    document.addEventListener("mousemove", this.handleGlobalMouseMove);
    document.addEventListener("mouseup", this.handleGlobalMouseUp);
  }

  private cleanupGlobalEventListeners() {
    document.removeEventListener("mousemove", this.handleGlobalMouseMove);
    document.removeEventListener("mouseup", this.handleGlobalMouseUp);
  }

  private handleGlobalMouseMove = (e: MouseEvent) => {
    this.move(e.clientX, e.clientY);
  };

  private handleGlobalMouseUp = () => {
    this.commitMove();
  };

  select() {
    if (!this.isSelected) {
      this.focus$.next({
        type: FocusType.canvasObject,
        id: this.id,
      });
    }
  }

  private isSelectedMapper = (focus: Focus) => focus?.id === this.id;

  get isSelected() {
    return this.isSelectedMapper(this.focus$.value);
  }

  commitMove() {
    const controlMode = this.controlMode$.value;
    if (controlMode?.type === "moving") {
      const [offsetX, offsetY] = this.controlledOffset;
      const [posX, posY] = getPos(this.system.materializeObject(this.id));
      this.system.pushDocumentCommand({
        UpdatePosition: {
          id: this.id,
          pos: [posX + offsetX, posY + offsetY],
        },
      });
    }
    this.letIdle();
    this.canvasInfo.finishSoloPointerEvent();
  }

  prepareToMove(clientX: number, clientY: number) {
    this.select();
    if (this.controlMode$.value === null) {
      this.controlMode$.next({
        type: "prepareMoving",
        initialLogicalPoint: this.canvasInfo.clientToLogicalPoint([
          clientX,
          clientY,
        ]),
      });
      this.attachGlobalEventListeners();
      this.canvasInfo.startSoloPointerEvent();
    }
  }

  move(clientX: number, clientY: number) {
    const controlMode = this.controlMode$.value;
    if (
      controlMode?.type === "prepareMoving" ||
      controlMode?.type === "moving"
    ) {
      this.controlMode$.next({
        type: "moving",
        initialLogicalPoint: controlMode.initialLogicalPoint,
        currentLogicalPoint: this.canvasInfo.clientToLogicalPoint([
          clientX,
          clientY,
        ]),
      });
    }
  }

  letIdle() {
    this.cleanupGlobalEventListeners();
    this.controlMode$.next(null);
  }

  get controlledOffset() {
    const controlMode = this.controlMode$.value;
    let offsetX = 0;
    let offsetY = 0;
    if (controlMode?.type == "moving") {
      offsetX +=
        controlMode.currentLogicalPoint[0] - controlMode.initialLogicalPoint[0];
      offsetY +=
        controlMode.currentLogicalPoint[1] - controlMode.initialLogicalPoint[1];
    }
    return [offsetX, offsetY];
  }
}

export function useTransformControl(id: string) {
  const focus$ = useFocus$();
  const system = useSystemFacade();
  const canvasInfo = useCanvasInfo();
  const [control] = useState(
    () => new TransformControl(id, system, focus$, canvasInfo)
  );

  useEffect(() => {
    return () => {
      control.dispose();
    };
  }, []);

  return control;
}

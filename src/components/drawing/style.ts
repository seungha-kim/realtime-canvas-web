import { TransformControl } from "./TransformControl";

export function commonDrawingStyle(control: TransformControl) {
  return {
    pointerEvents: control.isSelected ? "auto" : null,
  };
}

import { Component, ComponentChildren, createContext } from "preact";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";

class Observable<T> {
  value: T;
  observers: Set<(newValue: T, prevValue: T) => void> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  addObserver = (observer: (newValue: T, prevValue: T) => void) => {
    this.observers.add(observer);
  };

  removeObserver = (observer: (newValue: T, prevValue: T) => void) => {
    this.observers.delete(observer);
  };

  updateValue = (newValue: T) => {
    const prevValue = this.value;
    this.value = newValue;
    for (const observer of this.observers) {
      observer(newValue, prevValue);
    }
  };
}

type EditModeObservable = Observable<EditMode>;

export type EditMode =
  | null
  | {
      type: "layerAttr";
      id: string;
    }
  | {
      type: "canvasObject";
      id: string;
    };

const EditModeContext = createContext<Observable<EditMode>>(null as any);

type Props = {
  children: ComponentChildren;
};

type State = {};

export class EditModeProvider extends Component<Props, State> {
  observable = new Observable<EditMode>(null);

  render() {
    return (
      <EditModeContext.Provider value={this.observable}>
        {this.props.children}
      </EditModeContext.Provider>
    );
  }
}

export function useEditMode(): EditModeObservable {
  return useContext(EditModeContext);
}

export function useEditModeSelector<
  S extends (editMode: EditMode) => any,
  R extends ReturnType<S>
>(selector: S): [R, EditModeObservable["updateValue"]] {
  const editModeObservable = useContext(EditModeContext);
  const [memo, setMemo] = useState<R>(selector(editModeObservable.value));

  // NOTE: selector must be same across rendering
  useEffect(() => {
    const observer = (newValue: EditMode) => {
      const newMemo = selector(newValue);
      if (memo !== newMemo) {
        setMemo(newMemo);
      }
    };
    editModeObservable.addObserver(observer);
    return () => {
      editModeObservable.removeObserver(observer);
    };
  }, [memo]);

  return [memo, editModeObservable.updateValue];
}

export function selectEditingObjectId(editMode: EditMode): string | null {
  if (editMode?.type == "layerAttr") {
    return editMode.id;
  } else {
    return null;
  }
}

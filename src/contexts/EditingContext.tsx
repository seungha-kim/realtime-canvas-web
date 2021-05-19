import { h, Component, ComponentChildren, createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { Observable } from "../utils/Observable";

type GlobalEditModeObservable = Observable<GlobalEditMode>;

export enum GlobalEditModeType {
  layerPanelItem,
  canvasObject,
}

export type GlobalEditMode =
  | null
  | {
      type: GlobalEditModeType.layerPanelItem;
      id: string;
    }
  | {
      type: GlobalEditModeType.canvasObject;
      id: string;
    };

// export type CanvasTransform = {};
//
// export type EditingState = {
//   globalEditMode: GlobalEditMode;
//   canvasTransform: CanvasTransform;
// };

const EditingContext = createContext<Observable<GlobalEditMode>>(null as any);

type Props = {
  children: ComponentChildren;
};

type State = {};

export class EditingProvider extends Component<Props, State> {
  observable = new Observable<GlobalEditMode>(null);

  componentDidMount() {
    document.addEventListener("keydown", this.handleGlobalKeyDown);
    document.addEventListener("click", this.handleGlobalClick);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleGlobalKeyDown);
    document.removeEventListener("click", this.handleGlobalClick);
  }

  handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Escape") {
      this.observable.updateValue(null);
    }
  };

  handleGlobalClick = () => {
    this.observable.updateValue(null);
  };

  render() {
    return (
      <EditingContext.Provider value={this.observable}>
        {this.props.children}
      </EditingContext.Provider>
    );
  }
}

export function useEditingSelector<
  S extends (editMode: GlobalEditMode) => any,
  R extends ReturnType<S>
>(selector: S): [R, GlobalEditModeObservable["updateValue"]] {
  const editModeObservable = useContext(EditingContext);
  const [memo, setMemo] = useState<R>(selector(editModeObservable.value));

  // NOTE: selector must be same across rendering
  useEffect(() => {
    const observer = (newValue: GlobalEditMode) => {
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

export function selectEditingObjectId(editMode: GlobalEditMode): string | null {
  if (
    editMode?.type == GlobalEditModeType.layerPanelItem ||
    editMode?.type == GlobalEditModeType.canvasObject
  ) {
    return editMode.id;
  } else {
    return null;
  }
}

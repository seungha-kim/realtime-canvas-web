import { h, Component, ComponentChildren, createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { Observable } from "../utils/Observable";

type FocusObservable = Observable<Focus>;

export enum FocusType {
  layerPanelItem,
  canvasObject,
}

export type Focus =
  | null
  | {
      type: FocusType.layerPanelItem;
      id: string;
    }
  | {
      type: FocusType.canvasObject;
      id: string;
    };

const FocusContext = createContext<Observable<Focus>>(null as any);

type Props = {
  children: ComponentChildren;
};

type State = {};

export class FocusProvider extends Component<Props, State> {
  observable = new Observable<Focus>(null);

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
      <FocusContext.Provider value={this.observable}>
        {this.props.children}
      </FocusContext.Provider>
    );
  }
}

export function useFocusSelector<
  S extends (focus: Focus) => any,
  R extends ReturnType<S>
>(selector: S): [R, FocusObservable["updateValue"]] {
  const focusObservable = useContext(FocusContext);
  const [memo, setMemo] = useState<R>(selector(focusObservable.value));

  // NOTE: selector must be same across rendering
  useEffect(() => {
    const observer = (newValue: Focus) => {
      const newMemo = selector(newValue);
      if (memo !== newMemo) {
        setMemo(newMemo);
      }
    };
    focusObservable.addObserver(observer);
    return () => {
      focusObservable.removeObserver(observer);
    };
  }, [memo]);

  return [memo, focusObservable.updateValue];
}

export function selectFocusedObjectId(focus: Focus): string | null {
  if (
    focus?.type == FocusType.layerPanelItem ||
    focus?.type == FocusType.canvasObject
  ) {
    return focus.id;
  } else {
    return null;
  }
}

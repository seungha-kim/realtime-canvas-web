import { h, Component, ComponentChildren, createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { BehaviorSubject } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators";

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

class FocusObservable extends BehaviorSubject<Focus> {
  focusedObjectId$ = this.pipe(
    map((focus) => {
      if (focus) {
        return focus.id;
      } else {
        return null;
      }
    }),
    distinctUntilChanged()
  );

  focusOut() {
    this.next(null);
  }
}

const FocusContext = createContext<FocusObservable>(null as any);

type Props = {
  children: ComponentChildren;
};

type State = {};

export class FocusProvider extends Component<Props, State> {
  focus$ = new FocusObservable(null);

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
      this.focus$.next(null);
    }
  };

  handleGlobalClick = () => {
    this.focus$.next(null);
  };

  render() {
    return (
      <FocusContext.Provider value={this.focus$}>
        {this.props.children}
      </FocusContext.Provider>
    );
  }
}

export function useFocus$() {
  return useContext(FocusContext);
}

export function useFocusedObjectId() {
  const focus$ = useFocus$();
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);
  useEffect(() => {
    const sub = focus$.focusedObjectId$.subscribe((id) => {
      setEditingObjectId(id);
    });
    return () => sub.unsubscribe();
  }, []);
  return editingObjectId;
}

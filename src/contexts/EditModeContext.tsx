import { Component, ComponentChildren, createContext } from "preact";
import { useContext } from "preact/hooks";

export type EditMode =
  | {
      type: "layerAttr";
      id: string;
    }
  | {
      type: "canvasObject";
      id: string;
    }
  | null;

const EditModeContext = createContext<State>(null as any);

type Props = {
  children: ComponentChildren;
};

type State = {
  editMode: EditMode;
  updateEditMode: (mode: EditMode) => void;
};

export class EditModeProvider extends Component<Props, State> {
  state: State = {
    editMode: null,
    updateEditMode: (editMode: EditMode) => {
      this.setState({
        editMode,
      });
    },
  };

  render() {
    return (
      <EditModeContext.Provider value={this.state}>
        {this.props.children}
      </EditModeContext.Provider>
    );
  }
}

export function useEditMode() {
  return useContext(EditModeContext);
}

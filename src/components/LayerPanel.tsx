import { Component } from "preact";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import { DocumentMaterial, SystemFacade } from "../SystemFacade";
import { useDocumentMaterial } from "../hooks";
import LayerPanelItem from "./LayerPanelItem";
import { EditMode, useEditMode } from "../contexts/EditModeContext";

type Props = {};

type InnerProps = Props & {
  system: SystemFacade;
  document: DocumentMaterial | null;
  editMode: EditMode;
  enterLayerEditMode: (id: string) => void;
};

type InnerState = {};

class LayerPanelInner extends Component<InnerProps, InnerState> {
  private handleItemClick = (id: string) => {
    this.props.enterLayerEditMode(id);
  };

  private handleItemDblClick = (id: string) => {
    const name = prompt("new name");
    if (name) {
      this.props.system.pushDocumentCommand({
        UpdateName: {
          id,
          name,
        },
      });
    }
  };

  render() {
    return (
      <div style={{ backgroundColor: "silver", flex: "0 0 200px" }}>
        {this.props.document?.children.map((id) => {
          const { editMode } = this.props;
          const selected = editMode?.type == "layerAttr" && editMode.id === id;
          return (
            <LayerPanelItem
              key={id}
              onClick={() => {
                this.handleItemClick(id);
              }}
              onDblClick={() => {
                this.handleItemDblClick(id);
              }}
              id={id}
              selected={selected}
            />
          );
        })}
      </div>
    );
  }
}

function LayerPanel(props: Props) {
  const system = useSystemFacade();
  const document = useDocumentMaterial();
  const { editMode, updateEditMode } = useEditMode();
  return (
    <LayerPanelInner
      document={document}
      system={system}
      editMode={editMode}
      enterLayerEditMode={(id) => {
        updateEditMode({
          type: "layerAttr",
          id,
        });
      }}
      {...props}
    />
  );
}

export default LayerPanel;

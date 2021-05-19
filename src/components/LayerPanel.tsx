import { Component, h } from "preact";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import { DocumentMaterial, SystemFacade } from "../SystemFacade";
import { useDocumentMaterial } from "../hooks";
import LayerPanelItem from "./LayerPanelItem";
import {
  EditModeType,
  selectEditingObjectId,
  useEditModeSelector,
} from "../contexts/EditModeContext";

type Props = {};

type InnerProps = Props & {
  system: SystemFacade;
  document: DocumentMaterial | null;
  editingObjectId: string | null;
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
          const { editingObjectId } = this.props;
          const selected = editingObjectId === id;
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
  const [editingObjectId, updateEditMode] = useEditModeSelector(
    selectEditingObjectId
  );
  return (
    <LayerPanelInner
      document={document}
      system={system}
      editingObjectId={editingObjectId}
      enterLayerEditMode={(id) => {
        updateEditMode({
          type: EditModeType.layerPanelItem,
          id,
        });
      }}
      {...props}
    />
  );
}

export default LayerPanel;

import { Component, h } from "preact";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import { DocumentMaterial, SystemFacade } from "../SystemFacade";
import { useDocumentMaterial } from "../hooks";
import LayerPanelItem from "./LayerPanelItem";
import {
  FocusType,
  selectFocusedObjectId,
  useFocusSelector,
} from "../contexts/FocusContext";

type Props = {};

type InnerProps = Props & {
  system: SystemFacade;
  document: DocumentMaterial | null;
  focusedObjectId: string | null;
  onLayerSelected: (id: string) => void;
};

type InnerState = {};

class LayerPanelInner extends Component<InnerProps, InnerState> {
  private handleItemClick = (id: string) => {
    this.props.onLayerSelected(id);
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
          const { focusedObjectId } = this.props;
          const selected = focusedObjectId === id;
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
  const [focused, updateFocus] = useFocusSelector(selectFocusedObjectId);
  return (
    <LayerPanelInner
      document={document}
      system={system}
      focusedObjectId={focused}
      onLayerSelected={(id) => {
        updateFocus({
          type: FocusType.layerPanelItem,
          id,
        });
      }}
      {...props}
    />
  );
}

export default LayerPanel;

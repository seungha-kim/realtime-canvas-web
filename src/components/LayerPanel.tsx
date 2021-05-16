import { Component } from "preact";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import { DocumentMaterial, SystemFacade } from "../SystemFacade";
import { useDocumentMaterial } from "../hooks";
import LayerPanelItem from "./LayerPanelItem";

type Props = {};

type InnerProps = Props & {
  system: SystemFacade;
  document: DocumentMaterial | null;
};

type InnerState = {};

class LayerPanelInner extends Component<InnerProps, InnerState> {
  private handleItemClick = (id: string) => {};

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
      <div style={{ flex: "0 0 200px" }}>
        {this.props.document?.children.map((id) => {
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
  return <LayerPanelInner document={document} system={system} {...props} />;
}

export default LayerPanel;

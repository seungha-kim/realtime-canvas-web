import { h, Component } from "preact";
import { DocumentMaterial, SystemFacade } from "../SystemFacade";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import { useDocumentMaterial } from "../contexts/MaterialBroadcastContext";

type Props = {};

type InnerProps = Props & {
  document: DocumentMaterial;
  system: SystemFacade;
};

type InnerState = {};

class DocumentHeaderInner extends Component<InnerProps, InnerState> {
  private handleTitleClick = () => {
    const name = prompt("New title?");
    if (name) {
      this.props.system.pushDocumentCommand({
        UpdateDocumentName: { name },
      });
    }
  };

  render() {
    const { document } = this.props;
    return (
      <h1
        onClick={(e) => {
          e.stopPropagation();
          this.handleTitleClick();
        }}
      >
        {document.name}
      </h1>
    );
  }
}

function DocumentHeader(props: Props) {
  const system = useSystemFacade();
  const document = useDocumentMaterial();

  return <DocumentHeaderInner document={document} system={system} {...props} />;
}

export default DocumentHeader;

import { DocumentMaterial, SystemFacade } from "../SystemFacade";
import { Component } from "preact";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import { useDocumentMaterial } from "../hooks";

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
    return <h1 onClick={this.handleTitleClick}>{document.name}</h1>;
  }
}

function DocumentHeader(props: Props) {
  const system = useSystemFacade();
  const documentMaterial = useDocumentMaterial(system);

  return (
    documentMaterial && (
      <DocumentHeaderInner
        document={documentMaterial}
        system={system}
        {...props}
      />
    )
  );
}

export default DocumentHeader;

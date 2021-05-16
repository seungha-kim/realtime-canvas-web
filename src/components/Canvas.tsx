import { Component, ComponentChildren } from "preact";
import { DocumentMaterial, SystemFacade } from "../SystemFacade";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import DrawingObject from "./drawing/DrawingObject";
import { useDocumentMaterial } from "../hooks";

type Props = {};

type InnerProps = Props & {
  document: DocumentMaterial;
  system: SystemFacade;
};

type InnerState = {};

class CanvasInner extends Component<InnerProps, InnerState> {
  render() {
    return (
      <div
        style={{
          width: 500,
          height: 500,
          border: "1px solid red",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {this.props.document.children.map((child) => {
          return (
            <DrawingObject
              material={this.props.system.materializeObject(child)}
            />
          );
        })}
      </div>
    );
  }
}

function Canvas(props: Props) {
  const system = useSystemFacade();
  const document = useDocumentMaterial();
  return (
    document && <CanvasInner document={document} system={system} {...props} />
  );
}

export default Canvas;

import { h, Component } from "preact";
import { ObjectMaterial } from "../../SystemFacade";
import { useSystemFacade } from "../../contexts/SystemFacadeContext";
import { useFocus$ } from "../../contexts/FocusContext";

type Props = {
  document: NonNullable<ObjectMaterial["Document"]>;
};

type InnerProps = Props;

class DocumentAttrInner extends Component<InnerProps, {}> {
  render() {
    const { document } = this.props;
    return (
      <div>
        <dl>
          <dt>Type</dt>
          <dd>Document</dd>

          <dt>Name</dt>
          <dd>{document.name}</dd>

          <dt>ID</dt>
          <dd>
            <input
              value={document.id}
              onClick={(e) => e.stopPropagation()}
              style={{ userSelect: "auto", pointerEvents: "auto" }}
            />
          </dd>
        </dl>
      </div>
    );
  }
}

function DocumentAttr(props: Props) {
  return <DocumentAttrInner document={props.document} />;
}

export default DocumentAttr;

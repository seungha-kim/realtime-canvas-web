import { h, Component } from "preact";
import { ObjectMaterial } from "../../SystemFacade";
import { useSystemFacade } from "../../contexts/SystemFacadeContext";
import { useFocus$ } from "../../contexts/FocusContext";

type Props = {
  oval: NonNullable<ObjectMaterial["Oval"]>;
};

type InnerProps = Props & {
  onObjectDeletion: () => void;
};

class OvalAttrInner extends Component<InnerProps, {}> {
  handleDeleteButtonClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onObjectDeletion();
  };

  render() {
    const { oval } = this.props;
    return (
      <div>
        <dl>
          <dt>Type</dt>
          <dd>Oval</dd>

          <dt>Name</dt>
          <dd>{oval.name}</dd>

          <dt>X</dt>
          <dd>{oval.pos_x}</dd>

          <dt>Y</dt>
          <dd>{oval.pos_y}</dd>

          <dt>H radius</dt>
          <dd>{oval.r_h}</dd>

          <dt>V radius</dt>
          <dd>{oval.r_v}</dd>
        </dl>
        <button onClick={this.handleDeleteButtonClick}>delete</button>
      </div>
    );
  }
}

function OvalAttr(props: Props) {
  const system = useSystemFacade();
  const focus$ = useFocus$();
  return (
    <OvalAttrInner
      oval={props.oval}
      onObjectDeletion={() => {
        system.pushDocumentCommand({ DeleteObject: { id: props.oval.id } });
        focus$.focusOut();
      }}
    />
  );
}

export default OvalAttr;

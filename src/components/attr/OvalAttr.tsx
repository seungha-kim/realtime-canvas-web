import { h, Component } from "preact";
import { ObjectMaterial } from "../../SystemFacade";
import { useSystemFacade } from "../../contexts/SystemFacadeContext";
import { useFocus$ } from "../../contexts/FocusContext";

type Props = {
  oval: NonNullable<ObjectMaterial["Oval"]>;
  index: number;
};

type InnerProps = {
  oval: NonNullable<ObjectMaterial["Oval"]>;
  onObjectDeletion: () => void;
  onGoingFront: () => void;
  onChangingParent: (parentId: string) => void;
};

class OvalAttrInner extends Component<InnerProps, {}> {
  handleDeleteButtonClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onObjectDeletion();
  };

  handleFrontButtonClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onGoingFront();
  };

  handleChangeParentButtonClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const parentId = prompt("new parent id");
    parentId && this.props.onChangingParent(parentId);
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

          <dt>Fill color</dt>
          <dd>{`rgb(${oval.fill_color.r}, ${oval.fill_color.g}, ${oval.fill_color.b})`}</dd>
        </dl>
        <button onClick={this.handleDeleteButtonClick}>delete</button>
        <button onClick={this.handleFrontButtonClick}>go front</button>
        <button onClick={this.handleChangeParentButtonClick}>
          change parent
        </button>
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
      onGoingFront={() => {
        // TODO: 버튼 비활성화 or 예외 처리
        system.pushDocumentCommand({
          UpdateIndex: { id: props.oval.id, int_index: props.index + 2 },
        });
      }}
      onChangingParent={(parentId) => {
        system.pushDocumentCommand({
          UpdateParent: {
            id: props.oval.id,
            parent_id: parentId,
          },
        });
      }}
    />
  );
}

export default OvalAttr;

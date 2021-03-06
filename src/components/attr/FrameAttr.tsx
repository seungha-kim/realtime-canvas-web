import { h, Component } from "preact";
import { ObjectMaterial } from "../../SystemFacade";
import { useSystemFacade } from "../../contexts/SystemFacadeContext";
import { useFocus$ } from "../../contexts/FocusContext";

type Props = {
  material: NonNullable<ObjectMaterial["Frame"]>;
  index: number;
};

type InnerProps = {
  material: NonNullable<ObjectMaterial["Frame"]>;
  onObjectDeletion: () => void;
  onGoingFront: () => void;
  onChangingParent: (parentId: string) => void;
};

class FrameAttrInner extends Component<InnerProps, {}> {
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
    const { material } = this.props;
    return (
      <div>
        <dl>
          <dt>Type</dt>
          <dd>Frame</dd>

          <dt>ID</dt>
          <dd>
            <input
              value={material.id}
              onClick={(e) => e.stopPropagation()}
              style={{ userSelect: "auto", pointerEvents: "auto" }}
            />
          </dd>

          <dt>Name</dt>
          <dd>{material.name}</dd>

          <dt>X</dt>
          <dd>{material.pos_x}</dd>

          <dt>Y</dt>
          <dd>{material.pos_y}</dd>

          <dt>Width</dt>
          <dd>{material.w}</dd>

          <dt>Height</dt>
          <dd>{material.h}</dd>
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

function FrameAttr(props: Props) {
  const system = useSystemFacade();
  const focus$ = useFocus$();
  return (
    <FrameAttrInner
      material={props.material}
      onObjectDeletion={() => {
        system.pushDocumentCommand({ DeleteObject: { id: props.material.id } });
        focus$.focusOut();
      }}
      onGoingFront={() => {
        // TODO: ?????? ???????????? or ?????? ??????
        system.pushDocumentCommand({
          UpdateIndex: { id: props.material.id, int_index: props.index + 2 },
        });
      }}
      onChangingParent={(parentId) => {
        system.pushDocumentCommand({
          UpdateParent: {
            id: props.material.id,
            parent_id: parentId,
          },
        });
      }}
    />
  );
}

export default FrameAttr;

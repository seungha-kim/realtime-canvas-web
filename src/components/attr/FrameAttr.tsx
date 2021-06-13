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
        // TODO: 버튼 비활성화 or 예외 처리
        system.pushDocumentCommand({
          UpdateIndex: { id: props.material.id, int_index: props.index + 2 },
        });
      }}
    />
  );
}

export default FrameAttr;

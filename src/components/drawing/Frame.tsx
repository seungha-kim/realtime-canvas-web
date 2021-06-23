import { h, Component, Fragment } from "preact";
import { ObjectMaterial, SystemFacade } from "../../SystemFacade";
import { TransformControl, useTransformControl } from "./TransformControl";
import { ComponentSubscription } from "../../utils/ComponentSubscription";
import { useSystemFacade } from "../../contexts/SystemFacadeContext";
import DrawingObject from "./DrawingObject";
import { commonDrawingStyle } from "./style";

type Props = {
  material: NonNullable<ObjectMaterial["Frame"]>;
};

type InnerProps = Props & {
  control: TransformControl;
  system: SystemFacade;
};

class FrameInner extends Component<InnerProps, {}> {
  private readonly sub = new ComponentSubscription(this);

  componentDidMount() {
    this.sub.addSubscription(this.props.control.controlMode$);
    this.sub.addSubscription(this.props.control.isSelected$);
  }

  componentWillUnmount() {
    this.sub.dispose();
  }

  handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    this.props.control.select();
  };

  handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    this.props.control.prepareToMove(e.clientX, e.clientY);
  };

  get controlledPosition(): [number, number] {
    const [offsetX, offsetY] = this.props.control.controlledOffset;
    let { pos_x, pos_y } = this.props.material;
    return [pos_x + offsetX, pos_y + offsetY];
  }

  render() {
    const m = this.props.material;
    let [pos_x, pos_y] = this.controlledPosition;

    return (
      <>
        <rect
          x={pos_x}
          y={pos_y}
          width={m.w}
          height={m.h}
          fill={this.props.control.isSelected ? "red" : "black"}
          onClick={this.handleClick}
          onMouseDown={this.handleMouseDown}
          style={{ ...commonDrawingStyle(this.props.control) }}
        />
        <g transform={`translate(${pos_x} ${pos_y})`}>
          {m.children.map((id) => (
            <DrawingObject objectId={id} />
          ))}
        </g>
        {this.props.control.isSelected && (
          <rect
            x={pos_x}
            y={pos_y}
            width={m.w}
            height={m.h}
            stroke={"red"}
            fill={"none"}
          />
        )}
      </>
    );
  }
}

function Frame(props: Props) {
  const control = useTransformControl(props.material.id);
  const system = useSystemFacade();
  return <FrameInner control={control} system={system} {...props} />;
}

export default Frame;

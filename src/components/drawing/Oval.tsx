import { Component, h, Fragment } from "preact";
import { ObjectMaterial } from "../../SystemFacade";
import { ComponentSubscription } from "../../utils/ComponentSubscription";
import { TransformControl, useTransformControl } from "./TransformControl";
import { commonDrawingStyle } from "./style";

type Props = {
  material: NonNullable<ObjectMaterial["Oval"]>;
};

type InnerProps = Props & {
  control: TransformControl;
};

class OvalInner extends Component<
  InnerProps,
  { name: string; number: number }
> {
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
    let {
      r_h,
      r_v,
      fill_color: { r, g, b },
    } = this.props.material;
    let [pos_x, pos_y] = this.controlledPosition;

    return (
      <>
        <ellipse
          onClick={this.handleClick}
          onMouseDown={this.handleMouseDown}
          cx={pos_x}
          cy={pos_y}
          rx={r_h}
          ry={r_v}
          fill={`rgb(${r}, ${g}, ${b})`}
          style={{ ...commonDrawingStyle(this.props.control) }}
        />
        {this.props.control.isSelected && (
          <rect
            x={pos_x - r_h}
            y={pos_y - r_v}
            width={r_h * 2}
            height={r_v * 2}
            stroke={"red"}
            fill={"none"}
          />
        )}
      </>
    );
  }
}

function Oval(props: Props) {
  const material = props.material;
  const control = useTransformControl(material.id);
  return <OvalInner control={control} {...props} />;
}

export default Oval;

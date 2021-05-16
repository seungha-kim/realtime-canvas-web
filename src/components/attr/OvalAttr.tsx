import { ObjectMaterial } from "../../SystemFacade";
import { Component } from "preact";

type Props = {
  oval: NonNullable<ObjectMaterial["Oval"]>;
};

type InnerProps = Props & {};

class OvalAttrInner extends Component<InnerProps, {}> {
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
      </div>
    );
  }
}

function OvalAttr(props: Props) {
  return <OvalAttrInner oval={props.oval} />;
}

export default OvalAttr;

import { h, Component } from "preact";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import { SystemFacade } from "../SystemFacade";

type Props = {};

type InnerProps = Props & {
  system: SystemFacade;
};

type InnerState = {};

class DrawingToolbarInner extends Component<InnerProps, InnerState> {
  private handleOvalButtonClick = () => {
    this.props.system.pushDocumentCommand({
      CreateOval: {
        pos: [500 * Math.random(), 500 * Math.random()],
        r_h: 30 * Math.random(),
        r_v: 30 * Math.random(),
        fill_color: {
          r: Math.floor(256 * Math.random()),
          g: Math.floor(256 * Math.random()),
          b: Math.floor(256 * Math.random()),
        },
      },
    });
  };

  private handleFrameButtonClick = () => {
    this.props.system.pushDocumentCommand({
      CreateFrame: {
        pos: [500 * Math.random(), 500 * Math.random()],
        w: 100 * Math.random(),
        h: 100 * Math.random(),
      },
    });
  };

  render() {
    return (
      <div>
        <button onClick={this.handleOvalButtonClick}>Create Oval</button>
        <button onClick={this.handleFrameButtonClick}>Create Frame</button>
      </div>
    );
  }
}

function DrawingToolbar(props: Props) {
  const system = useSystemFacade();
  return <DrawingToolbarInner system={system} {...props} />;
}

export default DrawingToolbar;

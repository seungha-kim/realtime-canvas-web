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
        r_h: 20 + 20 * Math.random(),
        r_v: 20 + 20 * Math.random(),
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
        w: 50 + 50 * Math.random(),
        h: 50 + 50 * Math.random(),
      },
    });
  };

  private handleUndoClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.system.undo();
  };

  private handleRedoClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.system.redo();
  };

  render() {
    return (
      <div>
        <button onClick={this.handleOvalButtonClick}>Create Oval</button>
        <button onClick={this.handleFrameButtonClick}>Create Frame</button>
        <button onClick={this.handleUndoClick}>Undo</button>
        <button onClick={this.handleRedoClick}>Redo</button>
      </div>
    );
  }
}

function DrawingToolbar(props: Props) {
  const system = useSystemFacade();
  return <DrawingToolbarInner system={system} {...props} />;
}

export default DrawingToolbar;

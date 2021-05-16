import { Component } from "preact";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import { SessionSnapshot, SystemFacade } from "../SystemFacade";

type Props = {
  onLeave: () => void;
};

type InnerProps = Props & {
  system: SystemFacade;
};

type InnerState = {
  sessionSnapshot: SessionSnapshot;
};

class SessionControlInner extends Component<InnerProps, InnerState> {
  componentDidMount() {
    const { system } = this.props;
    const sessionSnapshot = system.materializeSession();
    this.setState({ sessionSnapshot });
    system.addSessionSnapshotChangeListener(this.handleSessionSnapshotUpdate);
  }

  componentWillUnmount() {
    this.props.system.removeSessionSnapshotChangeListener(
      this.handleSessionSnapshotUpdate
    );
  }

  private handleLeave = async () => {
    await this.props.system.leaveSession();
    this.props.onLeave();
  };

  private handleSessionSnapshotUpdate = (sessionSnapshot: SessionSnapshot) => {
    this.setState({
      sessionSnapshot,
    });
  };

  render() {
    return (
      <div>
        <div>
          <button onClick={this.handleLeave}>Leave</button>
          {this.state.sessionSnapshot?.connections.map((connectionId) => {
            return (
              <div
                key={connectionId}
                style={{ border: "1px solid red", display: "inline-block" }}
              >
                {connectionId}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

function SessionControl(props: Props) {
  const system = useSystemFacade();
  return <SessionControlInner system={system} {...props} />;
}

export default SessionControl;

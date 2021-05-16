import { Component } from "preact";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import { SessionSnapshot, SystemFacade } from "../SystemFacade";
import { useSessionSnapshot } from "../hooks";

type Props = {
  onLeave: () => void;
};

type InnerProps = Props & {
  system: SystemFacade;
  sessionSnapshot: SessionSnapshot | null;
};

type InnerState = {};

class SessionControlInner extends Component<InnerProps, InnerState> {
  private handleLeave = async () => {
    await this.props.system.leaveSession();
    this.props.onLeave();
  };

  render() {
    return (
      <div>
        <div>
          <button onClick={this.handleLeave}>Leave</button>
          {this.props.sessionSnapshot?.connections.map((connectionId) => {
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
  const sessionSnapshot = useSessionSnapshot();
  return (
    <SessionControlInner
      sessionSnapshot={sessionSnapshot}
      system={system}
      {...props}
    />
  );
}

export default SessionControl;

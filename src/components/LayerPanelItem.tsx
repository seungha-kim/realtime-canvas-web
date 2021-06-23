import { Component, h } from "preact";
import { ObjectMaterial, SystemFacade } from "../SystemFacade";
import { useObjectMaterial } from "../contexts/MaterialBroadcastContext";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import {
  FocusObservable,
  FocusType,
  useFocus$,
} from "../contexts/FocusContext";

type Props = {
  id: string;
  // root: 0, child of root: 1, ...
  level: number;
};

type InnerProps = Props & {
  material: ObjectMaterial;
  system: SystemFacade;
  selected: boolean;
  focus$: FocusObservable;
};

type LayerDescription = {
  type: string;
  name: string;
};

function createDescription(material: ObjectMaterial): LayerDescription {
  if (material.Oval) {
    return {
      type: "Oval",
      name: material.Oval.name,
    };
  } else if (material.Frame) {
    return {
      type: "Frame",
      name: material.Frame.name,
    };
  } else {
    return {
      type: "Undefined",
      name: "Undefined",
    };
  }
}

class LayerPanelItermInner extends Component<InnerProps> {
  private handleItemClick = (e: MouseEvent) => {
    e.stopPropagation();
    this.props.focus$.next({
      type: FocusType.layerPanelItem,
      id: this.props.id,
    });
  };

  private handleItemDblClick = (e: MouseEvent) => {
    e.stopPropagation();
    const name = prompt("new name");
    if (name) {
      this.props.system.pushDocumentCommand({
        UpdateName: {
          id: this.props.id,
          name,
        },
      });
    }
  };

  render() {
    const desc = createDescription(this.props.material);

    return (
      <div style={{ paddingLeft: 20 }}>
        <div
          style={{
            backgroundColor: this.props.selected ? "red" : null,
          }}
          onClick={this.handleItemClick}
          onDblClick={this.handleItemDblClick}
        >
          {desc?.type} - {desc?.name}
        </div>
        <div>
          {this.props.material.Frame &&
            this.props.material.Frame.children.map((id) => {
              return (
                <LayerPanelItem key={id} id={id} level={this.props.level + 1} />
              );
            })}
        </div>
      </div>
    );
  }
}

function LayerPanelItem(props: Props) {
  const material = useObjectMaterial(props.id);
  const focus$ = useFocus$();
  const system = useSystemFacade();
  const selected = focus$.value?.id === props.id;
  return (
    <LayerPanelItermInner
      material={material!}
      system={system}
      selected={selected}
      {...props}
      focus$={focus$}
    />
  );
}

export default LayerPanelItem;

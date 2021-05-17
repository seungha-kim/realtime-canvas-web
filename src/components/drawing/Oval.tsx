import { ObjectMaterial } from "../../SystemFacade";

type Props = {
  material: ObjectMaterial["Oval"];
};

function Oval(props: Props) {
  const material = props.material!;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        alert(material.name);
      }}
      style={{
        position: "absolute",
        left: material.pos_x,
        top: material.pos_y,
        width: material.r_h * 2,
        height: material.r_v * 2,
        border: "1px solid green",
      }}
    />
  );
}

export default Oval;

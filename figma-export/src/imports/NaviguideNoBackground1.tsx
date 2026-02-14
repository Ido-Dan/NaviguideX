import imgNaviguideNoBackground1 from "figma:asset/a7e66bfc8c21b5b68b11e104447ff99ed1584e9d.png";

export default function NaviguideNoBackground({ className }: { className?: string }) {
  return (
    <div className={className || "h-[753px] relative w-[1389px]"} data-name="naviguide_no_background 1">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[135.99%] left-0 max-w-none top-[-14.74%] w-[110.58%]" src={imgNaviguideNoBackground1} />
      </div>
    </div>
  );
}
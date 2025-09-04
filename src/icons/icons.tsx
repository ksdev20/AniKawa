import { iconJson } from "./iconsJson";

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  className?: string | null;
};
type IconWProps = {
  name?: string;
  size?: number;
  color?: string;
  nanoid: string;
};

export function Icon({
  name,
  size = 24,
  color = "#ffffff",
  className = null,
}: IconProps) {
  const obj = iconJson.find((i) => i.name == name);
  const { path = "", viewbox = "" } = obj ?? {};
  if (!path || !viewbox) return null;
  return (
    <svg
      {...(className ? { className: className } : undefined)}
      width={size}
      height={size}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewbox}
      fill={color}
    >
      <path d={path} />
    </svg>
  );
}

export function IconW({
  name = "watchlist",
  size = 28,
  color = "#8c52ff",
  nanoid,
}: IconWProps) {
  const obj = iconJson.find((i) => i.name == name);
  const { path = "", viewbox = "" } = obj ?? {};
  if (!path || !viewbox) return null;
  return (
    <svg
      className="w-svg"
      data-nanoid={nanoid}
      width={size}
      height={size}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewbox}
      fill={color}
    >
      <path d={path} />
    </svg>
  );
}

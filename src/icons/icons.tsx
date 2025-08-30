import { iconJson } from "./iconsJson";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export function Icon({
  name,
  size = 24,
  color = "#ffffff",
}: IconProps) {
  const obj = iconJson.find(i => i.name == name);
  const{ path = '', viewbox = ''  } = obj ?? {};
  if (!path || !viewbox) return null;
  return (
    <svg
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

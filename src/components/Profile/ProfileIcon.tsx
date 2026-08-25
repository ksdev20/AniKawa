import {
  HouseIcon,
  BooksIcon,
  HeartIcon,
  ChartLineUpIcon,
  ArrowUpRightIcon,
  MagnifyingGlassIcon,
  ListDashesIcon,
  ListIcon,
  SquaresFourIcon,
  FunnelIcon,
  CaretDownIcon,
  PlusIcon,
  MinusIcon,
  SortAscendingIcon,
} from "@phosphor-icons/react";

type ProfileIconName =
  | "overview"
  | "anime"
  | "favorites"
  | "stats"
  | "arrow-up-right"
  | "search"
  | "detailed"
  | "compact"
  | "cards"
  | "filter"
  | "chevron-down"
  | "plus"
  | "minus"
  | "sort";

type Props = {
  name: ProfileIconName;
  size?: number;
  className?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
};

const icons = {
  overview: HouseIcon,
  anime: BooksIcon,
  favorites: HeartIcon,
  stats: ChartLineUpIcon,

  "arrow-up-right": ArrowUpRightIcon,
  search: MagnifyingGlassIcon,
  detailed: ListDashesIcon,
  compact: ListIcon,
  cards: SquaresFourIcon,
  filter: FunnelIcon,
  "chevron-down": CaretDownIcon,
  plus: PlusIcon,
  minus: MinusIcon,
  sort: SortAscendingIcon,
};

export default function ProfileIcon({
  name,
  size = 22,
  className,
  weight = "regular",
}: Props) {
  const Icon = icons[name];

  return (
    <Icon
      size={size}
      weight={weight}
      className={className}
      aria-hidden="true"
    />
  );
}

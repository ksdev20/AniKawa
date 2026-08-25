import { PlusIcon } from "@phosphor-icons/react";

import "./AddToListButton.css";

type Props = {
  animeNanoid: string;
  onClick: (animeNanoid: string) => void;
  size?: number;
  className?: string;
  disabled?: boolean;
};

export default function AddToListButton({
  animeNanoid,
  onClick,
  size = 18,
  className = "",
  disabled = false,
}: Props) {
  return (
    <button
      type="button"
      className={`add-to-list-button ${className}`.trim()}
      aria-label="Add anime to your list"
      title="Add to list"
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        if (disabled) return;

        onClick(animeNanoid);
      }}
    >
      <PlusIcon size={size} weight="bold" aria-hidden="true" />
    </button>
  );
}

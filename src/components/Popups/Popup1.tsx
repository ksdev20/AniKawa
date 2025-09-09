import { Icon } from "../../icons/icons";
import "./popups.css";

type Popup1Props = {
  isOpen?: boolean;
  onClose: () => void;
};

export default function Popup1({ isOpen = true, onClose }: Popup1Props) {
  if (!isOpen) return null;

  return (
    <section
      className="popup-overlay"
      onClick={(e) => {
        if (e.target == e.currentTarget) onClose();
      }}
    >
      <dialog className="popup-1">
        <button aria-label="Close Popup" className="popup-close" onClick={onClose}>
          <Icon name="close" size={22} />
        </button>
        <span className="popup-msg">
          Please Login/Signup to Access this Feature.
        </span>
        <a className="popup-btn" href="/signup">
          Sign Up
        </a>
        <a className="popup-btn" href="/login">
          Log In
        </a>
      </dialog>
    </section>
  );
}

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { Icon } from "../../icons/icons";

export default function AnimeSliderCSR() {
  const markerRef = useRef<HTMLElement | null>(null);
  const sliderRef = useRef<HTMLUListElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const [scrollLock, setScrollLock] = useState(true);

  const [toggle, setToggle] = useState({
    hideLeft: true,
    hideRight: false,
  });

  const [dimensions, setDimensions] = useState({
    paddingLeft: 20,
    paddingRight: 20,
    totalW: 700,
    clientW: 700,
  });

  const updateDimensions = () => {
    const slider = sliderRef.current;

    if (!slider) return;

    const styles = getComputedStyle(slider);

    setDimensions({
      paddingLeft: parseFloat(styles.paddingLeft) || 0,
      paddingRight: parseFloat(styles.paddingRight) || 0,
      totalW: Math.round(slider.scrollWidth),
      clientW: Math.round(slider.clientWidth),
    });
  };

  const updateButtons = () => {
    const slider = sliderRef.current;

    if (!slider) return;

    const left = Math.round(slider.scrollLeft);

    const { paddingLeft, totalW, clientW } = dimensions;

    const EPSILON = 2;

    setToggle({
      hideLeft: left <= paddingLeft + EPSILON,
      hideRight: left + clientW >= totalW - EPSILON,
    });
  };

  useLayoutEffect(() => {
    const marker = markerRef.current;

    if (!marker) return;

    const parent = marker.closest(".slider-content-wrapper");

    const slider = parent?.querySelector<HTMLUListElement>(".slider-container");

    if (!slider) return;

    sliderRef.current = slider;

    setScrollLock(false);

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
      updateButtons();
    });

    resizeObserver.observe(slider);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    sliderRef.current?.classList.toggle("disable-clicks", scrollLock);
  }, [scrollLock]);

  useEffect(() => {
    updateButtons();
  }, [dimensions]);

  const lock = () => {
    setScrollLock(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setScrollLock(false);
      updateButtons();
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    const slider = sliderRef.current;

    if (scrollLock || !slider) {
      return;
    }

    const offset =
      direction === "left" ? -slider.clientWidth : slider.clientWidth;

    slider.scrollBy({
      left: offset,
      behavior: "smooth",
    });

    lock();
  };

  return (
    <nav
      ref={markerRef}
      className="slider-btn-section"
      aria-label="Anime slider controls"
    >
      <button
        aria-label="Scroll Left"
        className={`slider-btn left ${toggle.hideLeft ? "hidden" : ""}`}
        onClick={() => handleScroll("left")}
      >
        <Icon name="keyleft" size={30} className="s-btn" />
      </button>

      <button
        aria-label="Scroll Right"
        className={`slider-btn right ${toggle.hideRight ? "hidden" : ""}`}
        onClick={() => handleScroll("right")}
      >
        <Icon name="keyright" size={30} className="s-btn" />
      </button>
    </nav>
  );
}

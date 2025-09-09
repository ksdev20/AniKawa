import { useRef, useEffect, useState, useLayoutEffect } from "react";
import "./slider-btn-sectw.css";
import { Icon } from "../../icons/icons";

export default function AnimeSliderCSR() {
  const markerRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<Element | null>(null);
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

  //sets sliderRef
  useLayoutEffect(() => {
    const marker = markerRef.current;
    const parent = marker?.closest(".slider-content-wrapper");
    const slider = parent?.querySelector(".slider-container");
    if (!marker || !slider || !parent) return;

    sliderRef.current = slider;
    setScrollLock(false);

    //setDimensions of sliderRef
    const { paddingLeft, paddingRight } = getComputedStyle(slider);
    const { scrollWidth, clientWidth } = slider;
    setDimensions({
      paddingLeft: parseFloat(paddingLeft),
      paddingRight: parseFloat(paddingRight),
      totalW: Math.round(scrollWidth),
      clientW: Math.round(clientWidth),
    });
  }, []);

  //locks clicks
  useEffect(() => {
    sliderRef.current?.classList.toggle("disable-clicks", scrollLock);
  }, [scrollLock]);

  const update = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const leftW = Math.round(slider.scrollLeft);
    const { paddingLeft, paddingRight, totalW, clientW } = dimensions;

    const EPSILON = 2;
    setToggle({
      hideLeft: leftW <= paddingLeft + EPSILON,
      hideRight: leftW + clientW >= totalW - EPSILON,
    });
  };

  const lock = () => {
    setScrollLock(true);
    const timeout = timeoutRef.current;
    if (timeout) clearTimeout(timeout);
    timeoutRef.current = window.setTimeout(() => {
      setScrollLock(false);
      update();
    }, 500);
  };

  //timeout cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleScroll = (btn: "left" | "right") => {
    if (scrollLock || !sliderRef.current) return;
    const slider = sliderRef.current;
    const offset = btn == "left" ? -slider.clientWidth : slider.clientWidth;
    slider.scrollBy({ left: offset, behavior: "smooth" });
    lock();
  };

  return (
    <nav ref={markerRef} className="slider-btn-section">
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

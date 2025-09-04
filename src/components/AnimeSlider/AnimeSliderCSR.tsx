import { useRef, useEffect, useState, useLayoutEffect } from "react";
import "./slider-btn-sectw.css";
import { Icon } from "../../icons/icons";
import { getSliderDimensions } from "./getSliderDimensions";

export default function AnimeSliderCSR() {
  const markerRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [scrollLock, setScrollLock] = useState(true);
  const [hideLeft, setHideLeft] = useState(true);
  const [hideRight, setHideRight] = useState(false);
  const [dimensions, setDimensions] = useState({
    paddingLeft: 20,
    paddingRight: 20,
    totalW: 700,
    clientW: 700,
  });

  function getSl() {
    return sliderRef.current;
  }

  //sets sliderRef
  useLayoutEffect(() => {
    if (markerRef.current) {
      const parent = markerRef.current.closest(".slider-content-wrapper");
      if (parent) {
        sliderRef.current = parent.querySelector(".slider-container");
        setScrollLock(false);
      }
    }
  }, []);

  //setDimensions of sliderRef
  useLayoutEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const style = getComputedStyle(slider);
    setDimensions({
      paddingLeft: parseFloat(style.paddingLeft),
      paddingRight: parseFloat(style.paddingRight),
      totalW: Math.round(slider.scrollWidth),
      clientW: Math.round(slider.clientWidth),
    });
  }, [sliderRef]);

  //locks clicks
  useEffect(() => {
    sliderRef.current?.classList.toggle("disable-clicks", scrollLock);
  }, [scrollLock]);

  const update = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const leftW = Math.round(slider.scrollLeft);
    const { paddingLeft, paddingRight, totalW, clientW } = dimensions;

    setHideLeft(leftW <= paddingLeft + 1);
    setHideRight(leftW + clientW >= totalW - paddingRight - 1);
  };

  const lock = () => {
    setScrollLock(true);
    setTimeout(() => {
      setScrollLock(false);
      update();
    }, 500);
  };

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
        className={`slider-btn left ${hideLeft ? "hidden" : ""}`}
        onClick={() => handleScroll("left")}
      >
        <Icon name="keyleft" size={30} className="s-btn" />
      </button>
      <button
        className={`slider-btn right ${hideRight ? "hidden" : ""}`}
        onClick={() => handleScroll("right")}
      >
        <Icon name="keyright" size={30} className="s-btn" />
      </button>
    </nav>
  );
}

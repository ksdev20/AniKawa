import { useState, useRef, useEffect } from "react";
import "./pbtw.css";

export default function HeroCSR() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const intervalRef = useRef<number | undefined>(undefined);

  const interval = () => {
    intervalRef.current = window.setInterval(() => {
      setActiveIdx((idx) => (idx + 1) % 5);
    }, 8000);
  };

  useEffect(() => {
    sliderRef.current = document.getElementById("hs-slider") as HTMLDivElement;
    interval();
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const slider = sliderRef?.current;
    const card = slider?.children[activeIdx] as HTMLElement;
    slider?.scrollTo({ left: card?.offsetLeft, behavior: "smooth" });
  }, [activeIdx]);

  function onBarClick(i: number) {
    clearInterval(intervalRef.current);
    setActiveIdx(i);
    interval();
  }

  return (
    <section className="progress-container">
      {[0, 1, 2, 3, 4].map((i) => {
        return (
          <button
            key={i}
            className={`progress-bar ${activeIdx == i ? "active" : ""}`}
            onClick={() => {
              onBarClick(i);
            }}
          ></button>
        );
      })}
    </section>
  );
}

import { useState, useEffect } from "react";
import "./sortbuttonstw.css";
import { Icon } from "../../icons/icons";
import { buttons } from "../../config/npButtonsConfig";

export default function NewPopButtons({ listName }: { listName: string | undefined }) {
  const [activeIdx, setActiveIdx] = useState(-1);
  const [showSortDd, setSortDd] = useState(false);
  const [showFilterDd, setFilterDd] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const urlFilter =
      new URLSearchParams(location.search).get("filter") ?? "all";
    setActiveFilter(urlFilter);
  }, []);

  const handleDdBtnClick = (i: number, filter: any, subFilter: any) => {
    if (filter == "new-pop-filter") {
      if (subFilter !== listName) {
        window.location.href = `/list/${subFilter}?filter=${activeFilter}`;
      } else {
        handleMainBtnClick(i, filter);
      }
    } else if (filter == "language-filter") {
      if (subFilter !== activeFilter) {
        window.location.href = `?filter=${subFilter}`;
      } else {
        handleMainBtnClick(i, filter);
      }
    }
  };

  const handleMainBtnClick = (i: number, filter: any) => {
    if (activeIdx == i) {
      //in case click is on the active button
      setActiveIdx(-1);
      setSortDd(false);
      setFilterDd(false);
    } else {
      //in case of opposite button
      setActiveIdx(i);
      if (filter == "new-pop-filter") {
        setFilterDd(false);
        setSortDd(true);
      }
      if (filter == "language-filter") {
        setSortDd(false);
        setFilterDd(true);
      }
    }
  };

  return (
    <section
      className="new-first-right"
      aria-label="Sorting and Filtering Button Section"
    >
      {buttons.map((btn, i) => {
        const filter = btn.filter;
        return (
          <section
            key={i}
            className="new-first-right part"
            data-filter={filter}
          >
            <button
              className={`new-first-right ${activeIdx == i ? "active" : ""}`}
              onClick={() => {
                handleMainBtnClick(i, filter);
              }}
            >
              <Icon {...btn.iconProps} />
              <span className="filter-name">{btn.text}</span>
            </button>
            <aside
              className={`dropdown-new-pop ${activeIdx == i && (showSortDd || showFilterDd) ? "active" : ""}`}
            >
              {btn.subButtons.map((subBtn, idx) => {
                const { filter: subFilter } = subBtn;
                const isActive = subFilter == activeFilter;
                return (
                  <button
                    key={idx}
                    className={`dropdown-new-pop-btn ${subFilter == listName ? "active" : ""}`}
                    data-filter={subFilter}
                    onClick={() => {
                      handleDdBtnClick(i, filter, subFilter);
                    }}
                  >
                    {filter == "language-filter" && (
                      <Icon
                        name="radio-btn-checked"
                        size={16}
                        color={isActive ? "#8c52ff" : "#666666"}
                      />
                    )}
                    {subBtn.text}
                  </button>
                );
              })}
            </aside>
          </section>
        );
      })}
    </section>
  );
}

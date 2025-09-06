import { useEffect, useState } from "react";
import "./sortbuttonstw.css";
import { Icon } from "../../icons/icons";

interface prop{
  watHisAsking?: boolean;
};

export default function SortBtnHandler({ watHisAsking = false }: prop) {
  const [currentSort, setCurrentSort] = useState<string>('old');
  const [showDd, setShowDd] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fallback = watHisAsking ? 'new' : 'old';
    const sort = urlParams.get("sort") ??  fallback;
    setCurrentSort(sort);

    if (watHisAsking) return;

    const elDiv = document.getElementById("episodes-section");
    if (elDiv && window.location.hash == "#scroll") {
      const yOffset = -100;
      const y =
        elDiv.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "instant" });
    }
  }, []);

  const buttons = [
    {
      filter: "new",
      text: watHisAsking ? "Newest First" : "Descending (by order)",
    },
    {
      filter: "old",
      text: watHisAsking ? "Oldest First" : "Ascending (by order)",
    },
  ];

  return (
    <div className="new-first-right part">
      <div
        className={`new-first-right ${showDd ? "active" : ""}`}
        onClick={() => {
          setShowDd(!showDd);
        }}
      >
        <Icon name="sort" color="#666666" size={30} className={'part-icon' } />
        <div className="filter-name">SORT</div>
      </div>
      <div className={`dropdown-new-pop ${showDd ? "active" : ""}`}>
        {buttons.map((btn, i) => {
          return (
            <a
              key={btn.filter}
              href={`?sort=${btn.filter}#scroll`}
              className={`dropdown-new-pop-btn ${currentSort == btn.filter ? "active" : ""}`}
            >
              {btn.text}
            </a>
          );
        })}
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import '../../styles/animePage.css';
import './sortbuttons.css';

type SbhProps = {
    watHisAsking?: boolean;
    givenSort?: string | null;
}

export default function SortBtnHandler({watHisAsking = false, givenSort}: SbhProps) {
    const [currentSort, setCurrentSort] = useState<string | null>(null);
    const [showDd, setShowDd] = useState(false);

    useEffect(() => {
        const urlParams =  new URLSearchParams(location.search);
        const sort = givenSort ? givenSort : urlParams.get("sort") ?? "new";
        setCurrentSort(sort);

        if (watHisAsking) return;
        
        const elDiv = document.getElementById("episodes-section");
        if (elDiv && window.location.hash == '#scroll'){
            const yOffset = -100;
            const y = elDiv.getBoundingClientRect().top + window.pageYOffset + yOffset
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, []);

    const buttons = [
        {
            filter: "new",
            text: watHisAsking ? "Newest First" :"Descending (by order)"
        },
        {
            filter: "old",
            text: watHisAsking ? "Oldest First" :"Ascending (by order)"
        },
    ]

    return (
        <div className="new-first-right part">
            <div className={`new-first-right ${showDd ? 'active' : ''}`} onClick={() => {
                setShowDd(!showDd);
            }}>
                <svg
                    className="part-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    height="30px"
                    viewBox="0 -960 960 960"
                    width="30px"
                    fill="#666666"
                >
                    <path
                        d="M120-240v-80h240v80H120Zm0-200v-80h480v80H120Zm0-200v-80h720v80H120Z"
                    ></path>
                </svg>
                <div className="filter-name">SORT</div>
            </div>
            <div className={`dropdown-new-pop ${showDd ? 'active' : ''}`}>
                {buttons.map((btn, i) => {
                    return (
                        <a
                            key={btn.filter}
                            href={`?sort=${btn.filter}#scroll`}
                            className={`dropdown-new-pop-btn pop-new ${currentSort == btn.filter ? 'active' : ''}`}
                        >
                            {btn.text}
                        </a>
                    )
                })}
            </div>
        </div>
    )
}
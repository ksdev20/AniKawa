import { useState, useEffect } from 'react';
import './sortbuttons.css';

function RadioBtn({ isActive }: { isActive: boolean }) {
    const toFill = isActive ? '#8c52ff' : '#666666';
    return (
        <svg
            className="radio-btn-dropdown"
            xmlns="http://www.w3.org/2000/svg"
            height="16px"
            viewBox="0 -960 960 960"
            width="18px"
            fill={toFill}
        >
            <path
                d="M480-280q83 0 141.5-58.5T680-480q0-83-58.5-141.5T480-680q-83 0-141.5 58.5T280-480q0 83 58.5 141.5T480-280Zm0 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"
            ></path>
        </svg>
    )
}

export default function NewPopButtons({ n }: { n: string | undefined }) {
    const [activeIdx, setActiveIdx] = useState(-1);
    const [showSortDd, setSortDd] = useState(false);
    const [showFilterDd, setFilterDd] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        const urlFilter = new URLSearchParams(location.search).get("filter") ?? 'all';
        setActiveFilter(urlFilter);
    }, []);

    const buttons = [
        {
            filter: "new-pop-filter",
            text: "SORT",
            path: "M710-150q-63 0-106.5-43.5T560-300q0-63 43.5-106.5T710-450q63 0 106.5 43.5T860-300q0 63-43.5 106.5T710-150Zm0-80q29 0 49.5-20.5T780-300q0-29-20.5-49.5T710-370q-29 0-49.5 20.5T640-300q0 29 20.5 49.5T710-230Zm-550-30v-80h320v80H160Zm90-250q-63 0-106.5-43.5T100-660q0-63 43.5-106.5T250-810q63 0 106.5 43.5T400-660q0 63-43.5 106.5T250-510Zm0-80q29 0 49.5-20.5T320-660q0-29-20.5-49.5T250-730q-29 0-49.5 20.5T180-660q0 29 20.5 49.5T250-590Zm230-30v-80h320v80H480Zm230 320ZM250-660Z",
            subButtons: [
                {
                    filter: "popular",
                    text: "Popular"
                },
                {
                    filter: "new",
                    text: "Newest First"
                },
                {
                    filter: "old",
                    text: "Oldest First"
                }
            ]
        },
        {
            filter: "language-filter",
            text: "FILTER",
            path: "M120-240v-80h240v80H120Zm0-200v-80h480v80H120Zm0-200v-80h720v80H120Z",
            subButtons: [
                {
                    filter: "all",
                    text: "All"
                },
                {
                    filter: "sub",
                    text: "Subtitled"
                },
                {
                    filter: "dub",
                    text: "Dubbed"
                }
            ]
        }
    ];

    const handleDdBtnClick = (i:number, btn: any, subBtn: any) => {
        if (btn.filter == 'new-pop-filter') {
            if (subBtn.filter !== n) {
                window.location.href = `/list/${subBtn.filter}?filter=${activeFilter}`;
            } else {
                handleMainBtnClick(i, btn);
            }
        }
        else if (btn.filter == 'language-filter') {
            if (subBtn.filter !== activeFilter) {
                window.location.href = `?filter=${subBtn.filter}`;
            } else {
                handleMainBtnClick(i, btn);
            }
        }
    }

    const handleMainBtnClick = (i: number, btn: any) => {
        if (activeIdx == i) {
            setActiveIdx(-1);
            setSortDd(false);
            setFilterDd(false);
        } else {
            setActiveIdx(i);
            if (btn.filter == 'new-pop-filter') {
                setFilterDd(false);
                setSortDd(true);
            }
            if (btn.filter == 'language-filter') {
                setSortDd(false);
                setFilterDd(true);
            }
        }
    }

    return (
        <div className="new-first-right">
            {buttons.map((btn, i) => {
                const filter = btn.filter;

                return (
                    <div
                        key={i}
                        className="new-first-right part"
                        data-filter={filter}
                    >
                        <div className={`new-first-right ${activeIdx == i ? 'active' : ''}`} onClick={() => {
                            handleMainBtnClick(i, btn);
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
                                    d={btn.path}
                                ></path>
                            </svg>
                            <div
                                className="filter-name"
                            >{btn.text}
                            </div>
                        </div>
                        <div className={`dropdown-new-pop ${(activeIdx == i && showSortDd) || (activeIdx == i && showFilterDd) ? 'active' : ''}`}>
                            {btn.subButtons.map((subBtn, iS) => {
                                return (
                                    <div
                                        key={iS}
                                        className={`dropdown-new-pop-btn ${filter == 'new-pop-filter' ? 'pop-new' : 'language'} ${subBtn.filter == n ? 'active' : ''}`}
                                        data-filter={subBtn.filter}
                                        onClick={() => {
                                            handleDdBtnClick(i, btn, subBtn);
                                        }}
                                    >
                                        {filter == 'language-filter' ? <RadioBtn isActive={subBtn.filter == activeFilter} /> : <div></div>}
                                        {subBtn.text}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
import { useRef, useEffect, useState } from 'react';
import fetchUserDetails from '../../global_assets/FetchUserDetails';

export default function AnimeWBtn({ nanoid = "xyzxyz", forAC2 = false }: { nanoid: string, forAC2?: boolean }) {
    const markerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<Element | null | undefined>(null);
    const [addedStatus, setAddedStatus] = useState(false);

    useEffect(() => {
        const w = localStorage.getItem('watchlist');
        if (!w) return;
        const watchlist = JSON.parse(w);
        if (watchlist.includes(nanoid)) setAddedStatus(true);

        const parent = markerRef.current?.closest('.tooltip.w');;
        tooltipRef.current = parent;
    }, []);

    useEffect(() => {
        const ttp = tooltipRef.current;
        addedStatus ? ttp?.setAttribute('data-tip', 'Remove From Watchlist') : ttp?.setAttribute('data-tip', 'Add To Watchlist');
    }, [addedStatus])

    function fetchFunction() {
        if (localStorage.getItem('isLoggedIn') == 'false') return;
        const action = addedStatus ? 'deleteFromList' : 'addToList';
        const successLog = addedStatus ? 'Removed from watchlist✅' : 'Added to watchlist✅';
        const failLog = addedStatus ? 'Failed to remove from watchlist❌' : 'Failed to add to watchlist❌';

        fetch(`http://localhost:20000/api/${action}?item=${nanoid}&field=watchlist`, {
            method: 'GET',
            credentials: 'include'
        }).then(res => res.json()).then(data => {
            if (data.success) {
                console.log(successLog);
                setAddedStatus(!addedStatus);
                fetchUserDetails();
            } else {
                console.log(failLog);
            }
        }).catch(e => {
            console.error(e.message);
        });
    }

    return (
        <ToSend forAC2={forAC2} addedStatus={addedStatus} onClick={fetchFunction} markerRef={markerRef}/>
    )
}

function ToSend({ addedStatus, onClick, forAC2 = false, markerRef }: { forAC2: boolean,addedStatus: boolean, onClick: () => void, markerRef: any }) {
    if (forAC2) {
        return (
            <div
                className="anime-card-2-watchlist-btn"
                onClick={onClick}
            >
                <MainWBtn markerRef={markerRef} addedStatus={addedStatus} onClick={() => {}}/>
                <div className="anime-card-2-watchlist-text">
                    {addedStatus ? 'IN WATCHLIST' : 'ADD TO WATCHLIST'}
                </div>
            </div>
        )
    } else {
        return (
            <MainWBtn addedStatus={addedStatus} onClick={onClick} markerRef={markerRef}/>
        )
    }
}

function MainWBtn({ addedStatus, onClick, markerRef }: { addedStatus: boolean, onClick: () => void, markerRef: any }) {
    return (
        <div ref={markerRef} onClick={onClick} className='anime-wbtn-main'>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                height="28px"
                viewBox="0 -960 960 960"
                width="28px"
                fill="#8c52ff"
            >
                <path
                    d={
                        `${addedStatus
                            ? "M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z"
                            : "M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z"}`
                    }
                ></path>
            </svg>
        </div>
    )
}
import { useEffect, useRef, useState } from 'react';

export default function EDelBtn({ animenanoid, slug }: { animenanoid: string, slug: string }) {
    const markerRef = useRef<SVGSVGElement | null>(null);
    const cardRef = useRef<HTMLElement | null>(null);
    const listRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!markerRef.current) return;
        cardRef.current = markerRef.current.closest('.episode-card');
        listRef.current = document.getElementById('history-list');
    }, []);

    const lockThings = () => {
        listRef.current?.classList.add('disable-clicks');
        document.body.classList.add('loading');
    }

    const unlockThings = () => {
        listRef.current?.classList.remove('disable-clicks');
        document.body.classList.remove('loading');
    }

    function removeCard() {
        const cR = cardRef.current;
        if (cR) {
            cR.remove();
            if (listRef.current?.children?.length == 0) {
                updateHistoryPage();
            }
        }
    }

    function updateHistoryPage() {
        const historyM = document.getElementById('history-main');
        const emptyBox = document.getElementById('empty-wh');
        emptyBox?.classList.add('active');
        historyM?.classList.remove('active');
    }

    const delEpisodeFromHis = async () => {
        lockThings();
        await fetch(`http://localhost:20000/api/deleteFromList?item=${animenanoid},${slug}&field=history`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    removeCard();
                    console.log("Successfully deleted from history : ", animenanoid, slug);
                } else {
                    console.log("Failed to delete From history");
                }
            })
            .then(unlockThings)
            .catch(e => {
                console.log(e);
            })
    }

    return (
        <svg ref={markerRef} onClick={delEpisodeFromHis} className="ec-del-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
    )
}
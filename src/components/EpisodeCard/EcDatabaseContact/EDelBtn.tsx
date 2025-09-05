import { useEffect, useRef } from 'react';
import { Icon } from '../../../icons/icons';
const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

export default function EDelBtn({ animenanoid, slug }: { animenanoid: string, slug: string }) {
    const markerRef = useRef<HTMLButtonElement | null>(null);
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
        await fetch(`${backendUrl}/api/deleteFromList?item=${animenanoid},${slug}&field=history`, {
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
        <button title='Delete from history' ref={markerRef} onClick={delEpisodeFromHis} className='ec-del-btn'>
            <Icon name='delete' color='#666666' className='ec-del-icon' />
        </button>
    )
}
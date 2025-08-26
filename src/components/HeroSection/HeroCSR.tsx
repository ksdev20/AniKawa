import { useState, useRef, useEffect } from 'react';
import './pbtw.css';

export default function HeroCSR(){
    const sliderRef = useRef<HTMLDivElement>(null);
    const [activeIdx, setActiveIdx ] = useState(0);
    const intervalRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        sliderRef.current = document.getElementById("hs-slider") as HTMLDivElement;
    }, []);

    useEffect(() => {
        intervalRef.current = window.setInterval(() => {
            setActiveIdx(idx => (idx + 1) % 5);
        }, 8000);
        return () => clearInterval(intervalRef.current);
    }, []);

    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider) return;
        const card = slider.children[activeIdx] as HTMLElement;
        if (card){
            slider.scrollTo({ left:card.offsetLeft, behavior: 'smooth' });
        }
    }, [activeIdx]);

    function onBarClick(i: number){
        clearInterval(intervalRef.current);
        setActiveIdx(i);
        intervalRef.current = window.setInterval(() => {
            setActiveIdx(idx => (idx + 1) % 5);
        },8000);
    }

    return (
        <div className='progress-container'>
            {[0, 1, 2, 3, 4].map((i) => {
                return (
                    <div key={i} className={`progress-bar ${ activeIdx == i ? 'active' : ''}`} onClick={() => { onBarClick(i) }}></div>
                )
            })}
        </div>
    )
}
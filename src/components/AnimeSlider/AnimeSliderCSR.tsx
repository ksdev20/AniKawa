import { useRef, useEffect, useState, useLayoutEffect } from 'react';
import './slider-btn-sec.css';

export default function AnimeSliderCSR() {
    const markerRef = useRef<HTMLDivElement | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const btnL = useRef<HTMLDivElement>(null);
    const btnR = useRef<HTMLDivElement>(null);
    const [scrollLock, setScrollLock] = useState(true);

    useLayoutEffect(() => {
        if (markerRef.current) {
            const parent = markerRef.current.closest(".slider-content-wrapper");
            if (parent) {
                sliderRef.current = parent.querySelector('.slider-container');
                setScrollLock(false);
            }
        }
    }, []);

    useEffect(() => {
        scrollLock ? sliderRef.current?.classList.add('disable-clicks') : sliderRef.current?.classList.remove('disable-clicks');
    }, [scrollLock]);

    function update() {
        const slider = sliderRef.current;
        const bl = btnL.current;
        const br = btnR.current;

        if (!slider || !bl || !br) return;
        const style = getComputedStyle(slider);
        const paddingLeft = parseFloat(style.paddingLeft);
        const paddingRight = parseFloat(style.paddingRight);

        const totalW = Math.round(slider.scrollWidth);
        const leftW = Math.round(slider.scrollLeft);
        const clientW = Math.round(slider.clientWidth);

        bl.classList.toggle("hidden", leftW <= paddingLeft + 1);
        br.classList.toggle("hidden", leftW + clientW >= totalW - paddingRight - 1);
    }

    function lock() {
        setScrollLock(true);
        document.body.classList.add('scroll-lock');
        window.setTimeout(() => {
            setScrollLock(false);
            document.body.classList.remove('scroll-lock');
        }, 500)
    }

    function scroll(btn: string) {
        const slider = sliderRef.current;
        if (!slider) return;
        const offset = btn == 'left' ? -slider.clientWidth : slider.clientWidth;
        slider.scrollBy({ left: offset, behavior: 'smooth' });

        // setTimeout(() => {
        //     update();
        // }, 500); 
    }

    useLayoutEffect(() => {
        const slider = sliderRef.current;
        if (!slider) return;

        const handleScroll = () => update();

        requestAnimationFrame(() => {
            update();
        });

        slider.addEventListener("scroll", handleScroll);

        return () => {
            slider.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div ref={markerRef} className="slider-btn-section">
            <div ref={btnL} className={`slider-btn left ${scrollLock ? 'disable-click' : ''}`} onClick={() => {
                if (scrollLock) return;
                scroll('left');
                lock();
            }}>
                <svg className="s-btn" xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960"
                    width="30px" fill="#ffffff">
                    <path
                        d="m382-480 294 294q15 15 14.5 35T675-116q-15 15-35 15t-35-15L297-423q-12-12-18-27t-6-30q0-15 6-30t18-27l308-308q15-15 35.5-14.5T676-844q15 15 15 35t-15 35L382-480Z" />
                </svg>
            </div>
            <div ref={btnR} className={`slider-btn right ${scrollLock ? 'disable-click' : ''}`} onClick={() => {
                if (scrollLock) return;
                scroll('right');
                lock();
            }}>
                <svg className="s-btn" xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960"
                    width="30px" fill="#ffffff">
                    <path
                        d="M579-480 285-774q-15-15-14.5-35.5T286-845q15-15 35.5-15t35.5 15l307 308q12 12 18 27t6 30q0 15-6 30t-18 27L356-115q-15 15-35 14.5T286-116q-15-15-15-35.5t15-35.5l293-293Z" />
                </svg>
            </div>
        </div>
    )
}
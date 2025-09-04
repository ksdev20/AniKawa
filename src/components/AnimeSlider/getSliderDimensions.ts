import { useLayoutEffect, useState } from 'react';

export function getSliderDimensions(sliderRef: React.RefObject<HTMLDivElement | null>) {
    const [dimensions, setDimensions] = useState({
        paddingLeft: 20,
        paddingRight: 20,
        totalW: 700,
        clientW: 700,
    });

    useLayoutEffect(() => {
        const slider = sliderRef.current;
        if (!slider) return;
        const style = getComputedStyle(slider);
        setDimensions({
            paddingLeft: parseFloat(style.paddingLeft),
            paddingRight: parseFloat(style.paddingRight),
            totalW: Math.round(slider.scrollWidth),
            clientW: Math.round(slider.clientWidth),
        });
    }, [sliderRef]);

    return dimensions;
}
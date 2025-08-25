import React, { useEffect, useRef, useState } from "react";
import "./scroll-jump.style.css";

const EPS = 16; // tolerance in px

const ScrollJumpButton = () => {
    const [atTop, setAtTop] = useState(true);
    const [atBottom, setAtBottom] = useState(false);

    const rafRef = useRef(0);
    const resizeObsRef = useRef(null);

    useEffect(() => {
        const update = () => {
            const y  = window.scrollY || window.pageYOffset;
            const vh = window.innerHeight;
            const h  = document.documentElement.scrollHeight;

            const canScroll = h > vh + 1; // page actually scrolls
            const nearTop = y <= EPS;
            const nearBottom = y + vh >= h - EPS;

            // If page can't scroll, treat as "atTop" and NOT "atBottom"
            setAtTop(nearTop || !canScroll);
            setAtBottom(canScroll ? nearBottom : false);
        };

        // Run immediately, next frame, and after load
        update();
        rafRef.current = requestAnimationFrame(update);
        window.addEventListener("load", update, { once: true });

        // Keep in sync with user actions / viewport changes
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);

        // Also watch content height changes (images, fonts, lazy content)
        const ro = new ResizeObserver(update);
        ro.observe(document.documentElement);
        resizeObsRef.current = ro;

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("load", update);
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
            resizeObsRef.current?.disconnect();
        };
    }, []);

    const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    const goBottom = () =>
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
        });

    // Visibility:
    // - top only: showDown
    // - bottom only: showUp
    // - middle: both
    const showUp = !atTop || atBottom;
    const showDown = !atBottom || atTop;

    return (
        <div className="scroll-jump-wrap" aria-label="Jump navigation">
            {showUp && (
                <button
                    className="scroll-jump up"
                    onClick={goTop}
                    aria-label="Go to top"
                    title="Go to top"
                >
                    <span className="arrow">▴</span>
                </button>
            )}

            {showDown && (
                <button
                    className="scroll-jump down"
                    onClick={goBottom}
                    aria-label="Go to bottom"
                    title="Go to bottom"
                >
                    <span className="arrow">▾</span>
                </button>
            )}
        </div>
    );
};

export default ScrollJumpButton;

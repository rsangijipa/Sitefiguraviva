"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const mouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", mouseMove);

        // Add event listeners for hover effects
        const handleMouseOver = (e) => {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    return (
        <>
            <motion.div
                className="cursor-dot hidden md:block"
                animate={{
                    x: mousePosition.x - 3,
                    y: mousePosition.y - 3,
                    scale: isHovering ? 0 : 1
                }}
                transition={{ type: "spring", stiffness: 500, damping: 28, restDelta: 0.001 }}
            />
            <motion.div
                className="cursor-outline hidden md:block"
                animate={{
                    x: mousePosition.x - 16,
                    y: mousePosition.y - 16,
                    scale: isHovering ? 2 : 1,
                    borderWidth: isHovering ? "1px" : "2px",
                    backgroundColor: isHovering ? "rgba(197, 160, 101, 0.1)" : "transparent"
                }}
                transition={{ type: "spring", stiffness: 250, damping: 20, restDelta: 0.001 }}
            />
        </>
    );
}

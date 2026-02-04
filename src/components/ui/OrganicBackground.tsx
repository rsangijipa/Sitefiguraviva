import React, { useEffect, useRef } from 'react';

interface Blob {
    x: number;
    y: number;
    r: number;
    vx: number;
    vy: number;
    color: string;
}

const OrganicBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const blobs: Blob[] = [
            { x: 0, y: 0, r: 0, vx: 0.2, vy: 0.2, color: 'rgba(176, 141, 85, 0.05)' }, // Gold
            { x: 0, y: 0, r: 0, vx: -0.3, vy: 0.1, color: 'rgba(122, 90, 84, 0.05)' }, // Secondary
            { x: 0, y: 0, r: 0, vx: 0.1, vy: -0.2, color: 'rgba(93, 112, 82, 0.05)' }, // Accent
        ];

        // Initialize blobs with random positions relative to screen size
        blobs.forEach(blob => {
            blob.x = Math.random() * canvas.width;
            blob.y = Math.random() * canvas.height;
            blob.r = Math.min(canvas.width, canvas.height) * (0.3 + Math.random() * 0.2);
        });

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            blobs.forEach(blob => {
                blob.x += blob.vx;
                blob.y += blob.vy;

                // Bounce off edges (with wide margins to keep them partially on screen)
                if (blob.x < -blob.r) blob.vx = Math.abs(blob.vx);
                if (blob.x > canvas.width + blob.r) blob.vx = -Math.abs(blob.vx);
                if (blob.y < -blob.r) blob.vy = Math.abs(blob.vy);
                if (blob.y > canvas.height + blob.r) blob.vy = -Math.abs(blob.vy);

                ctx.beginPath();
                ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
                ctx.fillStyle = blob.color;
                ctx.fill();
            });

            // Add a subtle grainy texture or overlay if needed, currently just blobs

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 top-0 left-0 w-full h-full -z-10 pointer-events-none"
            style={{ opacity: 0.8 }} // Global opacity adjustment
        />
    );
};

export default OrganicBackground;

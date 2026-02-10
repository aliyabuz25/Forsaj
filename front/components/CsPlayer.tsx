import React, { useEffect, useRef } from 'react';

interface CsPlayerProps {
    videoId: string;
    id?: string;
    theme?: 'default' | 'youtube' | 'plyr';
    loop?: boolean;
}

declare global {
    interface Window {
        csPlayer: any;
    }
}

const CsPlayer: React.FC<CsPlayerProps> = ({
    videoId,
    id = 'cs-player-' + Math.random().toString(36).substr(2, 9),
    theme = 'default',
    loop = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!window.csPlayer) {
            console.error('csPlayer not found in window');
            return;
        }

        const initPlayer = async () => {
            try {
                if (initializedRef.current) {
                    window.csPlayer.destroy(id);
                }

                await window.csPlayer.init(id, {
                    defaultId: videoId,
                    thumbnail: true,
                    theme: theme,
                    loop: loop,
                });

                initializedRef.current = true;
            } catch (err) {
                console.error('csPlayer initialization failed:', err);
            }
        };

        // Give a small timeout to ensure DOM is ready and csPlayer is loaded
        const timeoutId = setTimeout(initPlayer, 100);

        return () => {
            clearTimeout(timeoutId);
            if (initializedRef.current && window.csPlayer) {
                try {
                    window.csPlayer.destroy(id);
                } catch (err) {
                    // Ignore destruction errors on unmount
                }
            }
        };
    }, [videoId, id, theme, loop]);

    return (
        <div
            ref={containerRef}
            id={id}
            className="w-full h-full min-h-[300px] bg-black"
        />
    );
};

export default CsPlayer;

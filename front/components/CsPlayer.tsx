import React, { useEffect, useRef, useState } from 'react';

interface CsPlayerProps {
    videoId: string;
    id?: string;
    theme?: 'default' | 'youtube' | 'plyr';
    loop?: boolean;
}

declare global {
    interface Window {
        csPlayer: any;
        YT: any;
        onYouTubeIframeAPIReady: (() => void) | undefined;
    }
}

const CsPlayer: React.FC<CsPlayerProps> = ({
    videoId,
    id: providedId,
    theme = 'default',
    loop = false
}) => {
    // Use a stable ID for the lifetime of this component instance if not provided
    const [playerId] = useState(() => providedId || 'csp_' + Math.random().toString(36).substr(2, 9));
    const containerRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        let isMounted = true;

        const initPlayer = async () => {
            if (!isMounted) return;

            if (!window.csPlayer) {
                console.error('csPlayer library not found');
                return;
            }

            // Wait for YouTube API to be ready
            if (!window.YT || !window.YT.Player) {
                console.log('Waiting for YouTube IFrame API...');
                setTimeout(initPlayer, 200);
                return;
            }

            try {
                // Destroy existing instance with the same ID if any
                if (initializedRef.current || window.csPlayer.initialized?.(playerId)) {
                    window.csPlayer.destroy(playerId);
                }

                console.log('Initializing csPlayer for:', videoId);
                await window.csPlayer.init(playerId, {
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

        // Ensure the container is in the DOM before initializing
        const timeoutId = setTimeout(initPlayer, 200);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            if (initializedRef.current && window.csPlayer) {
                try {
                    window.csPlayer.destroy(playerId);
                } catch (err) {
                    // Ignore destruction errors
                }
            }
        };
    }, [videoId, playerId, theme, loop]);

    return (
        <div
            ref={containerRef}
            id={playerId}
            className="w-full h-full min-h-[300px] bg-black"
        />
    );
};

export default CsPlayer;

import { Link, LinkProps } from "react-router-dom";
import { useCallback } from "react";

interface PreloadLinkProps extends LinkProps {
    preload?: () => void;
}

/**
 * Enhanced Link component that triggers a preload function on hover/touch.
 * Used for instant navigation with lazyPreload utility.
 */
export const PreloadLink = ({ preload, onMouseEnter, onTouchStart, ...props }: PreloadLinkProps) => {
    const handlePreload = useCallback(() => {
        if (preload) {
            preload();
        }
    }, [preload]);

    return (
        <Link
            {...props}
            onMouseEnter={(e) => {
                handlePreload();
                onMouseEnter?.(e);
            }}
            onTouchStart={(e) => {
                handlePreload();
                onTouchStart?.(e);
            }}
        />
    );
};

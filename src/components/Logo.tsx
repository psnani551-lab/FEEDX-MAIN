import React from 'react';
import { cn } from '@/lib/utils';
import feedxLogo from '@/assets/feedx-logo.png';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    admin?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, size = 'md', admin = false }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    };

    return (
        <div className={cn(
            "relative flex items-center justify-center group",
            sizeClasses[size],
            className
        )}>
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-500 scale-75 group-hover:scale-110 opacity-0 group-hover:opacity-100" />

            {/* Logo Image */}
            <img
                src={feedxLogo}
                alt="FeedX Logo"
                fetchPriority="high"
                loading="eager"
                className={cn(
                    "w-full h-full object-contain relative z-10 transition-all duration-500",
                    admin ? "brightness-110 contrast-110" : "group-hover:scale-105"
                )}
            />

            {/* Decorative Ring (Optional, only if it fits the new logo style) */}
            <div className="absolute inset-0 rounded-full border border-primary/10 scale-125 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
        </div>
    );
};

export default Logo;

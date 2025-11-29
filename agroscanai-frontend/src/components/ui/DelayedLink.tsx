import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface DelayedLinkProps {
    to: string;
    className: string;
    children: React.ReactNode;
    delayMs?: number;
}

const DelayedLink: React.FC<DelayedLinkProps> = ({ to, className, children, delayMs = 500 }) => {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const navigate = useNavigate();

    const handleClick = useCallback((e: React.MouseEvent) => {
        // Prevent default navigation
        e.preventDefault();
        
        // Start transition effect and timer
        setIsTransitioning(true);
        
        setTimeout(() => {
            // After delay, navigate to the target route
            navigate(to);
        }, delayMs);

    }, [to, delayMs, navigate]);

    // Apply specific loading classes if transitioning
    const transitionClasses = isTransitioning 
        ? 'bg-green-400 cursor-wait' 
        : '';

    return (
        <Link
            to={to}
            className={`${className} ${transitionClasses}`}
            onClick={handleClick}
            aria-disabled={isTransitioning}
        >
            {isTransitioning ? (
                <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Loading...
                </div>
            ) : (
                children
            )}
        </Link>
    );
};

export default DelayedLink;
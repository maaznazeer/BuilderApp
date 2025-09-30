import React, { useState, useRef, useEffect } from 'react';
    import { Skeleton } from '@/components/ui/skeleton';

    const LazyLoadWidget = ({ children, placeholderHeight = '300px' }) => {
        const [isVisible, setIsVisible] = useState(false);
        const ref = useRef(null);

        useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.unobserve(entry.target);
                    }
                },
                {
                    rootMargin: '0px 0px 200px 0px', // Load 200px before it enters the viewport
                    threshold: 0.01
                }
            );

            if (ref.current) {
                observer.observe(ref.current);
            }

            return () => {
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            };
        }, []);

        return (
            <div ref={ref}>
                {isVisible ? children : <Skeleton style={{ height: placeholderHeight }} className="w-full rounded-2xl shadow-sm" />}
            </div>
        );
    };

    export default LazyLoadWidget;
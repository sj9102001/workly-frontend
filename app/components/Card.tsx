import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/app/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> { }

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'bg-white rounded-lg border border-gray-200 shadow-sm',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = 'Card';

export default Card; 
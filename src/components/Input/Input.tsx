import React, { forwardRef } from 'react';
import { classMerge } from '@/utils/classMerge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={classMerge(
          'px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
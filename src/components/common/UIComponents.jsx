import React from 'react';

// Badge Component
export const Badge = ({ children, variant = 'gray', className = '' }) => {
    const variants = {
        gray: 'bg-slate-100 text-slate-600',
        blue: 'bg-blue-100 text-blue-700',
        green: 'bg-emerald-100 text-emerald-700',
        red: 'bg-red-50 text-red-600',
        amber: 'bg-amber-50 text-amber-600',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// Button Component
export const Button = ({ children, onClick, variant = 'white', className = '', ...props }) => {
    const base = "px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 justify-center";
    const variants = {
        white: "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50",
        blue: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        red: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        ghost: "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
    };

    return (
        <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

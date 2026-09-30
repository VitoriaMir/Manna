import React from 'react';

export const LogoIcon = ({ className = "w-8 h-8" }) => {
    return (
        <div className={`${className} flex items-center justify-center`}>
            <img src="/favicon.svg" alt="Logo" className="w-full h-full" />
        </div>
    );
};

export default LogoIcon;
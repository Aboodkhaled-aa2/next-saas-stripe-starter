import React from 'react';

interface MarketingLayoutProps {
    children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
    return (
        <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
            {children}
        </div>
    );
}

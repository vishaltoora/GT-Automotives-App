import React from 'react';
export interface AnalyticsCardData {
    title: string;
    mtdValue: number;
    ytdValue: number;
    mtdCount?: number;
    ytdCount?: number;
    icon?: React.ReactNode;
    color?: string;
    formatValue?: (value: number) => string;
}
interface AnalyticsCardsProps {
    cards: AnalyticsCardData[];
    loading?: boolean;
}
declare const AnalyticsCards: React.FC<AnalyticsCardsProps>;
export default AnalyticsCards;
export declare const AnalyticsIcons: {
    Money: import("react/jsx-runtime").JSX.Element;
    Receipt: import("react/jsx-runtime").JSX.Element;
    Purchase: import("react/jsx-runtime").JSX.Element;
    Expense: import("react/jsx-runtime").JSX.Element;
    TrendingUp: import("react/jsx-runtime").JSX.Element;
    TrendingDown: import("react/jsx-runtime").JSX.Element;
};
//# sourceMappingURL=AnalyticsCards.d.ts.map
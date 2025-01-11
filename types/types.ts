export type EarningEntry = {
  ticker: string;
  market_session: 'pre' | 'after' | null;
};

export type WeekData = {
  [key: string]: EarningEntry[];
};
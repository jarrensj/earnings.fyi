export type EarningEntry = {
  ticker: string;
  market_session: 'pre' | 'after' | null;
  logo_url: string;
};

export type WeekData = {
  [key: string]: EarningEntry[];
};
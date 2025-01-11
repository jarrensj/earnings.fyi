import React from 'react';
import dayjs from 'dayjs';
import DayCard from '@/components/DayCard';
import { WeekData } from '@/types/types';

interface EarningsWeekProps {
  title: string;
  weekData: WeekData;
  weekStartDate: dayjs.Dayjs;
  favorites: string[];
  onToggleFavorite: (ticker: string) => void;
}

const EarningsWeek: React.FC<EarningsWeekProps> = ({ title, weekData, weekStartDate, favorites, onToggleFavorite }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(weekData).map(([day, entries], index) => {
          const dayDate = weekStartDate.add(index, 'day').format('MM/DD');
          return <DayCard key={day} day={day} date={dayDate} entries={entries} favorites={favorites} onToggleFavorite={onToggleFavorite} />;
        })}
      </div>
    </div>
  );
};

export default EarningsWeek;

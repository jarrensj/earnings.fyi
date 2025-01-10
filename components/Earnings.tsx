'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);

interface EarningsData {
  ticker: string;
  earnings_date: string;
  market_session: string | null;
}

type EarningEntry = {
  ticker: string;
  market_session: 'pre' | 'after' | null;
};

type WeekData = {
  [key: string]: EarningEntry[];
};

const DayCard: React.FC<{ day: string; date: string; entries: EarningEntry[], isPast: boolean }> = ({ day, entries, isPast }) => {
  const sessionOrder = ['pre', 'after', null];
  const sortedEntries = [...entries].sort((a, b) => {
    return sessionOrder.indexOf(a.market_session) - sessionOrder.indexOf(b.market_session);
  });

  return (
    <Card className={`"h-full relative" ${isPast ? 'bg-gray-100 text-gray-500' : ""}`} >
      <p className="absolute top-2 left-2 text-xs text-gray-400"></p>
      <CardHeader className="pt-6">
        <CardTitle className="text-lg font-semibold">{day}</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEntries.length > 0 ? (
          <ul className="space-y-2">
            {sortedEntries.map((entry, index) => (
              <li
                key={index}
                className="flex items-center text-sm"
              >
                <div className="flex items-center">
                  <span className="font-medium">{entry.ticker}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500"></p>
        )}
      </CardContent>
    </Card>
  );
};

const EarningsWeek: React.FC<{ title: string; weekData: WeekData; weekStartDate: dayjs.Dayjs }> = ({ title, weekData, weekStartDate }) => {
    const today = dayjs();
  
    return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(weekData).map(([day, entries], index) => {
          const dayDate = weekStartDate.add(index, 'day').format('MM/DD');
          const isPast = weekStartDate.add(index, 'day').isBefore(today, 'day');
          return <DayCard key={day} day={day} date={dayDate} entries={entries} isPast={isPast} />;
        })}
      </div>
    </div>
  );
};

const Earnings: React.FC = () => {
  const [earnings, setEarnings] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLastWeek] = useState<boolean>(false);
  const [currentDateTime, setCurrentDateTime] = useState(dayjs());

  useEffect(() => {
    const fetchEarnings = async () => {
      const response = await fetch('/api/earnings');
      const data: EarningsData[] = await response.json();
      setEarnings(data);
      setLoading(false);
    };

    fetchEarnings();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  // Organize earnings data by week and day
  const weeks: { [key: string]: WeekData } = {};

  earnings.forEach((item) => {
    const date = dayjs(item.earnings_date);
    const weekKey = `${date.isoWeek()}-${date.year()}`;

    if (!weeks[weekKey]) {
      weeks[weekKey] = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
    }

    const dayName = date.format('dddd');

    weeks[weekKey][dayName].push({
      ticker: item.ticker,
      market_session: (item.market_session as "pre" | "after" | null) || null,
    });
  });

  // Get the current date
  const today = dayjs();

  // If today is Saturday or Sunday, set currentWeekDate to next week
  const isSaturday = today.day() === 6; // Saturday is day 6
  const isSunday = today.day() === 0; // Sunday is day 0
  const currentWeekDate = isSaturday || isSunday ? today.add(1, 'week') : today;

  // If showing last week, calculate last week based on currentWeekDate
  const lastWeekDate = currentWeekDate.subtract(1, 'week');
  const lastWeekNum = lastWeekDate.isoWeek();
  const lastWeekYear = lastWeekDate.year();

  // Prepare weeks to show (including all future weeks)
  const allWeeks = Object.keys(weeks)
    .sort((a, b) => {
      const [weekNumA, yearA] = a.split('-').map(Number);
      const [weekNumB, yearB] = b.split('-').map(Number);
      const dateA = dayjs().year(yearA).isoWeek(weekNumA).startOf('isoWeek');
      const dateB = dayjs().year(yearB).isoWeek(weekNumB).startOf('isoWeek');
      return dateA.isAfter(dateB) ? 1 : -1;
    })
    .filter((weekKey) => {
      const [weekNum, year] = weekKey.split('-').map(Number);
      const weekStart = dayjs().year(year).isoWeek(weekNum).startOf('isoWeek');
      const weekEnd = weekStart.add(6, 'days'); // End of the week (Sunday)
      return weekEnd.isSameOrAfter(today, 'day'); // Ensure only future weeks are shown
    });

  if (showLastWeek && weeks[`${lastWeekNum}-${lastWeekYear}`]) {
    allWeeks.unshift(`${lastWeekNum}-${lastWeekYear}`);
  }

  return (
    <div className="space-y-8">
      <p className="text-center text-sm text-gray-600">
        {currentDateTime.format('MMMM D, YYYY h:mm:ss A')}
      </p>
      {allWeeks.map((weekKey) => {
        const [weekNum, year] = weekKey.split('-').map(Number);
        const weekStart = dayjs().year(year).isoWeek(weekNum).startOf('isoWeek'); // Monday
        const weekEnd = dayjs().year(year).isoWeek(weekNum).startOf('isoWeek').add(4, 'day'); // Friday
        const dateRange = `${weekStart.format('MMM D')} - ${weekEnd.format('MMM D, YYYY')}`;

        return (
          <div key={weekKey} className="space-y-8 mb-6">
            <EarningsWeek title={`${dateRange}`} weekData={weeks[weekKey]} weekStartDate={weekStart} />
          </div>
        );
      })}
    </div>
  );
};

export default Earnings;

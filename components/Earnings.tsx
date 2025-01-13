'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import EarningsWeek from '@/components/EarningsWeek';
import { WeekData } from '@/types/types';
import { SunIcon, MoonIcon, ClockIcon } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);

interface EarningsData {
  ticker: string;
  earnings_date: string;
  market_session: string | null;
  logo_url: string;
  isStarred?: boolean;
}

const Earnings: React.FC = () => {
  const [earnings, setEarnings] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLastWeek] = useState<boolean>(false);
  const { user } = useUser();
  const fetchEarnings = async () => {
    try {
      if (user) {
        const response = await fetch(`/api/earnings?user_id=${user.id}`);
        if (!response.ok) {
          throw new Error(`Error fetching earnings: ${response.statusText}`);
        }
        const data: EarningsData[] = await response.json();
        setEarnings(data);
        
        const starredTickers = data
          .filter(item => item.isStarred)
          .map(item => item.ticker);
        setFavorites(starredTickers);
        
      } else {
        const response = await fetch('/api/earnings');
        if (!response.ok) {
          throw new Error(`Error fetching fallback earnings: ${response.statusText}`);
        }
        const data: EarningsData[] = await response.json();
        setEarnings(data);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      setEarnings([]);
    } finally {
      setLoading(false);
    }
  };
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const toggleFavorite = async (ticker: string) => {
    if (user) {
      const isFavorite = favorites.includes(ticker);
      const method = isFavorite ? 'DELETE' : 'POST';
      try {
        const response = await fetch('/api/earnings', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, ticker }),
        });
        if (response.ok) {
          setFavorites((prev) =>
            isFavorite ? prev.filter((fav) => fav !== ticker) : [...prev, ticker]
          );
          await fetchEarnings();
        }
      } catch (error) {
        console.error('Error updating favorites:', error);
      }
    } else {
      setFavorites((prev) => {
        const newFavorites = prev.includes(ticker)
          ? prev.filter((fav) => fav !== ticker)
          : [...prev, ticker];
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        return newFavorites;
      });
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [user]);

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
      market_session: (item.market_session as "pre" | "after" | null) || null, logo_url: item.logo_url
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
      {allWeeks.slice(0, 2).map((weekKey) => {
        const [weekNum, year] = weekKey.split('-').map(Number);
        const weekStart = dayjs().year(year).isoWeek(weekNum).startOf('isoWeek'); // Monday
        const weekEnd = dayjs().year(year).isoWeek(weekNum).startOf('isoWeek').add(4, 'day'); // Friday
        const dateRange = `${weekStart.format('MMM D')} - ${weekEnd.format('D, YYYY')}`;

        return (
          <div key={weekKey} className="space-y-8 mb-6">
            <EarningsWeek 
              title={`${dateRange}`}
              weekData={weeks[weekKey]}
              weekStartDate={weekStart}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        );
      })}
      <div className="text-center text-sm text-gray-600">
        <div className="flex flex-col sm:flex-row items-center justify-center">
          <div className="flex items-center mb-1 sm:mb-0">
            <SunIcon className="h-4 w-4 text-yellow-500 mr-1" />
            <span>Premarket</span>
          </div>
          <span className="mx-4 hidden sm:inline">|</span>
          <div className="flex items-center mb-1 sm:mb-0">
            <MoonIcon className="h-4 w-4 text-blue-500 mr-1" />
            <span>Aftermarket</span>
          </div>
          <span className="mx-4 hidden sm:inline">|</span>
          <div className="flex items-center mb-1 sm:mb-0">
            <ClockIcon className="h-4 w-4 text-gray-500 mr-1" />
            <span>Time Not Supplied</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;

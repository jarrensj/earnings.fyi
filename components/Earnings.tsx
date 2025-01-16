'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
}

const Earnings: React.FC = () => {
  const [earnings, setEarnings] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { isLoaded, isSignedIn, user } = useUser();
  const [showLastWeek] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // At sign-in, ensure User record exists in Supabase, then GET their favorites.
  const ensureSupabaseUserAndFetchFavorites = useCallback(async () => {
    if (!user) return;
    
    try {
      
      // 1) Ensure user row exists
      const createResponse = await fetch('/api/users', {
        method: 'POST'
      });
      const createData = await createResponse.json();

      if (!createResponse.ok) {
        console.error('Error creating user:', createData.error);
        return;
      }

      // 2) Fetch favorites
      const getFavResponse = await fetch('/api/users', {
        method: 'GET'
      });
      const getFavData = await getFavResponse.json();

      if (getFavResponse.ok && getFavData.favorites) {
        setFavorites(getFavData.favorites);
      }
    } catch (error) {
      console.error('Error in ensureSupabaseUserAndFetchFavorites:', error);
    }
  }, [user]);

  // Show favorites for two scenarios: not signed in => localStorage, signed in => Supabase
  const toggleFavorite = async (ticker: string) => {
    // If user not signed in => local storage
    if (!isSignedIn) {
      setFavorites((prev) => {
        const newFavorites = prev.includes(ticker)
          ? prev.filter((t) => t !== ticker)
          : [...prev, ticker];
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        return newFavorites;
      });
    } else {
      // If signed in => update via Supabase
      // 1) Update local state optimistically
      const newFavorites = favorites.includes(ticker)
        ? favorites.filter((t) => t !== ticker)
        : [...favorites, ticker];
      
      setFavorites(newFavorites);

      // 2) Make the PUT request with complete favorites array
      try {
        const response = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ favorites: newFavorites })
        });

        if (!response.ok) {
          // If the request fails, revert the optimistic update
          setFavorites(favorites);
          console.error('Failed to update favorites');
        }
      } catch (error) {
        // If there's an error, revert the optimistic update
        setFavorites(favorites);
        console.error('Error updating favorites:', error);
      }
    }
  };

  // If user signs in, ensure user in Supabase & fetch favorites ===
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      ensureSupabaseUserAndFetchFavorites();
    }
  }, [isLoaded, isSignedIn, ensureSupabaseUserAndFetchFavorites]); // re-run if sign-in state changes


  useEffect(() => {
    const fetchEarnings = async () => {
      const response = await fetch('/api/earnings');
      const data: EarningsData[] = await response.json();
      setEarnings(data);
      setLoading(false);
    };

    fetchEarnings();
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
      <div className="text-center text-sm text-white">
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

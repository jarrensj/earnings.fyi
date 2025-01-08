'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from 'next/image';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MouseEvent as ReactMouseEvent } from 'react';


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

const TickerItem: React.FC<{
  ticker: string;
  isStarred: boolean;
  onStarClick: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  id: string;
}> = ({ ticker, isStarred, onStarClick, id }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center text-sm justify-between group cursor-move"
    >
      <div className="flex items-center">
        <Image
          src={`/company-logos/${ticker}.svg`}
          alt={`${ticker} logo`}
          width={20}
          height={20}
          className="mr-2"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className="font-medium">{ticker}</span>
      </div>
      <button
        onClick={onStarClick}
        className={`p-2 rounded-full transition-colors ${
          isStarred ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Star 
          size={18} 
          fill={isStarred ? 'currentColor' : 'none'} 
          stroke={isStarred ? '#FFD700' : 'currentColor'} 
          strokeWidth={2} 
        />
      </button>
    </li>
  );
};

const DaySection: React.FC<{ 
  entries: EarningEntry[]; 
  isPast: boolean;
  minHeight?: number;
}> = ({ entries, isPast, minHeight }) => {
  const [items, setItems] = useState<EarningEntry[]>(() => [...entries]);
  const [starredTickers, setStarredTickers] = useState<string[]>([]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex(item => item.ticker === active.id);
        const newIndex = currentItems.findIndex(item => item.ticker === over.id);

        const newItems = [...currentItems];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);

        try {
          const key = `sortOrder-${entries[0]?.market_session}-${dayjs().format('YYYY-MM-DD')}`;
          localStorage.setItem(key, JSON.stringify(newItems.map(item => item.ticker)));
        } catch (e) {
          console.error('Error storing sort order:', e);
        }

        return newItems;
      });
    }
  };

  // Load saved sort order on mount
  useEffect(() => {
    if (entries.length > 0) {
      try {
        const key = `sortOrder-${entries[0]?.market_session}-${dayjs().format('YYYY-MM-DD')}`;
        const savedOrder = localStorage.getItem(key);
        if (savedOrder) {
          const orderMap = JSON.parse(savedOrder);
          const sortedItems = [...entries].sort((a, b) => {
            const aIndex = orderMap.indexOf(a.ticker);
            const bIndex = orderMap.indexOf(b.ticker);
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          });
          setItems(sortedItems);
        } else {
          setItems(entries);
        }
      } catch (e) {
        console.error('Error loading sort order:', e);
        setItems(entries);
      }
    }
  }, [entries]);

  useEffect(() => {
    const stored = localStorage.getItem("starredTickers");
    if (typeof window !== "undefined" && stored) {
      try {
        setStarredTickers(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored tickers:', e);
        setStarredTickers([]);
      }
    }

    return () => {
      // Cleanup function
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("starredTickers", JSON.stringify(starredTickers));
    } catch (e) {
      console.error('Error storing tickers:', e);
    }
  }, [starredTickers]);

  const handleStarClick = (e: ReactMouseEvent<HTMLButtonElement>, ticker: string) => {
    e.stopPropagation();
    setStarredTickers(prev => 
      prev.includes(ticker) 
        ? prev.filter(t => t !== ticker)
        : [...prev, ticker]
    );
  };

  if (entries.length === 0) {
    return (
      <Card className={`h-full relative ${isPast ? 'bg-gray-100 text-gray-500' : ''}`} style={{ minHeight }}>
        <CardContent>
          <p className="text-sm text-gray-400">No earnings scheduled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`h-full relative ${isPast ? 'bg-gray-100 text-gray-500' : ''}`}
      style={{ minHeight }}
    >
      <CardContent>
        <DndContext 
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items.map(item => item.ticker)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {items.map((entry) => {
                const isStarred = starredTickers.includes(entry.ticker);
                
                return (
                  <TickerItem
                    key={entry.ticker}
                    id={entry.ticker}
                    ticker={entry.ticker}
                    isStarred={isStarred}
                    onStarClick={(e) => handleStarClick(e, entry.ticker)}
                  />
                );
              })}
            </ul>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
};

const EarningsWeek: React.FC<{ title: string; weekData: WeekData; weekStartDate: dayjs.Dayjs }> = ({ title, weekData, weekStartDate }) => {
  const today = dayjs();

  // Find maximum number of entries for sizing
  const maxPreMarketEntries = Math.max(
    ...Object.values(weekData).map(entries => 
      entries.filter(e => e.market_session === 'pre').length
    )
  );
  const maxAfterMarketEntries = Math.max(
    ...Object.values(weekData).map(entries => 
      entries.filter(e => e.market_session === 'after' || e.market_session === null).length
    )
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="relative flex">
        {/* Market Session Labels */}
        <div className="flex flex-col justify-start pt-24 pr-4 w-24">
          <p className="text-sm font-medium text-gray-500 h-[50%] flex items-start">Premarket</p>
          <p className="text-sm font-medium text-gray-500 h-[50%] flex items-start pt-4">Aftermarket</p>
        </div>

        <div className="flex-grow">
          {/* Days of Week Headers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {Object.entries(weekData).map(([day]) => (
              <Card key={day} className="bg-transparent shadow-none border-none">
                <CardHeader className="flex flex-col items-center p-0 space-y-1">
                  <CardTitle className="text-lg font-semibold">{day}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Pre-Market Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-2">
            {Object.entries(weekData).map(([day, entries], index) => {
              const isPast = weekStartDate.add(index, 'day').isBefore(today, 'day');
              const preMarketEntries = entries.filter(e => e.market_session === 'pre');
              
              return (
                <DaySection
                  key={`pre-${day}`}
                  entries={preMarketEntries}
                  isPast={isPast}
                  minHeight={maxPreMarketEntries * 40}
                />
              );
            })}
          </div>

          {/* Dividing Line */}
          <div className="relative py-2">
            <div className="w-full border-t border-gray-300"></div>
          </div>

          {/* After-Market Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-2">
            {Object.entries(weekData).map(([day, entries], index) => {
              const isPast = weekStartDate.add(index, 'day').isBefore(today, 'day');
              const afterMarketEntries = entries.filter(e => 
                e.market_session === 'after' || e.market_session === null
              );
              
              return (
                <DaySection
                  key={`after-${day}`}
                  entries={afterMarketEntries}
                  isPast={isPast}
                  minHeight={maxAfterMarketEntries * 40}
                />
              );
            })}
          </div>
        </div>
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
      try {
        const response = await fetch('/api/earnings');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: EarningsData[] = await response.json();
        setEarnings(data);
      } catch (error) {
        console.error('Error fetching earnings:', error);
      } finally {
        setLoading(false);
      }
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
      <div className="text-center text-sm text-gray-600">
       
      </div>
    </div>
  );
};

export default Earnings;

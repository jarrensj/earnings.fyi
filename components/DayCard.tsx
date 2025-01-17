import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { EarningEntry } from '@/types/types';
import { SunIcon, MoonIcon, ClockIcon } from "lucide-react";

interface DayCardProps {
  day: string;
  date: string;
  entries: EarningEntry[];
  favorites: string[];
  onToggleFavorite: (ticker: string) => void;
}

const DayCard: React.FC<DayCardProps> = ({ day, date, entries, favorites, onToggleFavorite }) => {
  const sessionOrder = ['pre', 'after', null];
  const sortedEntries = [...entries].sort((a, b) => {
    return sessionOrder.indexOf(a.market_session) - sessionOrder.indexOf(b.market_session);
  });

  return (
    <Card className="h-full relative shadow-lg hover:shadow-xl transition-shadow duration-300">
      <p className="absolute top-2 left-2 text-xs text-gray-400">{date}</p>
      <CardHeader className="pt-6">
        <CardTitle className="text-lg font-semibold text-white">{day}</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEntries.length > 0 ? (
          <ul className="space-y-2">
            {sortedEntries.map((entry, index) => (
              <li
                key={index}
                className="flex items-center justify-between text-sm text-white"
              >
                <div className="flex items-center">
                  <div className="flex flex-col items-left" style={{ width: '24px' }}>
                  {entry.market_session === 'pre' ? (
                      <SunIcon className={`h-4 w-4 ${'text-yellow-500'}`} />
                    ) : entry.market_session === 'after' ? (
                      <MoonIcon className={`h-4 w-4 ${'text-blue-500'}`} />
                    ) : (
                      <ClockIcon className={`h-4 w-4 ${'text-gray-500'}`} />
                    )}
                  </div>
                  {entry.logo_url && (
                    <img 
                      src={entry.logo_url} 
                      alt={`${entry.ticker} logo`} 
                      width={20}
                      height={20}
                      className="mr-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="font-medium">{entry.ticker}</span>
                </div>
                
                <button 
                  onClick={() => onToggleFavorite(entry.ticker)}
                  className="ml-2 focus:outline-none hover:text-yellow-500 transition-colors duration-200"
                >
                  <Star 
                    className={`h-4 w-4 ${
                      favorites.includes(entry.ticker) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-400'
                    }`}
                  />
                </button>
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

export default DayCard;

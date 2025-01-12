import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { EarningEntry } from '@/types/types';

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
        <CardTitle className="text-lg font-semibold text-gray-800">{day}</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEntries.length > 0 ? (
          <ul className="space-y-2">
            {sortedEntries.map((entry, index) => (
              <li
                key={index}
                className="flex items-center justify-between text-sm text-gray-700"
              >
                <div className="flex items-center">
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

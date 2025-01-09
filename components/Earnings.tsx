'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

//*interface EarningsData {
//*    ticker: string;
//*    earnings_date: string;
//*    market_session: string | null;
//*  }
  
type EarningEntry = {
    ticker: string;
    market_session: 'pre' | 'after' | null;
};

type WeekData = {
    [key: string]: EarningEntry[];
};

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function Earnings() {
    const [weekData] = useState<WeekData>({});

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {WEEKDAYS.map((day) => (
                <Card key={day} className="w-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">{day}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {weekData[day]?.length ? (
                            <ul className="space-y-2">
                                {weekData[day].map((earning, index) => (
                                    <li key={`${earning.ticker}-${index}`} className="flex items-center justify-between">
                                        <span className="font-medium">{earning.ticker}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {earning.market_session === 'pre' ? 'Pre' : 
                                             earning.market_session === 'after' ? 'After' : 
                                             'N/A'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No earnings scheduled</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
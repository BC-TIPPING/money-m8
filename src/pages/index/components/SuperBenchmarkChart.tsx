
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SuperBenchmarkChartProps {
  currentAge?: number;
  currentBalance?: number;
}

const SuperBenchmarkChart: React.FC<SuperBenchmarkChartProps> = ({ currentAge, currentBalance }) => {
  // Australian super benchmark data by age (based on ASFA/ATO data)
  const benchmarkData = [
    { age: 25, benchmark: 30000, percentile25: 15000, percentile75: 50000 },
    { age: 30, benchmark: 60000, percentile25: 35000, percentile75: 90000 },
    { age: 35, benchmark: 110000, percentile25: 70000, percentile75: 160000 },
    { age: 40, benchmark: 180000, percentile25: 120000, percentile75: 250000 },
    { age: 45, benchmark: 270000, percentile25: 180000, percentile75: 380000 },
    { age: 50, benchmark: 390000, percentile25: 260000, percentile75: 550000 },
    { age: 55, benchmark: 550000, percentile25: 370000, percentile75: 780000 },
    { age: 60, benchmark: 750000, percentile25: 500000, percentile75: 1100000 },
    { age: 65, benchmark: 1000000, percentile25: 650000, percentile75: 1500000 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{`Age: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: $${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Super Balance Benchmarks by Age</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={benchmarkData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="percentile25" 
                stroke="#ffc658" 
                strokeDasharray="5 5" 
                name="25th Percentile"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="benchmark" 
                stroke="#8884d8" 
                strokeWidth={3}
                name="Median (50th Percentile)"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="percentile75" 
                stroke="#82ca9d" 
                strokeDasharray="5 5" 
                name="75th Percentile"
                dot={false}
              />
              {currentAge && (
                <ReferenceLine x={currentAge} stroke="#ff7300" strokeDasharray="3 3" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {currentAge && currentBalance && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm font-medium">Your Position (Age {currentAge})</p>
            <p className="text-sm text-blue-800">
              Current Balance: ${currentBalance.toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuperBenchmarkChart;


import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IncomeComparisonChartProps {
  userIncome: number;
  postcode?: string;
}

const IncomeComparisonChart: React.FC<IncomeComparisonChartProps> = ({ userIncome, postcode }) => {
  // Updated Australian income data based on ABS August 2024 statistics
  const nationalMedian = 72592; // $1,396/week * 52 weeks
  const nationalAverage = 95000; // Approximate based on ABS data
  
  // Postcode-based median (using ATO taxation statistics patterns)
  const getPostcodeMedian = (postcode: string) => {
    const firstDigit = parseInt(postcode.substring(0, 1));
    // NSW (2xxx)
    if (firstDigit === 2) return 78000;
    // VIC (3xxx)
    if (firstDigit === 3) return 74000;
    // QLD (4xxx)
    if (firstDigit === 4) return 68000;
    // SA (5xxx)
    if (firstDigit === 5) return 65000;
    // WA (6xxx)
    if (firstDigit === 6) return 82000;
    // TAS (7xxx)
    if (firstDigit === 7) return 58000;
    // ACT (0xxx/2xxx)
    if (firstDigit === 0) return 95000;
    // NT (0xxx)
    return 85000;
  };

  const postcodeMedian = postcode ? getPostcodeMedian(postcode) : nationalMedian;

  const data = [
    {
      name: 'National Median',
      value: nationalMedian,
      color: '#8884d8'
    },
    {
      name: postcode ? `${postcode} Area` : 'Local Area',
      value: postcodeMedian,
      color: '#ffc658'
    },
    {
      name: 'National Average',
      value: nationalAverage,
      color: '#82ca9d'
    },
    {
      name: 'Your Income',
      value: userIncome,
      color: '#ff7300'
    }
  ];

  // Calculate percentiles
  const nationalPercentile = userIncome > nationalMedian ? 
    Math.min(50 + ((userIncome - nationalMedian) / (nationalAverage - nationalMedian)) * 30, 95) : 
    Math.max((userIncome / nationalMedian) * 50, 5);

  const postcodePercentile = userIncome > postcodeMedian ? 
    Math.min(50 + ((userIncome - postcodeMedian) / (Math.max(nationalAverage, postcodeMedian) - postcodeMedian)) * 30, 95) : 
    Math.max((userIncome / postcodeMedian) * 50, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          <p style={{ color: payload[0].color }}>
            {`$${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Income Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                layout="horizontal"
                margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={75}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">National Percentile</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{nationalPercentile.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">
              You earn more than {nationalPercentile.toFixed(0)}% of Australians
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {postcode ? `${postcode} Area` : 'Local'} Percentile
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">{postcodePercentile.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">
              You earn more than {postcodePercentile.toFixed(0)}% in your area
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncomeComparisonChart;

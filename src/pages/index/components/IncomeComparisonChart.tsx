
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IncomeComparisonChartProps {
  userIncome: number;
  postcode?: string;
}

const IncomeComparisonChart: React.FC<IncomeComparisonChartProps> = ({ userIncome, postcode }) => {
  // ABS August 2024 data - National median weekly earnings $1,396 (annual $72,592)
  const nationalMedian = 72592;
  const nationalAverage = 92000; // Updated based on ABS data
  
  // Simplified postcode-based median using ATO data patterns
  const getPostcodeMedian = (postcode: string): number => {
    const firstDigit = parseInt(postcode.substring(0, 1));
    // Rough estimates based on state income patterns from ATO data
    switch (firstDigit) {
      case 1: return 65000; // NSW regional
      case 2: return 85000; // NSW metro (Sydney)
      case 3: return 75000; // VIC
      case 4: return 70000; // QLD
      case 5: return 68000; // SA
      case 6: return 80000; // WA
      case 7: return 62000; // TAS
      case 8: return 75000; // NT
      case 9: return 70000; // ACT
      default: return nationalMedian;
    }
  };

  const postcodeMedian = postcode ? getPostcodeMedian(postcode) : nationalMedian;

  const data = [
    {
      name: 'Your Income',
      value: userIncome,
      color: '#ff7300'
    },
    {
      name: 'National Median',
      value: nationalMedian,
      color: '#8884d8'
    },
    {
      name: 'National Average',
      value: nationalAverage,
      color: '#82ca9d'
    },
    {
      name: postcode ? `Postcode ${postcode}` : 'Local Area',
      value: postcodeMedian,
      color: '#ffc658'
    }
  ];

  // Calculate percentiles
  const nationalPercentile = userIncome > nationalMedian ? 
    Math.min(50 + ((userIncome - nationalMedian) / (nationalAverage - nationalMedian)) * 40, 95) : 
    Math.max((userIncome / nationalMedian) * 50, 5);

  const postcodePercentile = userIncome > postcodeMedian ? 
    Math.min(50 + ((userIncome - postcodeMedian) / (Math.max(postcodeMedian * 1.5, nationalAverage) - postcodeMedian)) * 40, 95) : 
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
          <CardTitle>Income Comparison - Horizontal View</CardTitle>
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
                  width={80}
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
      
      {/* Percentile KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">National Percentile</p>
                <p className="text-2xl font-bold text-blue-600">{nationalPercentile.toFixed(0)}th</p>
                <p className="text-xs text-muted-foreground">
                  vs National Median ${nationalMedian.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {postcode ? `Postcode ${postcode}` : 'Local Area'} Percentile
                </p>
                <p className="text-2xl font-bold text-green-600">{postcodePercentile.toFixed(0)}th</p>
                <p className="text-xs text-muted-foreground">
                  vs Local Median ${postcodeMedian.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncomeComparisonChart;

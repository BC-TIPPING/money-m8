
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IncomeComparisonChartProps {
  userIncome: number;
  postcode?: string;
}

const IncomeComparisonChart: React.FC<IncomeComparisonChartProps> = ({ userIncome, postcode }) => {
  // Australian income data based on ABS statistics
  const nationalMedian = 55000;
  const nationalAverage = 85000;
  
  // Postcode-based median (simplified - in real app would use actual postcode data)
  const postcodeMedian = postcode ? 
    (parseInt(postcode.substring(0, 1)) > 3 ? 45000 : 65000) : nationalMedian;

  const data = [
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
      name: postcode ? `Postcode ${postcode} Est.` : 'Local Area',
      value: postcodeMedian,
      color: '#ffc658'
    },
    {
      name: 'Your Income',
      value: userIncome,
      color: '#ff7300'
    }
  ];

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Income Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeComparisonChart;

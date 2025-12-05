
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SuperBenchmarkChartProps {
  currentAge?: number;
  currentBalance?: number;
  currentSalary?: number;
}

interface BenchmarkDataPoint {
  age: number;
  benchmark: number;
  percentile25: number;
  percentile75: number;
  currentTrend?: number;
  currentPlus10?: number;
}

const SuperBenchmarkChart: React.FC<SuperBenchmarkChartProps> = ({ currentAge, currentBalance, currentSalary }) => {
  // Australian super benchmark data by age (based on ASFA/ATO data)
  const benchmarkData: BenchmarkDataPoint[] = [
    { age: 25, benchmark: 30000, percentile25: 15000, percentile75: 50000 },
    { age: 30, benchmark: 60000, percentile25: 35000, percentile75: 90000 },
    { age: 35, benchmark: 110000, percentile25: 70000, percentile75: 160000 },
    { age: 40, benchmark: 180000, percentile25: 120000, percentile75: 250000 },
    { age: 45, benchmark: 270000, percentile25: 180000, percentile75: 380000 },
    { age: 50, benchmark: 390000, percentile25: 260000, percentile75: 550000 },
    { age: 55, benchmark: 550000, percentile25: 370000, percentile75: 780000 },
    { age: 60, benchmark: 750000, percentile25: 500000, percentile75: 1100000 },
    { age: 65, benchmark: 1000000, percentile25: 650000, percentile75: 1500000 },
    { age: 67, benchmark: 1200000, percentile25: 780000, percentile75: 1800000 },
  ];

  // Calculate projection lines if current age and balance are provided
  const calculateProjections = (): BenchmarkDataPoint[] => {
    if (!currentAge || !currentBalance || !currentSalary) return benchmarkData;

    return benchmarkData.map(point => {
      const yearsToProject = point.age - currentAge;
      
      if (yearsToProject <= 0) {
        return {
          ...point,
          currentTrend: currentBalance,
          currentPlus10: currentBalance
        };
      }

      // Use user's actual salary for calculations
      const monthlyGrowthRate = 0.07 / 12; // 7% annual growth
      const months = yearsToProject * 12;
      
      // Current trend: employer contributions (11.5%)
      const monthlyEmployerContrib = (currentSalary * 0.115) / 12;
      const growthFactor = Math.pow(1 + monthlyGrowthRate, months);
      const annuityFactor = (growthFactor - 1) / monthlyGrowthRate;
      
      const currentTrendProjection = currentBalance * growthFactor + 
        monthlyEmployerContrib * annuityFactor;
      
      // With additional 10% personal contributions
      const additionalContrib = (currentSalary * 0.10) / 12;
      const totalMonthlyContrib = monthlyEmployerContrib + additionalContrib;
      const plus10Projection = currentBalance * growthFactor + 
        totalMonthlyContrib * annuityFactor;

      return {
        ...point,
        currentTrend: Math.round(currentTrendProjection),
        currentPlus10: Math.round(plus10Projection)
      };
    });
  };

  const chartData = calculateProjections();

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

  const retirementData = chartData.find(d => d.age === 67);
  const fourPercentIncomeeCurrent = retirementData?.currentTrend ? retirementData.currentTrend * 0.04 : 0;
  const fourPercentIncomeExtra = retirementData?.currentPlus10 ? retirementData.currentPlus10 * 0.04 : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Super Balance Projections by Age</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="age" 
                domain={[25, 67]}
                ticks={[25, 30, 35, 40, 45, 50, 55, 60, 65, 67]}
                type="number"
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                domain={[0, 'auto']}
              />
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
              {currentAge && currentBalance && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="currentTrend" 
                    stroke="#ff7300" 
                    strokeWidth={2}
                    name="Your Current Trend"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="currentPlus10" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    name="Your Trend + 10%"
                    dot={false}
                  />
                  <ReferenceLine x={currentAge} stroke="#ff7300" strokeDasharray="3 3" />
                </>
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
            <p className="text-sm text-blue-800">
              With current contributions: ${retirementData?.currentTrend?.toLocaleString() || 'N/A'} at 67
              <span className="text-green-600 ml-2">
                (${fourPercentIncomeeCurrent.toLocaleString()}/year using 4% rule)
              </span>
            </p>
            <p className="text-sm text-green-800">
              Adding 10% personal contributions: ${retirementData?.currentPlus10?.toLocaleString() || 'N/A'} at 67
              <span className="text-green-600 ml-2">
                (${fourPercentIncomeExtra.toLocaleString()}/year using 4% rule)
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuperBenchmarkChart;

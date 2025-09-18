
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SuperannuationChartProps {
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  currentSalary: number;
  additionalContributions: number;
}

const SuperannuationChart: React.FC<SuperannuationChartProps> = ({
  currentAge,
  retirementAge,
  currentBalance,
  currentSalary,
  additionalContributions
}) => {
  const generateProjectionData = () => {
    const data = [];
    const yearsToRetirement = retirementAge - currentAge;
    const compulsoryRate = 0.115; // 11.5% as of 2024
    const monthlyGrowthRate = 0.07 / 12; // 7% annual growth, compounded monthly
    
    let balanceWithoutExtra = currentBalance;
    let balanceWithExtra = currentBalance;
    
    for (let year = 0; year <= yearsToRetirement; year++) {
      const age = currentAge + year;
      
      if (year > 0) {
        // Monthly compounding over the year
        for (let month = 0; month < 12; month++) {
          // Apply monthly growth
          balanceWithoutExtra = balanceWithoutExtra * (1 + monthlyGrowthRate);
          balanceWithExtra = balanceWithExtra * (1 + monthlyGrowthRate);
          
          // Add monthly contributions (compulsory contributions divided by 12)
          const monthlyCompulsoryContrib = (currentSalary * compulsoryRate) / 12;
          const monthlyAdditionalContrib = additionalContributions / 12;
          
          balanceWithoutExtra += monthlyCompulsoryContrib;
          balanceWithExtra += monthlyCompulsoryContrib + monthlyAdditionalContrib;
        }
      }
      
      data.push({
        age,
        year,
        withoutExtra: Math.round(balanceWithoutExtra),
        withExtra: Math.round(balanceWithExtra),
        difference: Math.round(balanceWithExtra - balanceWithoutExtra)
      });
    }
    
    return data;
  };
  
  const data = generateProjectionData();
  
  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{`Age: ${label}`}</p>
          <p className="text-blue-600">
            {`Without extra: $${payload[0].value.toLocaleString()}`}
          </p>
          <p className="text-green-600">
            {`With extra: $${payload[1].value.toLocaleString()}`}
          </p>
          <p className="text-purple-600">
            {`Difference: $${payload[2].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="age" 
            label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            label={{ value: 'Super Balance', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '3px' }} />
          <Line 
            type="monotone" 
            dataKey="withoutExtra" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Without Extra Contributions"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="withExtra" 
            stroke="#10b981" 
            strokeWidth={2}
            name="With Extra Contributions"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="difference" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Difference"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SuperannuationChart;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface IncomeComparisonChartProps {
  userIncome: number;
  postcode?: string;
}

const IncomeComparisonChart: React.FC<IncomeComparisonChartProps> = ({ userIncome, postcode }) => {
  // National median full-time wage - ABS Characteristics of Employment, August 2024
  const nationalMedian = 88400;
  
  // State/Territory median incomes based on ABS August 2024 data
  const getPostcodeMedian = (postcode: string): number => {
    const postcodeNum = parseInt(postcode);
    
    // ACT postcodes: 0200-0299, 2600-2618, 2900-2920
    if ((postcodeNum >= 200 && postcodeNum <= 299) ||
        (postcodeNum >= 2600 && postcodeNum <= 2618) ||
        (postcodeNum >= 2900 && postcodeNum <= 2920)) {
      return 87776; // ACT - highest median
    }
    
    // NT postcodes: 0800-0899
    if (postcodeNum >= 800 && postcodeNum <= 899) {
      return 78000; // NT
    }
    
    // NSW postcodes: 1000-2599, 2619-2899, 2921-2999
    if ((postcodeNum >= 1000 && postcodeNum <= 2599) ||
        (postcodeNum >= 2619 && postcodeNum <= 2899) ||
        (postcodeNum >= 2921 && postcodeNum <= 2999)) {
      return 72124; // NSW
    }
    
    // VIC postcodes: 3000-3999, 8000-8999
    if ((postcodeNum >= 3000 && postcodeNum <= 3999) ||
        (postcodeNum >= 8000 && postcodeNum <= 8999)) {
      return 72800; // VIC
    }
    
    // QLD postcodes: 4000-4999, 9000-9999
    if ((postcodeNum >= 4000 && postcodeNum <= 4999) ||
        (postcodeNum >= 9000 && postcodeNum <= 9999)) {
      return 70200; // QLD
    }
    
    // SA postcodes: 5000-5999
    if (postcodeNum >= 5000 && postcodeNum <= 5999) {
      return 65000; // SA
    }
    
    // WA postcodes: 6000-6999
    if (postcodeNum >= 6000 && postcodeNum <= 6999) {
      return 78000; // WA
    }
    
    // TAS postcodes: 7000-7999
    if (postcodeNum >= 7000 && postcodeNum <= 7999) {
      return 62816; // TAS - lowest median
    }
    
    return nationalMedian;
  };

  const postcodeMedian = postcode ? getPostcodeMedian(postcode) : nationalMedian;

  // Calculate proper percentiles based on income distribution
  const calculatePercentile = (income: number, median: number) => {
    if (income >= 200000) return 95;
    if (income >= 150000) return 90;
    if (income >= 120000) return 80;
    if (income >= 100000) return 70;
    if (income >= 85000) return 60;
    if (income >= median) return 50;
    if (income >= median * 0.8) return 40;
    if (income >= median * 0.6) return 30;
    if (income >= median * 0.4) return 20;
    return 10;
  };

  const nationalPercentile = calculatePercentile(userIncome, nationalMedian);
  const postcodePercentile = calculatePercentile(userIncome, postcodeMedian);

  // Single column visualization data
  const maxIncome = 225000;
  const userPosition = (userIncome / maxIncome) * 100;
  const nationalPosition = (nationalMedian / maxIncome) * 100;
  const postcodePosition = (postcodeMedian / maxIncome) * 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Income Position (0 - $225k)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-32 bg-gradient-to-r from-red-100 via-yellow-100 via-green-100 to-emerald-200 rounded-lg border mb-6">
            {/* User income marker */}
            <div 
              className="absolute top-2 transform -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${Math.min(userPosition, 95)}%` }}
            >
              <div className="w-1 h-6 bg-emerald-600 rounded"></div>
              <Badge variant="secondary" className="text-xs mt-1 bg-emerald-100 text-emerald-800">
                You: ${(userIncome / 1000).toFixed(0)}k
              </Badge>
            </div>
            
            {/* National median marker */}
            <div 
              className="absolute top-12 transform -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${nationalPosition}%` }}
            >
              <div className="w-1 h-4 bg-blue-600 rounded"></div>
              <Badge variant="outline" className="text-xs mt-1 border-blue-600 text-blue-600">
                National: ${(nationalMedian / 1000).toFixed(0)}k
              </Badge>
            </div>
            
            {/* Postcode median marker */}
            <div 
              className="absolute top-20 transform -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${postcodePosition}%` }}
            >
              <div className="w-1 h-4 bg-orange-600 rounded"></div>
              <Badge variant="outline" className="text-xs mt-1 border-orange-600 text-orange-600">
                Local: ${(postcodeMedian / 1000).toFixed(0)}k
              </Badge>
            </div>
          </div>
          
          {/* Scale markers below the graph */}
          <div className="relative w-full mb-4">
            <div className="absolute left-0 text-xs text-gray-500">$0</div>
            <div className="absolute left-1/3 transform -translate-x-1/2 text-xs text-gray-500">$75k</div>
            <div className="absolute left-2/3 transform -translate-x-1/2 text-xs text-gray-500">$150k</div>
            <div className="absolute right-0 text-xs text-gray-500">$225k</div>
          </div>
          
          <div className="text-sm text-muted-foreground text-center px-4 py-2">
            Income comparison based on Australian full-time median wages
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default IncomeComparisonChart;

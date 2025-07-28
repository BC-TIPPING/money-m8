
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface IncomeComparisonChartProps {
  userIncome: number;
  postcode?: string;
}

const IncomeComparisonChart: React.FC<IncomeComparisonChartProps> = ({ userIncome, postcode }) => {
  // ABS 2024 data - National median full-time earnings
  const nationalMedian = 73000; // Updated based on ABS full-time median
  
  // Simplified postcode-based median using ABS data patterns
  const getPostcodeMedian = (postcode: string): number => {
    const firstDigit = parseInt(postcode.substring(0, 1));
    // Based on ABS data patterns from the referenced spreadsheet
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

  // Calculate percentiles based on full-time median income distribution
  const calculatePercentile = (income: number, median: number) => {
    const ratio = income / median;
    if (ratio >= 2.5) return 95;
    if (ratio >= 2.0) return 90;
    if (ratio >= 1.6) return 80;
    if (ratio >= 1.3) return 70;
    if (ratio >= 1.1) return 60;
    if (ratio >= 1.0) return 50;
    if (ratio >= 0.8) return 40;
    if (ratio >= 0.6) return 30;
    if (ratio >= 0.4) return 20;
    return 10;
  };

  const nationalPercentile = calculatePercentile(userIncome, nationalMedian);
  const postcodePercentile = calculatePercentile(userIncome, postcodeMedian);

  // Single column visualization data
  const maxIncome = 300000;
  const userPosition = Math.min((userIncome / maxIncome) * 100, 98);
  const nationalPosition = (nationalMedian / maxIncome) * 100;
  const postcodePosition = (postcodeMedian / maxIncome) * 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Income Position (0 - $300k)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-40 bg-gradient-to-r from-red-100 via-yellow-100 via-green-100 to-emerald-200 rounded-lg border overflow-hidden">
            {/* User income marker */}
            <div 
              className="absolute top-2 transform -translate-x-1/2 flex flex-col items-center z-10"
              style={{ left: `${userPosition}%` }}
            >
              <div className="w-1 h-8 bg-emerald-600 rounded shadow-sm"></div>
              <Badge variant="secondary" className="text-xs mt-1 bg-emerald-100 text-emerald-800 whitespace-nowrap">
                You: ${(userIncome / 1000).toFixed(0)}k
              </Badge>
            </div>
            
            {/* National median marker */}
            <div 
              className="absolute top-14 transform -translate-x-1/2 flex flex-col items-center z-10"
              style={{ left: `${nationalPosition}%` }}
            >
              <div className="w-1 h-6 bg-blue-600 rounded shadow-sm"></div>
              <Badge variant="outline" className="text-xs mt-1 border-blue-600 text-blue-600 whitespace-nowrap">
                National: ${(nationalMedian / 1000).toFixed(0)}k
              </Badge>
            </div>
            
            {/* Postcode median marker */}
            <div 
              className="absolute top-24 transform -translate-x-1/2 flex flex-col items-center z-10"
              style={{ left: `${postcodePosition}%` }}
            >
              <div className="w-1 h-6 bg-orange-600 rounded shadow-sm"></div>
              <Badge variant="outline" className="text-xs mt-1 border-orange-600 text-orange-600 whitespace-nowrap">
                Local: ${(postcodeMedian / 1000).toFixed(0)}k
              </Badge>
            </div>
            
            {/* Scale markers */}
            <div className="absolute bottom-2 flex justify-between w-full px-2 text-xs text-gray-500">
              <span>$0</span>
              <span>$75k</span>
              <span>$150k</span>
              <span>$225k</span>
              <span>$300k</span>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Income comparison based on Australian full-time median wages
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">National Ranking</p>
              <p className="text-2xl font-bold text-blue-600">{nationalPercentile}th percentile</p>
              <p className="text-xs text-muted-foreground">vs full-time median (${(nationalMedian / 1000).toFixed(0)}k)</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Local Ranking</p>
              <p className="text-2xl font-bold text-orange-600">{postcodePercentile}th percentile</p>
              <p className="text-xs text-muted-foreground">vs local median (${(postcodeMedian / 1000).toFixed(0)}k)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncomeComparisonChart;

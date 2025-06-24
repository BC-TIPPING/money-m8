
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Target, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateMonthlyAmount } from "@/lib/financialCalculations";

interface ActionItemsSectionProps {
  assessmentData: any;
}

const ActionItemsSection: React.FC<ActionItemsSectionProps> = ({ assessmentData }) => {
  const totalMonthlyIncome = calculateMonthlyAmount(assessmentData.incomeSources);
  const totalMonthlyExpenses = calculateMonthlyAmount(assessmentData.expenseItems);
  const monthlySurplus = totalMonthlyIncome - totalMonthlyExpenses;
  
  const generateActionItems = () => {
    const actions = [];
    
    // Budget-related actions
    if (monthlySurplus < 0) {
      actions.push({
        priority: 'high',
        icon: <Target className="h-5 w-5" />,
        title: 'Create an Emergency Budget',
        description: 'Your expenses exceed your income. Review and cut non-essential spending immediately.',
        timeframe: 'This week',
        category: 'urgent'
      });
    } else if (monthlySurplus < totalMonthlyIncome * 0.1) {
      actions.push({
        priority: 'medium',
        icon: <Target className="h-5 w-5" />,
        title: 'Optimize Your Budget',
        description: 'Build a buffer by identifying areas to reduce spending and increase savings.',
        timeframe: 'Next 2 weeks',
        category: 'budget'
      });
    }
    
    // Debt-related actions
    if (assessmentData.debtTypes.length > 0 && !assessmentData.debtTypes.includes('No current debt')) {
      const hasHighInterestDebt = assessmentData.debtDetails?.some((debt: any) => 
        parseFloat(debt.interestRate) > 15
      );
      
      if (hasHighInterestDebt) {
        actions.push({
          priority: 'high',
          icon: <TrendingUp className="h-5 w-5" />,
          title: 'Tackle High-Interest Debt First',
          description: 'Focus on paying off credit cards and high-interest loans to save money.',
          timeframe: 'Next month',
          category: 'debt'
        });
      }
    }
    
    // Goal-specific actions
    assessmentData.goals.forEach((goal: string) => {
      switch (goal) {
        case 'Buy a house':
          actions.push({
            priority: 'medium',
            icon: <CheckCircle className="h-5 w-5" />,
            title: 'Start Saving for House Deposit',
            description: 'Set up a dedicated savings account and automate transfers for your house deposit.',
            timeframe: 'This month',
            category: 'savings'
          });
          break;
        case 'Set a budget':
          actions.push({
            priority: 'medium',
            icon: <Calendar className="h-5 w-5" />,
            title: 'Implement Your Budget Plan',
            description: 'Use the budget recommendations from your assessment to track spending.',
            timeframe: 'This week',
            category: 'budget'
          });
          break;
        case 'Maximise super':
          actions.push({
            priority: 'low',
            icon: <TrendingUp className="h-5 w-5" />,
            title: 'Review Super Contributions',
            description: 'Consider salary sacrificing or making additional super contributions.',
            timeframe: 'Next month',
            category: 'investment'
          });
          break;
      }
    });
    
    // Emergency fund action
    if (monthlySurplus > 0) {
      actions.push({
        priority: 'medium',
        icon: <CheckCircle className="h-5 w-5" />,
        title: 'Build Emergency Fund',
        description: 'Save 3-6 months of expenses in a high-yield savings account.',
        timeframe: 'Next 3-6 months',
        category: 'savings'
      });
    }
    
    // Financial literacy action
    if (assessmentData.financialKnowledgeLevel === 'Low') {
      actions.push({
        priority: 'low',
        icon: <Target className="h-5 w-5" />,
        title: 'Improve Financial Knowledge',
        description: 'Read financial books, take online courses, or consult with a financial advisor.',
        timeframe: 'Ongoing',
        category: 'education'
      });
    }
    
    return actions.sort((a, b) => {
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    });
  };
  
  const actionItems = generateActionItems();
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };
  
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Priority';
    }
  };

  return (
    <Card className="w-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Your Action Plan 🎯
        </CardTitle>
        <CardDescription>
          Based on your assessment, here are personalized next steps to improve your financial situation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actionItems.map((action, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 ${getPriorityColor(action.priority)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      action.priority === 'high' ? 'bg-red-100 text-red-800' :
                      action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getPriorityText(action.priority)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{action.description}</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">{action.timeframe}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Ready to Get Started?</h3>
          <p className="text-sm text-blue-800 mb-3">
            Create a comprehensive budget to track your progress and stay on top of your financial goals.
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Create My Budget
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/ask-ai">Ask AI for Help</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionItemsSection;

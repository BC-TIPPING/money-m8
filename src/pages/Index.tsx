import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles } from "lucide-react";
import { AssessmentStepper } from './AssessmentStepper';
import { AssessmentSummary } from './AssessmentSummary';
import { FullFinancialHealthCheck } from './FullFinancialHealthCheck';
import { SaveResultsModal } from './SaveResultsModal';
import { questions, useAssessmentState } from './assessmentHooks';
import { useAssessmentData } from './hooks/useAssessmentData';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

const SkipToSummaryButton = ({ isVisible, onClick }: { isVisible: boolean, onClick: () => void }) => {
  if (!isVisible) return null;
  return (
    <Button variant="secondary" onClick={onClick}>
      Skip to Summary
    </Button>
  );
};

const EditAssessmentButton = ({ onClick, disabled }: { onClick: () => void, disabled?: boolean }) => (
  <Button variant="outline" onClick={onClick} disabled={disabled}>
    Edit Assessment
  </Button>
);

const IndexPage: React.FC = () => {
  const assessment = useAssessmentState();
  const { toast } = useToast();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const assessmentData = useAssessmentData(assessment);

  useEffect(() => {
    const handleGoalSelectEvent = (event: CustomEvent) => {
      setSelectedGoal(event.detail);
    };

    window.addEventListener('selectGoal', handleGoalSelectEvent);

    return () => {
      window.removeEventListener('selectGoal', handleGoalSelectEvent);
    };
  }, []);

  useEffect(() => {
    if (selectedGoal) {
      handleGoalSelect(selectedGoal);
      setSelectedGoal(null);
    }
  }, [selectedGoal]);

  const handleGoalSelect = (goal: string) => {
    if (goal === 'Full Financial Health Check') {
      assessment.setGoals(['Full Financial Health Check']);
      assessment.setStep(questions.length);
      assessment.setShowAssessment(true);
    } else {
      assessment.setGoals([goal]);
      assessment.setStep(questions.length);
      assessment.setShowAssessment(true);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Achieve Your Financial Goals
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Answer a few simple questions to get personalized recommendations.
        </p>
      </div>

      {/* Goal Selection */}
      {!assessment.showAssessment && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>What do you want to achieve?</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button variant="outline" onClick={() => handleGoalSelect('Set a budget')}>
              Set a Budget
            </Button>
            <Link to="/maximise-super">
              <Button variant="outline">Maximise Super</Button>
            </Link>
            <Link to="/pay-off-home-loan">
              <Button variant="outline">Pay off Home Loan</Button>
            </Link>
            <Button variant="outline" onClick={() => handleGoalSelect('Grow investments')}>
              Grow Investments
            </Button>
            <Button variant="outline" onClick={() => handleGoalSelect('Full Financial Health Check')}>
              Full Financial Health Check
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Assessment or Results */}
      {assessment.showAssessment && (
        <div className="space-y-6">
          {assessment.step < questions.length && (
            <>
              <SkipToSummaryButton 
                isVisible={assessmentData.hasCompletedAssessment}
                onClick={() => {
                  assessment.setStep(questions.length);
                  toast({ 
                    title: "Assessment Skipped", 
                    description: "Since you've completed the assessment before, we've taken you directly to the results." 
                  });
                }}
              />
              
              <AssessmentStepper 
                currentStep={assessment.step}
                totalSteps={questions.length}
                hasRegularIncome={assessment.hasRegularIncome}
                setHasRegularIncome={assessment.setHasRegularIncome}
                incomeSources={assessment.incomeSources}
                setIncomeSources={assessment.setIncomeSources}
                expenseItems={assessment.expenseItems}
                setExpenseItems={assessment.setExpenseItems}
                investmentExperience={assessment.investmentExperience}
                setInvestmentExperience={assessment.setInvestmentExperience}
                goals={assessment.goals}
                setGoals={assessment.setGoals}
                otherGoal={assessment.otherGoal}
                setOtherGoal={assessment.setOtherGoal}
                debtTypes={assessment.debtTypes}
                setDebtTypes={assessment.setDebtTypes}
                postcode={assessment.postcode}
                setPostcode={assessment.setPostcode}
                age={assessment.age}
                setAge={assessment.setAge}
                superBalance={assessment.superBalance}
                setSuperBalance={assessment.setSuperBalance}
                insurances={assessment.insurances}
                setInsurances={assessment.setInsurances}
                debtDetails={assessment.debtDetails}
                setDebtDetails={assessment.setDebtDetails}
                assets={assessment.assets}
                setAssets={assessment.setAssets}
                onNext={() => assessment.setStep(assessment.step + 1)}
                onPrevious={() => assessment.setStep(assessment.step - 1)}
                onFinish={() => {
                  assessment.setStep(questions.length);
                  toast({ 
                    title: "Assessment Complete!", 
                    description: "Your personalized financial recommendations are ready." 
                  });
                }}
              />
            </>
          )}
          
          {assessment.step >= questions.length && (
            <>
              <EditAssessmentButton 
                onClick={() => assessment.setStep(0)}
                disabled={assessmentData.isGeneratingSummary}
              />
              
              <AssessmentSummary 
                goals={assessment.goals}
                hasRegularIncome={assessment.hasRegularIncome}
                incomeSources={assessment.incomeSources}
                expenseItems={assessment.expenseItems}
                investmentExperience={assessment.investmentExperience}
                debtTypes={assessment.debtTypes}
                debtDetails={assessment.debtDetails}
                postcode={assessment.postcode}
                age={assessment.age}
                superBalance={assessment.superBalance}
                insurances={assessment.insurances}
                assets={assessment.assets}
                onGenerateSummary={assessmentData.generateSummary}
                aiSummary={assessmentData.aiSummary}
                chartData={assessmentData.chartData}
                isGeneratingSummary={assessmentData.isGeneratingSummary}
                onChangeGoal={assessmentData.handleChangeGoal}
                onSetBudgetGoal={assessmentData.handleSetBudgetGoal}
                updateHomeLoanExtraRepayment={assessmentData.updateHomeLoanExtraRepayment}
                isUpdatingRepayment={assessmentData.isUpdatingRepayment}
              />
              
              {assessment.goals.includes('Full Financial Health Check') && (
                <FullFinancialHealthCheck
                  age={assessment.age}
                  postcode={assessment.postcode}
                  superBalance={assessment.superBalance}
                  insurances={assessment.insurances}
                  assets={assessment.assets}
                  debtTypes={assessment.debtTypes}
                  debtDetails={assessment.debtDetails}
                  incomeSources={assessment.incomeSources}
                  expenseItems={assessment.expenseItems}
                  goals={assessment.goals}
                  isAssessmentComplete={true}
                />
              )}
              
              {assessmentData.aiSummary && (
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      AI-Generated Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold text-gray-900 mb-3" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-gray-800 mb-2 mt-4" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-base font-medium text-gray-700 mb-2 mt-3" {...props} />,
                          p: ({node, ...props}) => <p className="text-gray-600 mb-3 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-3 text-gray-600" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-3 text-gray-600" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-gray-800" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                          code: ({node, ...props}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-700 my-4" {...props} />
                        }}
                      >
                        {assessmentData.aiSummary}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      <SaveResultsModal />
    </div>
  );
};

export default IndexPage;

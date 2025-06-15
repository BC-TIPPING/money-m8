
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { type Database } from "@/integrations/supabase/types";
import { PRELOADED_EXPENSE_CATEGORIES, questions, useAssessmentState } from "../assessmentHooks";
import { useFetchAssessment, useSaveAssessment, useGenerateSummary, useUpdateHomeLoanRepayment } from './useAssessmentApi';
import { useAuth } from "@/contexts/AuthContext";

type AssessmentInsert = Database['public']['Tables']['assessments']['Insert'];
type AssessmentState = ReturnType<typeof useAssessmentState>;

export function useAssessmentData(assessment: AssessmentState) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any | null>(null);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  const { data: existingAssessment, isLoading: isLoadingAssessment, isSuccess: isFetchSuccess } = useFetchAssessment(user?.id ?? null);

  const assessmentData: AssessmentInsert | null = useMemo(() => {
    if (!user) {
      return null;
    }
    return {
      user_id: user.id,
      employment_status: assessment.employmentStatus,
      has_regular_income: assessment.hasRegularIncome,
      income_sources: assessment.incomeSources,
      expense_items: assessment.expenseItems,
      financial_knowledge_level: assessment.financialKnowledgeLevel,
      investment_experience: assessment.investmentExperience,
      goals: assessment.goals,
      other_goal: assessment.otherGoal,
      goal_timeframe: assessment.goalTimeframe,
      debt_types: assessment.debtTypes,
      debt_details: assessment.debtDetails,
      debt_management_confidence: assessment.debtManagementConfidence,
      free_text_comments: assessment.freeTextComments,
    };
  }, [
    user,
    assessment.employmentStatus,
    assessment.hasRegularIncome,
    assessment.incomeSources,
    assessment.expenseItems,
    assessment.financialKnowledgeLevel,
    assessment.investmentExperience,
    assessment.goals,
    assessment.otherGoal,
    assessment.goalTimeframe,
    assessment.debtTypes,
    assessment.debtDetails,
    assessment.debtManagementConfidence,
    assessment.freeTextComments,
  ]);

  const { mutate: saveAssessment, isPending: isSaving } = useSaveAssessment((data) => {
    setIsSubmitted(true);
    if (data && data.length > 0) {
        setAssessmentId(data[0].id);
    }
  });

  const { mutate: updateHomeLoanExtraRepayment, isPending: isUpdatingRepayment } = useUpdateHomeLoanRepayment();
  
  const { mutate: generateSummaryMutation, isPending: isGeneratingSummary } = useGenerateSummary((data) => {
    setAiSummary(data.summary);
    setChartData(data.chartData);
  });

  const isComplete = assessment.step >= questions.length;

  useEffect(() => {
    if (isComplete && !isSubmitted && !isSaving && assessmentData) {
      saveAssessment(assessmentData);
    }
  }, [isComplete, isSubmitted, isSaving, saveAssessment, assessmentData]);

  useEffect(() => {
    if (isFetchSuccess && user) {
        if (existingAssessment) {
            const typedAssessment = existingAssessment;
            setAssessmentId(typedAssessment.id);
            assessment.setEmploymentStatus(typedAssessment.employment_status ?? undefined);
            assessment.setHasRegularIncome(typedAssessment.has_regular_income ?? undefined);
            assessment.setIncomeSources((typedAssessment.income_sources as any) || [{ category: "", amount: "", frequency: "Monthly" }]);
            
            const oldExpenseItems = (typedAssessment.expense_items as any[]) || [];
            const preservedData = new Map(oldExpenseItems.map(item => [item.category, item]));

            const newExpenseItems = PRELOADED_EXPENSE_CATEGORIES.map(category => {
                const oldItem = preservedData.get(category);
                return {
                    category,
                    amount: oldItem?.amount || '',
                    frequency: oldItem?.frequency || 'Monthly',
                };
            });
            assessment.setExpenseItems(newExpenseItems);
            
            assessment.setFinancialKnowledgeLevel(typedAssessment.financial_knowledge_level ?? undefined);
            assessment.setInvestmentExperience(typedAssessment.investment_experience ?? []);
            assessment.setOtherGoal(typedAssessment.other_goal ?? "");
            assessment.setGoalTimeframe(typedAssessment.goal_timeframe ?? undefined);
            assessment.setDebtTypes(typedAssessment.debt_types ?? []);
            assessment.setDebtDetails((typedAssessment.debt_details as any) || []);
            assessment.setDebtManagementConfidence(typedAssessment.debt_management_confidence ?? undefined);
            assessment.setFreeTextComments(typedAssessment.free_text_comments ?? "");

            toast({ title: "Welcome back!", description: "We've pre-filled your previous assessment data." });
            setIsPreloaded(true);
            assessment.setShowAssessment(true);
        }
    }
  }, [isFetchSuccess, user, existingAssessment, assessment, toast]);

  const handleStartOver = () => {
    assessment.setStep(0);
    assessment.setEmploymentStatus(undefined);
    assessment.setHasRegularIncome(undefined);
    assessment.setIncomeSources([{ category: "", amount: "", frequency: "Monthly" }]);
    assessment.setExpenseItems(PRELOADED_EXPENSE_CATEGORIES.map((c) => ({ category: c, amount: "", frequency: "Monthly" })));
    assessment.setFinancialKnowledgeLevel(undefined);
    assessment.setInvestmentExperience([]);
    assessment.setGoals([]);
    assessment.setOtherGoal("");
    assessment.setGoalTimeframe(undefined);
    assessment.setDebtTypes([]);
    assessment.setDebtDetails([]);
    assessment.setDebtManagementConfidence(undefined);
    assessment.setFreeTextComments("");
    assessment.setShowAssessment(false);

    setIsSubmitted(false);
    setAiSummary(null);
    setChartData(null);
    setAssessmentId(null);
    setIsPreloaded(false);
  };

  const handleChangeGoal = () => {
    setAiSummary(null);
    setChartData(null);
    setIsSubmitted(false);
    assessment.setStep(0);
    assessment.setShowAssessment(false);
  };

  const generateSummary = ({ personality = 'default' }: { personality?: string } = {}) => {
    if (assessmentData) {
      generateSummaryMutation({ assessmentData, personality });
    }
  };

  return {
    aiSummary,
    chartData,
    isPreloaded,
    isLoadingAssessment,
    isGeneratingSummary,
    isComplete,
    generateSummary,
    handleStartOver,
    handleChangeGoal,
    assessmentId,
    updateHomeLoanExtraRepayment,
    isUpdatingRepayment,
  };
}

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
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  // Only fetch assessment if user is logged in
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

  // Track if assessment has been completed
  useEffect(() => {
    if (isComplete) {
      setHasCompletedAssessment(true);
    }
  }, [isComplete]);

  // Only auto-save for logged-in users
  useEffect(() => {
    if (isComplete && !isSubmitted && !isSaving && assessmentData && user) {
      saveAssessment(assessmentData);
    }
  }, [isComplete, isSubmitted, isSaving, saveAssessment, assessmentData, user]);

  // Only load existing assessment for logged-in users
  useEffect(() => {
    if (isFetchSuccess && user && existingAssessment) {
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
        assessment.setDebtTypes(typedAssessment.debt_types ?? []);
        // Health check fields
        assessment.setPostcode(typedAssessment.postcode ?? "");
        assessment.setAge(typedAssessment.age ?? undefined);
        assessment.setSuperBalance(typedAssessment.super_balance ?? undefined);
        assessment.setSuperFund(typedAssessment.super_fund ?? "");
        assessment.setMortgageRate(typedAssessment.mortgage_rate ?? undefined);
        assessment.setInsurances((typedAssessment.insurances as string[]) ?? []);
        assessment.setAssets((typedAssessment.assets as any) ?? []);
        assessment.setDebtDetails((typedAssessment.debt_details as any) || []);
        assessment.setDebtManagementConfidence(typedAssessment.debt_management_confidence ?? undefined);
        assessment.setFreeTextComments(typedAssessment.free_text_comments ?? "");

        toast({ title: "Welcome back!", description: "We've pre-filled your previous assessment data." });
        setIsPreloaded(true);
        setHasCompletedAssessment(true);
        assessment.setShowAssessment(true);
    }
  }, [isFetchSuccess, user, existingAssessment, toast]);

  const handleStartOver = () => {
    // If assessment was completed, go directly to summary (skip to end)
    if (hasCompletedAssessment) {
      assessment.setStep(questions.length);
      assessment.setShowAssessment(true);
      toast({ 
        title: "Assessment Skipped", 
        description: "Since you've completed the assessment before, we've taken you directly to the results." 
      });
      return;
    }

    // Otherwise, do a full reset
    assessment.setStep(0);
    assessment.setEmploymentStatus(undefined);
    assessment.setHasRegularIncome(undefined);
    assessment.setIncomeSources([{ category: "", amount: "", frequency: "Monthly" }]);
    assessment.setExpenseItems(PRELOADED_EXPENSE_CATEGORIES.map((c) => ({ category: c, amount: "", frequency: "Monthly" })));
    assessment.setFinancialKnowledgeLevel(undefined);
    assessment.setInvestmentExperience([]);
    assessment.setGoals([]);
    assessment.setOtherGoal("");
    assessment.setDebtTypes([]);
    // Reset health check fields
    assessment.setPostcode("");
    assessment.setAge(undefined);
    assessment.setSuperBalance(undefined);
    assessment.setSuperFund("");
    assessment.setMortgageRate(undefined);
    assessment.setInsurances([]);
    assessment.setAssets([]);
    assessment.setDebtDetails([]);
    assessment.setDebtManagementConfidence(undefined);
    assessment.setFreeTextComments("");
    assessment.setShowAssessment(false);

    setIsSubmitted(false);
    setAiSummary(null);
    setChartData(null);
    setAssessmentId(null);
    setIsPreloaded(false);
    setHasCompletedAssessment(false);
  };

  const handleChangeGoal = () => {
    // Reset AI summary for new goal
    setAiSummary(null);
    setChartData(null);
    setIsSubmitted(false);
    assessment.setGoals([]);
    assessment.setStep(0);
    assessment.setShowAssessment(false);
    
    toast({ 
      title: "Goal Changed", 
      description: "Select your new goal. Your assessment data will be preserved." 
    });
  };

  const handleSetBudgetGoal = () => {
    if (!assessment.goals.includes('Set a budget')) {
      const newGoals = [...assessment.goals, 'Set a budget'];
      assessment.setGoals(newGoals);
      
      // If we have assessment data, regenerate summary
      if (hasCompletedAssessment) {
        generateSummary({});
      }
      
      toast({ 
        title: "Budget Goal Added", 
        description: "We've added 'Set a budget' to your goals and updated your recommendations." 
      });
    }
  };

  // For anonymous users, create a temporary assessment data object for AI generation
  const generateSummary = ({ personality = 'default' }: { personality?: string } = {}) => {
    const dataForSummary = assessmentData || {
      user_id: 'anonymous',
      employment_status: assessment.employmentStatus,
      has_regular_income: assessment.hasRegularIncome,
      income_sources: assessment.incomeSources,
      expense_items: assessment.expenseItems,
      financial_knowledge_level: assessment.financialKnowledgeLevel,
      investment_experience: assessment.investmentExperience,
      goals: assessment.goals,
      other_goal: assessment.otherGoal,
      debt_types: assessment.debtTypes,
      // Health check fields
      postcode: assessment.postcode || null,
      age: assessment.age || null,
      super_balance: assessment.superBalance || null,
      super_fund: assessment.superFund || null,
      mortgage_rate: assessment.mortgageRate || null,
      insurances: assessment.insurances || null,
      assets: assessment.assets || null,
      debt_details: assessment.debtDetails,
      debt_management_confidence: assessment.debtManagementConfidence,
      free_text_comments: assessment.freeTextComments,
    };
    
    generateSummaryMutation({ assessmentData: dataForSummary, personality });
  };

  return {
    aiSummary,
    chartData,
    isPreloaded,
    isLoadingAssessment: user ? isLoadingAssessment : false,
    isGeneratingSummary,
    isComplete,
    generateSummary,
    handleStartOver,
    handleChangeGoal,
    handleSetBudgetGoal,
    assessmentId,
    updateHomeLoanExtraRepayment,
    isUpdatingRepayment,
    hasCompletedAssessment,
  };
}

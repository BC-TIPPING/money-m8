import LandingSection from "./index/LandingSection";
import AssessmentStepper from "./index/AssessmentStepper";
import { useAssessmentState, questions, PRELOADED_EXPENSE_CATEGORIES } from "./index/assessmentHooks";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { type Database } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type AssessmentInsert = Database['public']['Tables']['assessments']['Insert'];

export default function Index() {
  const assessment = useAssessmentState();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [usernameToFetch, setUsernameToFetch] = useState<string | null>(null);

  const { data: existingAssessment, isLoading: isLoadingAssessment, isSuccess: isFetchSuccess } = useQuery({
    queryKey: ['assessment', usernameToFetch],
    queryFn: async () => {
      if (!usernameToFetch) return null;
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('username', usernameToFetch)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        toast({ title: "Error fetching assessment", description: error.message, variant: 'destructive' });
        return null;
      }
      return data;
    },
    enabled: !!usernameToFetch,
    retry: false,
  });

  const isComplete = assessment.step >= questions.length;

  const assessmentData: AssessmentInsert = {
    username,
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

  const { mutate: saveAssessment, isPending: isSaving } = useMutation({
    mutationFn: async (assessmentData: AssessmentInsert) => {
      const { data, error } = await supabase
        .from('assessments')
        .insert([assessmentData])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
        setIsSubmitted(true);
        toast({ title: "Success", description: "Your assessment has been saved successfully!" });
    },
    onError: (error) => {
        toast({ title: "Error saving assessment", description: error.message, variant: 'destructive' });
    }
  });

  const { mutate: generateSummary, isPending: isGeneratingSummary } = useMutation({
    mutationFn: async (assessmentData: AssessmentInsert) => {
      const { data, error } = await supabase.functions.invoke('generate-financial-summary', {
        body: { assessmentData },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.summary;
    },
    onSuccess: (data) => {
      setAiSummary(data);
      toast({ title: "Summary Generated!", description: "Your personalized summary is ready." });
    },
    onError: (error) => {
        toast({ title: "Error generating summary", description: error.message, variant: 'destructive' });
    }
  });

  useEffect(() => {
    if (isComplete && !isSubmitted && !isSaving && username) {
      saveAssessment(assessmentData);
    }
  }, [isComplete, isSubmitted, isSaving, saveAssessment, assessmentData, username]);

  useEffect(() => {
    if (isFetchSuccess && usernameToFetch) {
        if (existingAssessment) {
            const typedAssessment = existingAssessment;
            assessment.setEmploymentStatus(typedAssessment.employment_status ?? undefined);
            assessment.setHasRegularIncome(typedAssessment.has_regular_income ?? undefined);
            assessment.setIncomeSources((typedAssessment.income_sources as any) || [{ category: "", amount: "", frequency: "Monthly" }]);
            assessment.setExpenseItems((typedAssessment.expense_items as any) || PRELOADED_EXPENSE_CATEGORIES.map((c) => ({ category: c, amount: "", frequency: "Weekly" })));
            assessment.setFinancialKnowledgeLevel(typedAssessment.financial_knowledge_level ?? undefined);
            assessment.setInvestmentExperience(typedAssessment.investment_experience ?? []);
            assessment.setOtherGoal(typedAssessment.other_goal ?? "");
            assessment.setGoalTimeframe(typedAssessment.goal_timeframe ?? undefined);
            assessment.setDebtTypes(typedAssessment.debt_types ?? []);
            assessment.setDebtDetails((typedAssessment.debt_details as any) || []);
            assessment.setDebtManagementConfidence(typedAssessment.debt_management_confidence ?? undefined);
            assessment.setFreeTextComments(typedAssessment.free_text_comments ?? "");

            toast({ title: "Welcome back!", description: "We've pre-filled your previous assessment data." });
        }
        setUsername(usernameToFetch);
        assessment.setShowAssessment(true);
        setUsernameToFetch(null);
    }
  }, [isFetchSuccess, usernameToFetch, existingAssessment, assessment, toast]);

  const handleStartAssessment = (goal: string, newUsername: string) => {
    assessment.setGoals([goal]);
    setUsernameToFetch(newUsername);
  };
  
  if (!assessment.showAssessment) {
    return (
      <div className="relative min-h-screen">
        <LandingSection onStartAssessment={handleStartAssessment} isLoading={isLoadingAssessment} />
        <div className="absolute bottom-4 right-4">
            <Button asChild variant="outline">
                <Link to="/ask-ai">Ask our AI</Link>
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
        <AssessmentStepper 
          {...assessment} 
          generateSummary={() => generateSummary(assessmentData)}
          isGeneratingSummary={isGeneratingSummary}
          aiSummary={aiSummary}
        />
    </div>
  );
}


import LandingSection from "./index/LandingSection";
import AssessmentStepper from "./index/AssessmentStepper";
import { useAssessmentState, questions } from "./index/assessmentHooks";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { type Database } from "@/integrations/supabase/types";

type AssessmentInsert = Database['public']['Tables']['assessments']['Insert'];

export default function Index() {
  const assessment = useAssessmentState();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isComplete = assessment.step >= questions.length;

  const { mutate: saveAssessment, isPending: isSaving } = useMutation({
    mutationFn: async (assessmentData: Omit<AssessmentInsert, 'user_id' | 'id' | 'created_at'>) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('assessments')
        .insert([{ ...assessmentData, user_id: user.id }])
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

  useEffect(() => {
    if (isComplete && !isSubmitted && !isSaving) {
      const dbData: Omit<AssessmentInsert, 'user_id' | 'id' | 'created_at'> = {
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
      saveAssessment(dbData);
    }
  }, [isComplete, isSubmitted, isSaving, saveAssessment, assessment, user]);


  const handleStartAssessment = (goal: string) => {
    assessment.setGoals([goal]);
    assessment.setShowAssessment(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  if (!assessment.showAssessment) {
    return (
      <div className="relative min-h-screen">
        <Button onClick={handleLogout} variant="ghost" className="absolute top-4 right-4 z-10">Logout</Button>
        <LandingSection onStartAssessment={handleStartAssessment} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
        <Button onClick={handleLogout} variant="ghost" className="absolute top-4 right-4 z-10">Logout</Button>
        <AssessmentStepper {...assessment} />
    </div>
  );
}

import LandingSection from "./index/LandingSection";
import AssessmentStepper from "./index/AssessmentStepper";
import { useAssessmentState, questions } from "./index/assessmentHooks";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
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


  const handleStartAssessment = (goal: string, newUsername: string) => {
    assessment.setGoals([goal]);
    setUsername(newUsername);
    assessment.setShowAssessment(true);
  };
  
  if (!assessment.showAssessment) {
    return (
      <div className="relative min-h-screen">
        <LandingSection onStartAssessment={handleStartAssessment} />
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

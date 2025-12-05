
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { type Database } from "@/integrations/supabase/types";

type AssessmentInsert = Database['public']['Tables']['assessments']['Insert'];

export function useFetchAssessment(userId: string | null) {
  const { toast } = useToast();
  return useQuery({
    queryKey: ['assessment', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        toast({ title: "Error fetching assessment", description: error.message, variant: 'destructive' });
        return null;
      }
      return data;
    },
    enabled: !!userId,
    retry: false,
  });
}

export function useSaveAssessment(onSuccessCallback: (data: any) => void) {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (assessmentData: AssessmentInsert) => {
      const { data, error } = await supabase
        .from('assessments')
        .insert([assessmentData])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
        onSuccessCallback(data);
    },
    onError: (error) => {
        toast({ title: "Error saving assessment", description: error.message, variant: 'destructive' });
    }
  });
}

export function useUpdateAssessment(onSuccessCallback: (data: any) => void) {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, data: assessmentData }: { id: string; data: AssessmentInsert }) => {
      const { data, error } = await supabase
        .from('assessments')
        .update(assessmentData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      onSuccessCallback(data);
      toast({ title: "Assessment Updated", description: "Your assessment has been saved." });
    },
    onError: (error) => {
      toast({ title: "Error updating assessment", description: error.message, variant: 'destructive' });
    }
  });
}

export function useUpdateHomeLoanRepayment() {
    const { toast } = useToast();
    return useMutation({
        mutationFn: async ({ id, amount }: { id: string, amount: number | null }) => {
            const { data, error } = await supabase
                .from('assessments')
                .update({ home_loan_extra_repayment: amount })
                .eq('id', id)
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Extra repayment amount has been updated!" });
        },
        onError: (error) => {
            toast({ title: "Error updating", description: error.message, variant: 'destructive' });
        }
    });
}

export function useGenerateSummary(onSuccessCallback: (data: any) => void) {
    const { toast } = useToast();
    return useMutation({
        mutationFn: async ({ assessmentData, personality = 'default' }: { assessmentData: AssessmentInsert, personality?: string }) => {
            const { data, error } = await supabase.functions.invoke('generate-financial-summary', {
                body: { assessmentData, personality },
            });

            if (error) {
                throw new Error(error.message);
            }
            
            if (data.error) {
                throw new Error(data.error);
            }

            return data;
        },
        onSuccess: (data) => {
            onSuccessCallback(data);
            toast({ title: "Summary Generated!", description: "Your personalized summary is ready." });
        },
        onError: (error) => {
            toast({ title: "Error generating summary", description: error.message, variant: 'destructive' });
        }
    });
}

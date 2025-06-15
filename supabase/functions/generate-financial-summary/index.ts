
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function formatForPrompt(data: any) {
    if (!data) return 'Not provided';
    if (Array.isArray(data) && data.length === 0) return 'None';
    if (Array.isArray(data)) return data.join(', ');
    if (typeof data === 'object' && data !== null) return JSON.stringify(data, null, 2);
    return String(data);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { assessmentData } = await req.json();

    if (!assessmentData) {
      return new Response(JSON.stringify({ error: 'assessmentData is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
        username, goals, other_goal, goal_timeframe, employment_status, income_sources, 
        expense_items, debt_types, debt_details, debt_management_confidence, 
        financial_knowledge_level, investment_experience, free_text_comments
    } = assessmentData;

    const prompt = `
You are a friendly and encouraging financial assistant. Based on the following financial assessment data for a user named ${username || 'there'}, please provide a summary of their financial situation and goals. Compare their goals with their current financial habits (income, expenses, debt) and offer gentle, encouraging advice on how they can start moving towards their goals.

Keep the tone positive and empowering. Start with a warm greeting. Use markdown for formatting like lists and bold text. End with a motivational closing statement.

Here is the user's data:
- **Primary Goal(s):** ${formatForPrompt(goals)}
- **Other Goal:** ${formatForPrompt(other_goal)}
- **Goal Timeframe:** ${formatForPrompt(goal_timeframe)}
- **Employment:** ${formatForPrompt(employment_status)}
- **Income Sources:** ${formatForPrompt(income_sources)}
- **Monthly Expenses:** ${formatForPrompt(expense_items)}
- **Current Debts:** ${formatForPrompt(debt_types)}
- **Debt Details:** ${formatForPrompt(debt_details)}
- **Confidence in Managing Debt:** ${formatForPrompt(debt_management_confidence)}
- **Financial Knowledge Level:** ${formatForPrompt(financial_knowledge_level)}
- **Investment Experience:** ${formatForPrompt(investment_experience)}
- **Additional Comments:** ${formatForPrompt(free_text_comments)}

Please generate a concise yet insightful summary and comparison. Address the user directly.
    `.trim();

    console.log(`Generating financial summary for: ${username}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful financial assistant. Be encouraging, clear, and use markdown for readability.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(errorData.error.message || 'Failed to fetch response from OpenAI');
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-financial-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

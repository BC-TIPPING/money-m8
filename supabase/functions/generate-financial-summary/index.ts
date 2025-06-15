
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { calculateMonthlyAmount } from './utils/calculations.ts';
import { generateMainPrompt } from './prompts/mainPrompt.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { assessmentData, personality = 'default' } = await req.json();

    if (!assessmentData) {
      return new Response(JSON.stringify({ error: 'assessmentData is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { username, income_sources, expense_items } = assessmentData;

    const totalMonthlyIncome = calculateMonthlyAmount(income_sources);
    const totalMonthlyExpenses = calculateMonthlyAmount(expense_items);
    const potentialMonthlySavings = totalMonthlyIncome - totalMonthlyExpenses;
    
    let savingsCallout = '';
    if (potentialMonthlySavings > 0) {
        savingsCallout = `- Based on the income and expenses you've provided, it looks like you have the potential to save around **$${potentialMonthlySavings.toFixed(0)} per month**. This is a fantastic starting point for reaching your goals!`;
    } else if (totalMonthlyIncome > 0) {
        savingsCallout = `- It looks like your expenses might be higher than your income right now. That's okay, we can look at strategies to manage this.`;
    }
    
    const prompt = generateMainPrompt(assessmentData, potentialMonthlySavings, savingsCallout, personality);

    console.log(`Generating financial summary for: ${username} with personality: ${personality}`);

    let system_prompt = 'You are a helpful financial assistant for an Australian audience. Be encouraging, clear, and use markdown for readability. Structure your response in the requested three sections.';
    if (personality === 'dave_ramsey') {
        system_prompt = `You are a financial advisor inspired by Dave Ramsey, providing advice for an Australian audience. You use a "tough love" approach. Be very direct, critical, and no-nonsense. Your goal is to shock the user into action to get out of debt. Use short, punchy sentences. Don't be afraid to call certain financial decisions "stupid". Emphasize that they need to sell unnecessary items (like boats, fancy cars if they have debt) and attack their debt with gazelle intensity. Credit cards are the enemy. The tone should be brutally honest but ultimately aimed at helping them achieve financial peace.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system_prompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(errorData.error.message || 'Failed to fetch response from OpenAI');
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    let summary = rawContent;
    let chartData = null;

    if (rawContent.includes('CHART_DATA::')) {
        const parts = rawContent.split('CHART_DATA::');
        summary = parts[0].trim();
        try {
            const jsonString = parts[1].trim().replace(/^```json|```$/g, '').trim();
            chartData = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse chart data JSON:", e);
            console.error("Problematic JSON string:", parts[1]);
        }
    }

    return new Response(JSON.stringify({ summary, chartData }), {
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

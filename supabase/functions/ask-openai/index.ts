
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const australianFinancialPrompt = `You are a specialized Australian financial assistant with expertise in:

1. ATO (Australian Taxation Office) regulations and guidelines
2. Australian banking regulations and lending practices
3. Barefoot Investor methodology and principles
4. Australian superannuation system and SMSF rules
5. Australian property market and mortgage strategies
6. ASX investing and managed funds regulations
7. Centrelink and government benefits
8. Australian insurance requirements and options

Always provide advice specific to Australian regulations, tax laws, and financial products. Reference ATO guidelines, APRA regulations, and Australian banking practices. Use Australian terminology (super instead of 401k, HECS debt, negative gearing, etc.).

For investment advice, focus on Australian assets, ETFs listed on ASX, and Australian managed funds. Mention relevant tax implications like CGT, franking credits, and salary sacrifice benefits.

If the user's question relates to one of these financial goals, suggest the most relevant one:
- "Buy a house" - for property purchases, first home buyer questions, mortgage pre-approval
- "Pay off home loan sooner" - for mortgage reduction strategies, extra repayments
- "Set a budget" - for budgeting questions, expense tracking, Barefoot Investor buckets
- "Reduce debt" - for debt consolidation, credit card debt, personal loans
- "Grow investments" - for investment strategies, ETFs, shares, managed funds
- "Maximise super" - for superannuation questions, salary sacrifice, super strategies
- "Save for a purchase" - for specific savings goals, emergency funds
- "Improve financial literacy" - for general financial education questions

Be concise but comprehensive. Always end with practical, actionable Australian-specific advice.`;

const analyzeQuestionForGoal = (question: string): string | null => {
  const lowerQuestion = question.toLowerCase();
  
  // Property and home buying keywords
  if (lowerQuestion.includes('buy') && (lowerQuestion.includes('house') || lowerQuestion.includes('home') || lowerQuestion.includes('property')) ||
      lowerQuestion.includes('first home buyer') || lowerQuestion.includes('deposit') || lowerQuestion.includes('mortgage pre-approval')) {
    return 'Buy a house';
  }
  
  // Mortgage payoff keywords
  if ((lowerQuestion.includes('pay off') || lowerQuestion.includes('payoff')) && (lowerQuestion.includes('mortgage') || lowerQuestion.includes('home loan')) ||
      lowerQuestion.includes('extra repayment') || lowerQuestion.includes('home loan')) {
    return 'Pay off home loan sooner';
  }
  
  // Budget keywords
  if (lowerQuestion.includes('budget') || lowerQuestion.includes('barefoot') || lowerQuestion.includes('bucket') ||
      lowerQuestion.includes('expense') || lowerQuestion.includes('spending plan')) {
    return 'Set a budget';
  }
  
  // Debt reduction keywords
  if (lowerQuestion.includes('debt') && (lowerQuestion.includes('reduce') || lowerQuestion.includes('pay off') || lowerQuestion.includes('consolidate')) ||
      lowerQuestion.includes('credit card debt') || lowerQuestion.includes('personal loan')) {
    return 'Reduce debt';
  }
  
  // Investment keywords
  if (lowerQuestion.includes('invest') || lowerQuestion.includes('etf') || lowerQuestion.includes('shares') ||
      lowerQuestion.includes('asx') || lowerQuestion.includes('managed fund') || lowerQuestion.includes('portfolio')) {
    return 'Grow investments';
  }
  
  // Superannuation keywords
  if (lowerQuestion.includes('super') || lowerQuestion.includes('superannuation') || lowerQuestion.includes('salary sacrifice') ||
      lowerQuestion.includes('smsf') || lowerQuestion.includes('retirement')) {
    return 'Maximise super';
  }
  
  // Savings keywords
  if (lowerQuestion.includes('save') || lowerQuestion.includes('emergency fund') || lowerQuestion.includes('savings goal')) {
    return 'Save for a purchase';
  }
  
  // Financial literacy keywords
  if (lowerQuestion.includes('learn') || lowerQuestion.includes('understand') || lowerQuestion.includes('how does') ||
      lowerQuestion.includes('what is') || lowerQuestion.includes('explain')) {
    return 'Improve financial literacy';
  }
  
  return null;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();

    if (!question) {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Received Australian financial question: ${question}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: australianFinancialPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(errorData.error.message || 'Failed to fetch response from OpenAI');
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;
    
    // Analyze the question to suggest a relevant goal
    const suggestedGoal = analyzeQuestionForGoal(question);

    return new Response(JSON.stringify({ 
      answer, 
      suggestedGoal 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ask-openai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

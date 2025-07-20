
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const australianFinancialPrompt = `You are Money M8, an Australian money coach inspired by the Barefoot Investor methodology. Write in a conversational, direct, and practical tone like you're talking to a mate over coffee.

Key principles:
1. Use simple, clear language - no jargon
2. Give practical, actionable steps
3. Include specific Australian examples where relevant
4. Structure responses with clear headings and bullet points
5. Use stories or analogies to explain complex concepts
6. Reference Australian regulations (ATO, APRA, etc.) and products (ASX, super, HECS)

Writing style:
- Start with a direct, relatable opening
- Use "you" to make it personal
- Include specific dollar amounts and percentages where helpful
- Break down complex topics into simple steps
- End with a clear action plan

Focus areas:
- ATO regulations and guidelines
- Australian banking and lending practices
- Barefoot Investor bucket system
- Australian superannuation and SMSF
- Property market and mortgage strategies
- ASX investing and managed funds
- Centrelink and government benefits
- Australian insurance and tax strategies

If the question relates to these goals, suggest the most relevant:
- "Buy a house" - property purchases, first home buyer questions
- "Buy an investment property" - investment property questions, negative gearing
- "Pay off home loan sooner" - mortgage reduction strategies
- "Set a budget" - budgeting, expense tracking, bucket system
- "Reduce debt" - debt consolidation, credit cards
- "Grow investments" - ETFs, shares, managed funds
- "Maximise super" - superannuation strategies, salary sacrifice
- "Save for a purchase" - savings goals, emergency funds
- "Improve financial literacy" - general education

Always end with: "Remember mate, this is just AI-generated guidance to get you thinking. It's not personal advice, so chat with a qualified professional before making any big money moves."`;

const analyzeQuestionForGoal = (question: string): string | null => {
  const lowerQuestion = question.toLowerCase();
  
  // Investment property keywords
  if (lowerQuestion.includes('investment property') || lowerQuestion.includes('rental property') ||
      lowerQuestion.includes('negative gearing') || lowerQuestion.includes('property investment')) {
    return 'Buy an investment property';
  }
  
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

    console.log(`Received Australian money question: ${question}`);

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
        max_tokens: 800,
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

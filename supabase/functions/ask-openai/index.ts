
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const australianFinancialPrompt = `You are Money Mate, an Australian financial assistant inspired by Scott Pape's Barefoot Investor methodology. Write in a conversational, direct, and practical tone like you're having a chat with a mate over coffee.

CRITICAL: When user context is provided, ALWAYS analyze their financial situation FIRST before giving specific advice. Start by assessing their budget, debt position, and overall financial health before recommending any investments or financial products.

Your responses should be:
- Written in plain English, no financial jargon
- Practical and actionable
- CONCISE - keep responses focused and brief
- Include specific Australian examples where relevant
- Use clear structure with simple paragraphs
- Include real dollar amounts and percentages where helpful
- Reference Australian regulations (ATO, APRA, etc.) and products naturally
- ALWAYS use their specific financial data to provide personalized examples

Response Structure when user context is available:
1. First assess their current financial position (income vs expenses, debt levels, surplus/deficit)
2. Then address their specific question with personalized advice
3. Use their actual numbers in examples (e.g., "With your $5,000 monthly income and $4,200 expenses...")
4. Give specific next steps based on their situation

Writing style guidelines:
- Start with a direct analysis of their financial position
- Use "you" and "your" to make it personal
- Break complex topics into simple steps
- Give specific examples using their actual financial data
- End with clear next steps or action items
- Write like Scott Pape would - conversational but authoritative
- KEEP IT SHORT - aim for 2-3 short paragraphs maximum

Focus areas for Australian context:
- ATO regulations and tax strategies
- Australian banking and lending practices
- Barefoot Investor bucket system principles
- Superannuation and SMSF strategies
- Property market and mortgage approaches
- ASX investing and managed funds
- Centrelink benefits and eligibility
- Australian insurance considerations

If questions relate to specific goals, suggest the most relevant Money Mate goal from:
- "Buy a house" - property purchases, first home buyer advice
- "Buy an investment property" - investment property strategies, negative gearing
- "Pay off home loan sooner" - mortgage reduction techniques
- "Set a budget" - budgeting systems, expense tracking, bucket approach
- "Reduce debt" - debt elimination strategies, credit card management
- "Grow investments" - ETFs, shares, managed funds, portfolio building
- "Maximise super" - superannuation optimization, salary sacrifice
- "Save for a purchase" - savings strategies, emergency funds
- "Improve financial literacy" - general education and understanding
- "Full Financial Health Check" - comprehensive financial analysis

Format your response as natural paragraphs without markdown formatting. No asterisks, no hashtags, no bullet points unless absolutely necessary. Write it like you're speaking directly to someone.`;

const analyzeQuestionForGoal = (question: string): string | null => {
  const lowerQuestion = question.toLowerCase();
  
  // Full health check keywords
  if (lowerQuestion.includes('health check') || lowerQuestion.includes('full assessment') ||
      lowerQuestion.includes('comprehensive') || lowerQuestion.includes('complete review')) {
    return 'Full Financial Health Check';
  }
  
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
    const { question, assessmentData } = await req.json();

    if (!question) {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Received Australian money question: ${question}`, assessmentData ? 'with assessment data' : 'without assessment data');

    // Build context from assessment data if provided
    let userContext = '';
    if (assessmentData) {
      const { incomeSources, expenseItems, debtDetails, goals, age, superBalance, assets, postcode } = assessmentData;
      
      userContext = '\n\nUSER CONTEXT (ANALYZE THIS FIRST - use their specific numbers in your response):\n';
      
      let monthlyIncome = 0;
      let monthlyExpenses = 0;
      
      if (incomeSources && incomeSources.length > 0) {
        const totalIncome = incomeSources.reduce((sum, source) => {
          const amount = parseFloat(source.amount) || 0;
          const multiplier = source.frequency === 'Weekly' ? 52 : 
                            source.frequency === 'Fortnightly' ? 26 : 
                            source.frequency === 'Monthly' ? 12 : 1;
          return sum + (amount * multiplier);
        }, 0);
        monthlyIncome = Math.round(totalIncome / 12);
        userContext += `- Monthly Income: $${monthlyIncome.toLocaleString()} (Annual: $${Math.round(totalIncome).toLocaleString()})\n`;
      }
      
      if (expenseItems && expenseItems.length > 0) {
        const totalExpenses = expenseItems.reduce((sum, expense) => {
          const amount = parseFloat(expense.amount) || 0;
          const multiplier = expense.frequency === 'Weekly' ? 52 : 
                            expense.frequency === 'Fortnightly' ? 26 : 
                            expense.frequency === 'Monthly' ? 12 : 1;
          return sum + (amount * multiplier);
        }, 0);
        monthlyExpenses = Math.round(totalExpenses / 12);
        userContext += `- Monthly Expenses: $${monthlyExpenses.toLocaleString()} (Annual: $${Math.round(totalExpenses).toLocaleString()})\n`;
      }
      
      if (monthlyIncome > 0 && monthlyExpenses > 0) {
        const surplus = monthlyIncome - monthlyExpenses;
        userContext += `- Monthly Surplus/Deficit: ${surplus >= 0 ? '+' : ''}$${surplus.toLocaleString()}\n`;
      }
      
      if (debtDetails && debtDetails.length > 0) {
        const totalDebt = debtDetails.reduce((sum, debt) => sum + (parseFloat(debt.balance || '0')), 0);
        userContext += `- Total Debt: $${totalDebt.toLocaleString()}\n`;
        userContext += `- Debt Details: ${debtDetails.map(debt => `${debt.type} ($${parseFloat(debt.balance || '0').toLocaleString()} at ${debt.interestRate}%)`).join(', ')}\n`;
      }
      
      if (goals && goals.length > 0) {
        userContext += `- Current Goals: ${goals.join(', ')}\n`;
      }
      
      if (age) {
        userContext += `- Age: ${age}\n`;
      }
      
      if (superBalance) {
        userContext += `- Super Balance: $${parseInt(superBalance).toLocaleString()}\n`;
      }
      
      if (postcode) {
        userContext += `- Location: ${postcode}\n`;
      }
      
      userContext += '\nIMPORTANT: Start your response by analyzing their financial position using these specific numbers. For investment questions, first assess if they have adequate emergency funds, manageable debt levels, and surplus income before recommending any investments. Use their actual dollar amounts in your examples.\n';
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
          { role: 'system', content: australianFinancialPrompt + userContext },
          { role: 'user', content: question }
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(errorData.error.message || 'Failed to fetch response from OpenAI');
    }

    const data = await response.json();
    let answer = data.choices[0].message.content;
    
    // Clean up any remaining markdown formatting
    answer = answer.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold formatting
    answer = answer.replace(/#{1,6}\s*(.*?)$/gm, '$1'); // Remove headers
    answer = answer.replace(/\*\s/g, ''); // Remove bullet points
    
    // Add disclaimer
    answer += '\n\nRemember mate, this is just AI-generated guidance to get you thinking. It\'s not personal advice, so chat with a qualified professional before making any big money moves.';
    
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

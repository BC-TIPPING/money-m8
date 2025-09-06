
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const australianFinancialPrompt = `You are Money Mate, an Australian financial assistant inspired by Scott Pape's Barefoot Investor methodology. Write in a conversational, direct, and practical tone like you're having a chat with a mate over coffee.

Your responses should be:
- Written in plain English, no financial jargon
- Practical and actionable
- CONCISE - keep responses focused and brief
- Include specific Australian examples where relevant
- Use clear structure with simple paragraphs
- Include real dollar amounts and percentages where helpful
- Reference Australian regulations (ATO, APRA, etc.) and products naturally

Writing style guidelines:
- Start with a direct, relatable opening
- Use "you" and "your" to make it personal
- Break complex topics into simple steps
- Give specific examples (e.g., "If you earn $80,000 a year...")
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

    console.log(`Received Australian money question: ${question}`);

    // Build personalized system prompt if assessment data is provided
    let systemPrompt = australianFinancialPrompt;
    let userQuestion = question.replace(' with assessment data', ''); // Clean the question
    
    if (assessmentData) {
      // Calculate key financial metrics from assessment data
      const monthlyIncome = assessmentData.incomeSources?.reduce((total, source) => {
        const amount = parseFloat(source.amount) || 0;
        const frequency = source.frequency?.toLowerCase();
        let monthlyAmount = amount;
        
        if (frequency === 'yearly') monthlyAmount = amount / 12;
        else if (frequency === 'fortnightly') monthlyAmount = amount * 26 / 12;
        else if (frequency === 'weekly') monthlyAmount = amount * 52 / 12;
        
        return total + monthlyAmount;
      }, 0) || 0;

      const monthlyExpenses = assessmentData.expenseItems?.reduce((total, expense) => {
        const amount = parseFloat(expense.amount) || 0;
        const frequency = expense.frequency?.toLowerCase();
        let monthlyAmount = amount;
        
        if (frequency === 'yearly') monthlyAmount = amount / 12;
        else if (frequency === 'fortnightly') monthlyAmount = amount * 26 / 12;
        else if (frequency === 'weekly') monthlyAmount = amount * 52 / 12;
        
        return total + monthlyAmount;
      }, 0) || 0;

      const totalDebt = assessmentData.debtDetails?.reduce((total, debt) => {
        return total + (parseFloat(debt.balance) || 0);
      }, 0) || 0;

      const monthlySurplus = monthlyIncome - monthlyExpenses;
      
      // Add personalized context to system prompt
      systemPrompt += `\n\nPersonalized Context for this user:
- Age: ${assessmentData.age || 'Not specified'}
- Location: Postcode ${assessmentData.postcode || 'Not specified'}
- Monthly Income: $${monthlyIncome.toLocaleString()} (${monthlyIncome > 0 ? 'Good income level' : 'No income specified'})
- Monthly Expenses: $${monthlyExpenses.toLocaleString()}
- Monthly Surplus/Deficit: $${monthlySurplus.toLocaleString()} ${monthlySurplus > 0 ? '(Positive - good for savings/investments)' : '(Deficit - needs budget review)'}
- Super Balance: $${assessmentData.superBalance?.toLocaleString() || 'Not specified'}
- Total Debt: $${totalDebt.toLocaleString()} ${totalDebt > 0 ? '(Focus on debt management)' : '(Debt-free - great position)'}
- Current Goals: ${assessmentData.goals?.join(', ') || 'Not specified'}
- Insurance Coverage: ${assessmentData.insurances?.join(', ') || 'Not specified'}

Key Financial Insights:
${monthlySurplus > 0 ? `- You have a monthly surplus of $${monthlySurplus.toLocaleString()} which is excellent for building wealth` : '- Your expenses exceed income by $' + Math.abs(monthlySurplus).toLocaleString() + ' - budgeting should be your first priority'}
${totalDebt > 0 ? `- You have $${totalDebt.toLocaleString()} in debt that needs consideration` : '- You\'re debt-free which puts you in a strong position'}
${assessmentData.superBalance && assessmentData.age ? `- Your super balance of $${assessmentData.superBalance.toLocaleString()} at age ${assessmentData.age} ${assessmentData.superBalance < assessmentData.age * 5000 ? 'is below the recommended benchmark' : 'looks good for your age'}` : ''}

Use this specific financial information to provide highly personalized, practical advice. Reference their actual numbers, surplus/deficit, and current situation directly in your response.`;
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuestion }
        ],
        max_tokens: 500, // Increased for more detailed personalized responses
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
    const suggestedGoal = analyzeQuestionForGoal(userQuestion);

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

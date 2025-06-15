
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { BUDGET_CATEGORIES } from './_lib/budgetCategories.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main prompt generation
const generatePrompt = (fileContent: string) => {
  const categories = BUDGET_CATEGORIES.map(c => c.category);

  return `
You are an expert financial analyst. Your task is to analyze the provided bank statement data (in CSV format) and extract key financial insights for an Australian user.

Here are the spending categories to use:
${categories.join(', ')}

Analyze the following statement data:
---
${fileContent}
---

Based on the data, perform the following tasks and return a single, valid JSON object. Do not include any text or markdown formatting before or after the JSON object.

1.  **Parse Transactions**: Identify the date, description, and amount for each transaction. Assume amounts are expenses unless explicitly marked as credits.
2.  **Categorize Expenses**: For each expense, assign it to the most appropriate category from the list provided. If a transaction doesn't fit, use "Miscellaneous".
3.  **Calculate Time Period**: Find the earliest and latest transaction dates and calculate the number of days between them.
4.  **Summarize Expenses**: Aggregate the total spending for each category. The final output should be a monthly equivalent. For example, if the statement is for 15 days and 'Food & Groceries' is $200, the monthly amount is approximately $400. The amount should be a string.
5.  **Analyze Top Merchant**: Identify the single merchant or vendor where the user spent money most frequently (highest transaction count).
6.  **Generate AI Summary**: Write a brief, insightful, and friendly summary about the spending at this top merchant.
7.  **Create Visual Data**: Generate data for a bar chart showing the transaction counts for the top 5 most frequent merchants.

Your final output MUST be a JSON object with this exact structure:

{
  "categorizedExpenses": [
    { "category": "Food & Groceries", "amount": "450.75", "frequency": "Monthly" },
    { "category": "Transport", "amount": "120.00", "frequency": "Monthly" }
  ],
  "timePeriodInDays": 30,
  "analysis": {
    "topMerchant": {
      "name": "Woolworths",
      "transactionCount": 15,
      "totalSpending": 250.50,
      "aiSummary": "It looks like Woolworths is your go-to for groceries! You shopped there 15 times in the last month. Sticking to one supermarket can be great for loyalty points."
    },
    "spendingVisualData": {
       "title": "Top 5 Frequent Merchants",
       "data": [
         { "name": "Woolworths", "count": 15 },
         { "name": "Uber Eats", "count": 8 },
         { "name": "7-Eleven", "count": 7 },
         { "name": "Bunnings", "count": 4 },
         { "name": "Netflix", "count": 1 }
       ]
    }
  }
}
`;
};


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fileContent } = await req.json();

    if (!fileContent) {
      return new Response(JSON.stringify({ error: 'fileContent is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = generatePrompt(fileContent);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful financial assistant. Return ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(errorData.error.message || 'Failed to fetch response from OpenAI');
    }

    const data = await response.json();
    const parsedResult = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-statement function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

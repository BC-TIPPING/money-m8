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
    if (typeof data === 'object' && data !== null) {
      // Don't stringify empty objects or arrays within objects
      const filteredData = Array.isArray(data) 
        ? data.filter(item => Object.values(item).some(v => v !== '' && v !== null))
        : data;
      if (Array.isArray(filteredData) && filteredData.length === 0) return 'None';
      return JSON.stringify(filteredData, null, 2);
    }
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

    const primaryGoal = goals && goals.length > 0 ? goals[0] : 'Not specified';

    let goalSpecificInstructions = '';

    switch (primaryGoal) {
        case 'Reduce debt':
            goalSpecificInstructions = `
**Debt Reduction Scenarios (Snowball Method)**
- Recap their current debts from the data provided (type, balance, interest rate, and monthly repayment).
- The "debt snowball" strategy focuses on paying off the debt with the lowest balance first, while making minimum payments on all other debts. Once a debt is paid off, its minimum payment is rolled into the payment for the next-smallest debt.

- **Here is how you MUST calculate the scenarios:**
  - For each extra weekly repayment scenario ($0, $10, $25, $50, $100), you must perform a month-by-month simulation.
  - Convert the extra weekly payment to a monthly amount by multiplying by 4.33.
  - The total monthly payment for debts is the sum of all minimum monthly repayments plus the extra monthly amount.
  - **Simulation Example:** Let's say we have two debts:
    1.  Credit Card: $2,000 balance, $50 min. payment, 20% interest rate.
    2.  Car Loan: $8,000 balance, $200 min. payment, 8% interest rate.
    - And we add an extra $50/week (approx $217/month).
    - The lowest balance debt is the Credit Card. It's the "snowball" target.
    - Total monthly debt payment = $50 + $200 + $217 = $467.
    - **Month 1:**
      - First, calculate and add interest for the month to each loan's balance.
      - CC Interest: $2,000 * (0.20 / 12) = $33.33. New CC Balance: $2,033.33.
      - Car Loan Interest: $8,000 * (0.08 / 12) = $53.33. New Car Loan Balance: $8,053.33.
      - Then, apply payments. You pay the minimum on the Car Loan: $200.
      - The rest of the budget goes to the Credit Card: $467 - $200 = $267.
      - Final CC Balance: $2,033.33 - $267 = $1,766.33.
      - Final Car Loan Balance: $8,053.33 - $200 = $7,853.33.
    - **Continue this simulation month by month.** When the Credit Card is paid off, its $50 minimum payment gets added to the Car Loan payment. The new Car Loan payment becomes $250 + $217 = $467.
  - After running the simulation for each scenario, you will have the total months to be debt-free.

- **Create a markdown table** to show the results. The columns MUST be: "Extra Weekly Repayment", "New Payoff Time", "Total Interest Saved", "Debt-Free Date".
- **"New Payoff Time"** should be in years and months (e.g., "3 years, 4 months").
- **"Total Interest Saved"** is the interest paid in the "$0 extra" scenario minus the interest paid in the current scenario.
- **"Debt-Free Date"** is calculated from today: ${new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}.
- You **MUST** output real numbers in the table, not placeholders like [Time] or [Amount].
- Provide a motivational summary highlighting how a small extra contribution can save thousands of dollars and years of repayments.
- Use Australian currency ($) and provide all monetary values formatted nicely (e.g., $5,123.45).

- **CHART DATA INSTRUCTIONS (VERY IMPORTANT):**
- After the entire markdown summary, on a new line, you MUST provide a JSON object prefixed with \`CHART_DATA::\`.
- This JSON object must contain a key \`debtReductionData\`, which is an array of objects for the chart.
- Each object in the array represents a month in the simulation.
- Each object MUST have a \`month\` key (0, 1, 2, ...) and keys for the remaining total debt balance for each scenario.
- The keys for the scenarios MUST be: \`no_extra\`, \`10_extra\`, \`25_extra\`, \`50_extra\`, \`100_extra\`.
- The data must continue until the debt is fully paid off in the longest scenario (\`no_extra\`).
- **Example JSON output:**
\`\`\`json
CHART_DATA::{"debtReductionData": [{"month": 0, "no_extra": 20000, "10_extra": 20000, "25_extra": 20000, "50_extra": 20000, "100_extra": 20000}, {"month": 1, "no_extra": 19800, "10_extra": 19750, "25_extra": 19700, "50_extra": 19600, "100_extra": 19500}]}
\`\`\`
            `;
            break;
        case 'Buy a house':
            goalSpecificInstructions = `
**Home Deposit Savings Plan**
- Analyze their current income and expenses to suggest a potential monthly savings amount.
- Create a markdown table showing a savings timeline. The columns should be "Monthly Savings", "Time to Reach $50k Deposit", "Time to Reach $100k Deposit".
- Show scenarios for 3 different monthly savings amounts (e.g., current potential, +$200, +$500).
- Assume savings grow with a modest 2% p.a. interest rate in a high-yield savings account.
- Add a section with mortgage affordability estimates based on their income, and provide 3 brief tips for first-home buyers in Australia.
            `;
            break;
        case 'Pay off home loan sooner':
            goalSpecificInstructions = `
**Mortgage Payoff Accelerator**
- Based on their debt details (assuming one is a home loan), create a scenario analysis.
- If no home loan is listed, provide a general example for a hypothetical $500,000 loan over 30 years at 6% p.a.
- Create a markdown table showing the impact of extra monthly repayments.
- The columns should be: "Extra Monthly Repayment", "New Loan Term", "Total Interest Saved".
- Show scenarios for an extra $0, $200, $500, and $1000 per month.
- Include a summary of how much time and money they can save.
- Add some motivational emojis. 🚀
            `;
            break;
        case 'Grow investments':
            goalSpecificInstructions = `
**Investment Growth Forecaster**
- Create a markdown table forecasting investment growth. Assume a starting investment of $5,000 and a 7% annual return, as the user has not provided their current investment details.
- The columns should be: "Monthly Contribution", "Portfolio Value in 10 Years", "Portfolio Value in 20 Years", "Total Interest Earned in 20 Years".
- Show scenarios for monthly contributions of $250, $500, and $1000.
- Explain the power of compound interest using these figures.
            `;
            break;
        case 'Improve financial literacy':
             goalSpecificInstructions = `
**Your Financial Literacy Boost**
- **The Barefoot Investor Steps:** Provide a simplified summary of the core "Barefoot Investor" steps as a markdown checklist (e.g., Set up your buckets, Domino your debts, etc.).
- **Key Concepts Explained Simply:**
    - **Compound Interest:** Explain what it is with a simple, relatable example.
    - **Budgeting:** Explain the "why" behind budgeting, not just the "how".
    - **Good Debt vs. Bad Debt:** Give clear examples of each.
- Encourage them to start with one small area to learn about.
            `;
            break;
        default:
            goalSpecificInstructions = `
**Your Action Plan**
- Provide a set of 3-5 actionable next steps tailored to their goal of "${primaryGoal}".
- These steps should be simple, clear, and encouraging.
            `;
    }

    const prompt = `
You are ClearFin.AI, a friendly and encouraging financial assistant providing advice for an Australian audience. Based on the following financial assessment data for a user named ${username || 'there'}, provide a detailed financial health check.

**Structure your response in three sections using markdown. Use emojis to make it engaging.**

---

### Section 1: Your Financial Snapshot 📸

- Start with a warm greeting to ${username || 'there'}.
- Provide a concise summary of their current financial situation (income, expenses, debt) based on the data provided.
- Highlight one positive aspect of their current situation.
- Keep the tone positive and empowering.

---

### Section 2: Progressing Towards Your Goal 🎯

- Acknowledge their primary goal: **${primaryGoal}**.
- Compare their goal with their current financial habits (e.g., "To reach your goal of buying a house, let's look at how your current savings align with that...").
- Offer gentle, encouraging advice on how they can start moving towards their goal.

---

### Section 3: AI Analysis & Scenarios 🔬

- **Financial Literacy Score:** Provide a "Financial Literacy Score" (e.g., Budding Saver, Confident Investor, Financial Pro) based on their self-assessed knowledge and investment experience. Give a one-sentence explanation for the score.
- **Goal-Specific Scenarios:**
${goalSpecificInstructions}

---

End with a motivational closing statement, encouraging them to take the first step.

**User's Data:**
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
          { role: 'system', content: 'You are a helpful financial assistant for an Australian audience. Be encouraging, clear, and use markdown for readability. Structure your response in the requested three sections.' },
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


function getDebtReductionInstructions() {
    return `
**Debt Reduction Scenarios (Snowball Method)**
- Recap their current debts from the data provided (type, balance, interest rate, and monthly repayment).
- The "debt snowball" strategy focuses on paying off the debt with the lowest balance first, while making minimum payments on all other debts. Once a debt is paid off, its minimum payment is rolled into the payment for the next-smallest debt.

- **Here is how you MUST calculate the scenarios:**
  - For each extra weekly repayment scenario ($0, $50, $100, $200, $500), you must perform a month-by-month simulation.
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

- **Create a markdown table** to show the results. The columns MUST be: "Extra Weekly Repayment", "Paid off sooner by", "Total Interest Saved", "Debt-Free Date".
- **"Paid off sooner by"** is the difference in time between the "$0 extra" scenario payoff time and the current scenario's payoff time. It should be in years and months (e.g., "1 year, 2 months"). For the "$0 extra" row, this value should be "-".
- **"Total Interest Saved"** is the interest paid in the "$0 extra" scenario minus the interest paid in the current scenario.
- **"Debt-Free Date"** is calculated from today. It should be formatted as Month YYYY (e.g., "Jun 2027").
- You **MUST** output real numbers in the table, not placeholders like [Time] or [Amount].
- Provide a motivational summary highlighting how a small extra contribution can save thousands of dollars and years of repayments.
- Use Australian currency ($) and provide all monetary values formatted nicely (e.g., $5,123.45).

- **CHART DATA INSTRUCTIONS (VERY IMPORTANT):**
- After the entire markdown summary, on a new line, you MUST provide a JSON object prefixed with \`CHART_DATA::\`.
- This JSON object must contain a key \`debtReductionData\`, which is an array of objects for the chart.
- Each object in the array represents a month in the simulation.
- Each object MUST have a \`month\` key (0, 1, 2, ...) and keys for the remaining total debt balance for each scenario.
- The keys for the scenarios MUST be: \`no_extra\`, \`50_extra\`, \`100_extra\`, \`200_extra\`, \`500_extra\`.
- The data must continue until the debt is fully paid off in the longest scenario (\`no_extra\`).
- **Example JSON output:**
\`\`\`json
CHART_DATA::{"debtReductionData": [{"month": 0, "no_extra": 20000, "50_extra": 20000, "100_extra": 20000, "200_extra": 20000, "500_extra": 20000}, {"month": 1, "no_extra": 19800, "50_extra": 19600, "100_extra": 19400, "200_extra": 19000, "500_extra": 18200}]}
\`\`\`
            `;
}
function getBuyAHomeInstructions() {
    return `
**Home Deposit Savings Plan**
- Analyze their current income and expenses to suggest a potential monthly savings amount.
- Create a markdown table showing a savings timeline. The columns should be "Monthly Savings", "Time to Reach $50k Deposit", "Time to Reach $100k Deposit".
- Show scenarios for 3 different monthly savings amounts (e.g., current potential, +$200, +$500).
- Assume savings grow with a modest 2% p.a. interest rate in a high-yield savings account.
- Add a section with mortgage affordability estimates based on their income, and provide 3 brief tips for first-home buyers in Australia.
            `;
}

function getPayOffHomeLoanSoonerInstructions() {
     return `
**Mortgage Payoff Accelerator**
- Based on their debt details (assuming one is a home loan), create a scenario analysis.
- If no home loan is listed, provide a general example for a hypothetical $500,000 loan over 30 years at 6% p.a.
- Create a markdown table showing the impact of extra monthly repayments.
- The columns should be: "Extra Monthly Repayment", "New Loan Term", "Total Interest Saved".
- Show scenarios for an extra $0, $200, $500, and $1000 per month.
- Include a summary of how much time and money they can save.
- Add some motivational emojis. 🚀
            `;
}

function getGrowInvestmentsInstructions() {
    return `
**Investment Growth Forecaster**
- Create a markdown table forecasting investment growth. Assume a starting investment of $5,000 and a 7% annual return, as the user has not provided their current investment details.
- The columns should be: "Monthly Contribution", "Portfolio Value in 10 Years", "Portfolio Value in 20 Years", "Total Interest Earned in 20 Years".
- Show scenarios for monthly contributions of $250, $500, and $1000.
- Explain the power of compound interest using these figures.
            `;
}

function getImproveFinancialLiteracyInstructions() {
    return `
**Your Financial Literacy Boost**
- **The Barefoot Investor Steps:** Provide a simplified summary of the core "Barefoot Investor" steps as a markdown checklist (e.g., Set up your buckets, Domino your debts, etc.).
- **Key Concepts Explained Simply:**
    - **Compound Interest:** Explain what it is with a simple, relatable example.
    - **Budgeting:** Explain the "why" behind budgeting, not just the "how".
    - **Good Debt vs. Bad Debt:** Give clear examples of each.
- Encourage them to start with one small area to learn about.
            `;
}

function getDefaultInstructions(primaryGoal: string) {
    return `
**Your Action Plan**
- Provide a set of 3-5 actionable next steps tailored to their goal of "${primaryGoal}".
- These steps should be simple, clear, and encouraging.
            `;
}


export function getGoalSpecificInstructions(primaryGoal: string) {
    switch (primaryGoal) {
        case 'Reduce debt':
            return getDebtReductionInstructions();
        case 'Buy a house':
            return getBuyAHomeInstructions();
        case 'Pay off home loan sooner':
            return getPayOffHomeLoanSoonerInstructions();
        case 'Grow investments':
            return getGrowInvestmentsInstructions();
        case 'Improve financial literacy':
             return getImproveFinancialLiteracyInstructions();
        default:
            return getDefaultInstructions(primaryGoal);
    }
}

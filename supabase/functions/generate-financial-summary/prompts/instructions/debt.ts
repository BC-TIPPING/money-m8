
export function getDebtReductionInstructions(personality: string = 'default', debtDetails?: any[]) {
    let motivationalSummary = `Provide a motivational summary highlighting how a small extra contribution can save thousands of dollars and years of repayments.`;
    if (personality === 'dave_ramsey') {
        motivationalSummary = `Look at these numbers. This is your ticket out of financial bondage. An extra $100 a week isn't for a coffee, it's for buying back years of your life. Get mad at this debt. Attack it. Sell stuff. Get another job. Do whatever it takes.`;
    }

    const debtRecap = debtDetails && debtDetails.length > 0
        ? debtDetails.map(d => `- **${d.type}:** $${parseFloat(d.balance).toLocaleString()} balance at ${d.interestRate}% interest.`).join('\n')
        : `- No debts listed.`;

    return `
**Debt Reduction Scenarios (Snowball Method)**
- Here is a summary of your current debts:
${debtRecap}
- The "debt snowball" strategy focuses on paying off the debt with the lowest balance first, while making minimum payments on all other debts. Once a debt is paid off, its minimum payment is rolled into the payment for the next-smallest debt.

- **Here is how you MUST calculate the scenarios:**
  - For each extra weekly repayment scenario ($0, $50, $100, $200, $500), you must perform a month-by-month simulation.
  - During the simulation, for each scenario, you must also keep a running total of the cumulative interest paid. This is crucial for calculating interest saved.
  - Convert the extra weekly payment to a monthly amount by multiplying by 4.33.
  - The total monthly payment for debts is the sum of all minimum monthly repayments plus the extra monthly amount.
  - **Simulation Example:** Let's say we have two debts:
    1.  Credit Card: $2,000 balance, $50 min. payment, 20% interest rate.
    2.  Car Loan: $8,000 balance, $200 min. payment, 8% interest rate.
    - And we add an extra $50/week (approx $217/month).
    - The lowest balance debt is the Credit Card. It's the "snowball" target.
    - Total monthly debt payment = $50 + $200 + $217 = $467.
    - **Month 1:**
      - First, calculate and add interest for the month to each loan's balance. This interest amount should be tracked for the cumulative total.
      - CC Interest: $2,000 * (0.20 / 12) = $33.33. New CC Balance: $2,033.33.
      - Car Loan Interest: $8,000 * (0.08 / 12) = $53.33. New Car Loan Balance: $8,053.33.
      - Then, apply payments. You pay the minimum on the Car Loan: $200.
      - The rest of the budget goes to the Credit Card: $467 - $200 = $267.
      - Final CC Balance: $2,033.33 - $267 = $1,766.33.
      - Final Car Loan Balance: $8,053.33 - $200 = $7,853.33.
    - **Continue this simulation month by month.** When the Credit Card is paid off, its $50 minimum payment gets added to the Car Loan payment. The new Car Loan payment becomes $250 + $217 = $467.
  - After running the simulation for each scenario, you will have the total months to be debt-free.

- **Create a markdown table** to show the results. The columns MUST be: "Extra / week", "Time Saved", "Interest Saved", "Debt-Free Date".
- The table MUST follow this exact structure, including the header separator line:
  \`\`\`
  | Extra / week | Time Saved | Interest Saved | Debt-Free Date |
  |--------------|------------|----------------|----------------|
  | $0           | -          | -              | e.g. Mar 2031  |
  | $50          | 2 years    | $1,234         | e.g. Mar 2029  |
  \`\`\`
- The values in the "Extra / week" column should be prefixed with a dollar sign (e.g., $50).
- **"Time Saved"** is the difference in time between the "$0 extra" scenario payoff time and the current scenario's payoff time. It should be in years and months (e.g., "1 year, 2 months"). For the "$0 extra" row, this value should be "-".
- **"Interest Saved"** is the interest paid in the "$0 extra" scenario minus the interest paid in the current scenario. It should be a whole number, prefixed with a dollar sign and with commas for thousands (e.g., $400, $1,400).
- **"Debt-Free Date"** is calculated from today. It should be formatted as Month YYYY (e.g., "Mar 2031").
- You **MUST** output real numbers in the table, not placeholders like [Time] or [Amount].
- ${motivationalSummary}
- Use Australian currency ($).

- **CHART DATA INSTRUCTIONS (VERY IMPORTANT):**
- After the entire markdown summary, on a new line, you MUST provide a JSON object prefixed with \`CHART_DATA::\`.
- This JSON object must contain two keys: \`debtReductionData\` and \`interestSavedData\`.
- **For \`debtReductionData\`**:
  - This is an array of objects for the debt reduction chart.
  - Each object in the array represents a month in the simulation.
  - Each object MUST have a \`month\` key (0, 1, 2, ...) and keys for the remaining total debt balance for each scenario.
  - The keys for the scenarios MUST be: \`no_extra\`, \`50_extra\`, \`100_extra\`, \`200_extra\`, \`500_extra\`.
  - The data must continue until the debt is fully paid off in the longest scenario (\`no_extra\`).
- **For \`interestSavedData\`**:
  - This is an array of objects for the interest saved chart.
  - Each object in this array represents a month in the simulation.
  - Each object MUST have a \`month\` key (0, 1, 2, ...).
  - It should also have keys for the *cumulative interest saved* for each scenario compared to the 'no_extra' baseline. The keys MUST be: \`50_extra\`, \`100_extra\`, \`200_extra\`, \`500_extra\`.
  - The value for each scenario key at a given month is calculated as: \`(cumulative interest paid in 'no_extra' scenario by that month) - (cumulative interest paid in the current scenario by that month)\`.
  - The data must continue until the debt is fully paid off in the longest scenario (\`no_extra\`).
- **Example JSON output:**
\`\`\`json
CHART_DATA::{"debtReductionData": [{"month": 0, "no_extra": 20000, "50_extra": 20000, "100_extra": 20000, "200_extra": 20000, "500_extra": 20000}, {"month": 1, "no_extra": 19800, "50_extra": 19600, "100_extra": 19400, "200_extra": 19000, "500_extra": 18200}], "interestSavedData": [{"month": 0, "50_extra": 0, "100_extra": 0, "200_extra": 0, "500_extra": 0}, {"month": 1, "50_extra": 10, "100_extra": 20, "200_extra": 40, "500_extra": 80}]}
\`\`\`
            `;
}

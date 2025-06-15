function getGoalSpecificResources(primaryGoal: string) {
    switch (primaryGoal) {
        case 'Reduce debt':
            return `
- **Book:** "The Barefoot Investor" by Scott Pape. It has a great, simple strategy for getting out of debt. Find it on [Booktopia](https://www.booktopia.com.au/the-barefoot-investor-scott-pape/book/9780730324218.html).
- **Article:** ASIC's MoneySmart guide on [Managing Debt](https://moneysmart.gov.au/managing-debt).
- **Tool:** The [National Debt Helpline](https://ndh.org.au/) offers free, confidential financial counselling.
`;
        case 'Buy a house':
            return `
- **Book:** "The Barefoot Investor for Families" by Scott Pape. It has a dedicated section on saving for a home. Find it on [Amazon Australia](https://www.amazon.com.au/Barefoot-Investor-Families-Scott-Pape/dp/0730368804).
- **Article:** A great overview on [How to Save for a House Deposit](https://www.canstar.com.au/home-loans/how-to-save-for-a-house-deposit/).
- **Government Resource:** Check your eligibility for the [First Home Owner Grant](https://www.firsthome.gov.au/) in your state.
`;
        case 'Pay off home loan sooner':
            return `
- **Article:** MoneySmart's excellent guide on [Paying off your mortgage faster](https://moneysmart.gov.au/home-loans/paying-off-your-mortgage-faster).
- **Podcast:** "My Millennial Money" often has practical episodes on mortgage strategy. Listen on [Spotify](https://open.spotify.com/show/345sF2f24p2aM3iG5A5rV1).
- **Calculator:** Most banks have an 'extra repayments calculator' on their site. Here's one from [CommBank](https://www.commbank.com.au/digital/home-buying/calculator/property-repayment).
`;
        case 'Grow investments':
            return `
- **Book:** "The Little Book of Common Sense Investing" by John C. Bogle. A classic on passive index fund investing. Find it on [Booktopia](https://www.booktopia.com.au/the-little-book-of-common-sense-investing-john-c-bogle/book/9781119404507.html).
- **Podcast:** "The Australian Finance Podcast" has a fantastic free "ETF Investing 101" series. Listen on [their website](https://www.rask.com.au/podcasts/australian-finance-podcast/).
- **Article:** MoneySmart's guide to [Choosing your investments](https://moneysmart.gov.au/how-to-invest/choose-your-investments).
`;
        default:
            return `
- **Book:** "The Barefoot Investor" by Scott Pape. It's the best place to start for any financial goal in Australia. Find it on [Booktopia](https://www.booktopia.com.au/the-barefoot-investor-scott-pape/book/9780730324218.html).
- **Website:** ASIC's [MoneySmart](https://moneysmart.gov.au/) website is a trustworthy, unbiased source for all financial topics.
- **Podcast:** "She's on the Money" provides great tips in a very accessible way. Listen on [Spotify](https://open.spotify.com/show/5r41hB9aFE8d5z2bA9gQfF).
`;
    }
}

export function getLiteracyBoostSection(primaryGoal: string) {
    const resources = getGoalSpecificResources(primaryGoal);
    return `
- **The Barefoot Investor Steps:** The "Barefoot Investor" by Scott Pape is a bestseller in Australia because it's simple and it works. Here are a few key steps to get started:
    - **1. Schedule a Monthly 'Barefoot Date Night':** This is your dedicated time to manage your money. Order a pizza, make it fun!
    - **2. Set Up Your Buckets:** Open different bank accounts for different purposes: Daily Expenses (for everyday spending), Smile (for short-term goals like holidays), and Fire Extinguisher (for long-term goals like a house deposit or crushing debt). This gives every dollar a job.
    - **3. Domino Your Debts:** List your debts from smallest to largest (ignoring interest rates). Make minimum payments on all, but throw every spare dollar at the smallest one. Once it's gone, you take that entire repayment amount and "snowball" it onto the next smallest debt. This builds massive momentum.

- **Recommended Reading & Resources for your goal ("${primaryGoal}"):**
${resources}
`;
}

function getDebtReductionInstructions(personality: string = 'default') {
    let motivationalSummary = `Provide a motivational summary highlighting how a small extra contribution can save thousands of dollars and years of repayments.`;
    if (personality === 'dave_ramsey') {
        motivationalSummary = `Look at these numbers. This is your ticket out of financial bondage. An extra $100 a week isn't for a coffee, it's for buying back years of your life. Get mad at this debt. Attack it. Sell stuff. Get another job. Do whatever it takes.`;
    }

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

- **Create a markdown table** to show the results. The columns MUST be: "Extra / week", "Time Saved", "Interest Saved", "Debt-Free Date".
- The values in the "Extra / week" column should be prefixed with a dollar sign (e.g., $50).
- **"Time Saved"** is the difference in time between the "$0 extra" scenario payoff time and the current scenario's payoff time. It should be in years and months (e.g., "1 year, 2 months"). For the "$0 extra" row, this value should be "-".
- **"Interest Saved"** is the interest paid in the "$0 extra" scenario minus the interest paid in the current scenario. It should be a whole number, prefixed with a dollar sign and with commas for thousands (e.g., $400, $1,400).
- **"Debt-Free Date"** is calculated from today. It should be formatted as Month YYYY (e.g., "Mar 2031").
- You **MUST** output real numbers in the table, not placeholders like [Time] or [Amount].
- ${motivationalSummary}
- Use Australian currency ($).

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
${getLiteracyBoostSection('general financial improvement')}

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


export function getGoalSpecificInstructions(primaryGoal: string, personality: string = 'default') {
    switch (primaryGoal) {
        case 'Reduce debt':
            return getDebtReductionInstructions(personality);
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


export function getBuyAHomeInstructions() {
    return `
**Home Deposit Savings Plan**
- Analyze their current income and expenses to suggest a specific monthly savings amount they can realistically achieve.
- Create a markdown table showing a savings timeline. The columns should be "Monthly Savings", "Time to Reach $50k Deposit", "Time to Reach $100k Deposit".
- Show scenarios for 3 different monthly savings amounts (e.g., current potential, +$200, +$500).
- Assume savings grow with a modest 2% p.a. interest rate in a high-yield savings account.
- Add a section with mortgage affordability estimates based on their income using the 6x annual income rule.
- Provide 3 specific, actionable tips for first-home buyers in Australia, such as:
  * "Research first home buyer grants in your state - you could be eligible for up to $10,000"
  * "Consider suburbs 15-20km from the city center where prices are typically 30-40% lower"
  * "Get pre-approval before house hunting to know your exact budget and strengthen your offers"
- Include specific next steps: "This week, open a dedicated house deposit savings account and set up an automatic transfer of $X per month"
            `;
}

export function getPayOffHomeLoanSoonerInstructions() {
    return `
**Mortgage Payoff Accelerator**
- Based on their debt details (assuming one is a home loan), create a specific scenario analysis for their situation.
- If no home loan is listed, provide a general example for a hypothetical $500,000 loan over 30 years at 6% p.a.
- Create a markdown table showing the impact of extra monthly repayments on THEIR specific loan.
- The columns should be: "Extra Monthly Repayment", "New Loan Term", "Total Interest Saved", "Time Saved".
- Show scenarios for an extra $0, $200, $500, and $1000 per month.
- Include a summary with specific dollar amounts: "By paying an extra $500 per month, you'll save $X in interest and pay off your loan Y years earlier"
- Provide specific actionable strategies:
  * "Direct your tax refund (average $2,800) straight to your mortgage each year"
  * "Use the 'split payment' strategy - pay half your monthly repayment every two weeks"
  * "Round up your repayments to the nearest $50 or $100"
- Add motivational context: "Every extra $1 you pay now saves you approximately $3 in interest over the life of the loan 🚀"
- Include a specific next step: "This month, contact your lender to set up additional repayments of $X per month"
            `;
}

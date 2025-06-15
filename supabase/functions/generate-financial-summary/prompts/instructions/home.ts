
export function getBuyAHomeInstructions() {
    return `
**Home Deposit Savings Plan**
- Analyze their current income and expenses to suggest a potential monthly savings amount.
- Create a markdown table showing a savings timeline. The columns should be "Monthly Savings", "Time to Reach $50k Deposit", "Time to Reach $100k Deposit".
- Show scenarios for 3 different monthly savings amounts (e.g., current potential, +$200, +$500).
- Assume savings grow with a modest 2% p.a. interest rate in a high-yield savings account.
- Add a section with mortgage affordability estimates based on their income, and provide 3 brief tips for first-home buyers in Australia.
            `;
}

export function getPayOffHomeLoanSoonerInstructions() {
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

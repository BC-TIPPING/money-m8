
import { getGoalSpecificResources } from './resources.ts';

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

export function getImproveFinancialLiteracyInstructions() {
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

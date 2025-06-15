
import { calculateInvestmentGrowth } from '../../utils/calculations.ts';

export function getGrowInvestmentsInstructions() {
    const initialInvestment = 5000;
    const annualRate = 0.07;
    const scenarios = [250, 500, 1000];

    const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString()}`;

    const tableRows = scenarios.map(monthly => {
        const result10Years = calculateInvestmentGrowth(initialInvestment, monthly, 10, annualRate);
        const result20Years = calculateInvestmentGrowth(initialInvestment, monthly, 20, annualRate);

        return `| ${formatCurrency(monthly)} | ${formatCurrency(result10Years.portfolioValue)} | ${formatCurrency(result20Years.portfolioValue)} | ${formatCurrency(result20Years.interestEarned)} |`;
    }).join('\n');

    return `
**Investment Growth Forecaster**
- Here's a table forecasting how your investments could grow with different monthly contributions, assuming an initial investment of ${formatCurrency(initialInvestment)} and an annual return of ${annualRate * 100}%.

| Monthly Contribution | Portfolio Value in 10 Years | Portfolio Value in 20 Years | Total Interest Earned in 20 Years |
|----------------------|-----------------------------|-----------------------------|-----------------------------------|
${tableRows}

- This forecast illustrates the power of compound interest. Consistent contributions over a long period can lead to significant growth, with a large portion of your final portfolio value coming from interest earned on your investments.
            `;
}

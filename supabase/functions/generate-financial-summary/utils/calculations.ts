
export function calculateMonthlyAmount(items: {amount: string, frequency: string}[]) {
    let totalMonthly = 0;
    if (!items || !Array.isArray(items)) return 0;

    for (const item of items) {
        if (!item.amount) continue;
        const amount = parseFloat(item.amount);
        if (isNaN(amount)) continue;

        switch (item.frequency) {
            case 'Weekly':
                totalMonthly += amount * 4.33;
                break;
            case 'Fortnightly':
                totalMonthly += amount * 2.165;
                break;
            case 'Monthly':
                totalMonthly += amount;
                break;
            case 'Yearly':
                totalMonthly += amount / 12;
                break;
        }
    }
    return totalMonthly;
}

export function calculateInvestmentGrowth(
    initialInvestment: number, 
    monthlyContribution: number, 
    years: number, 
    annualRate: number
) {
    const monthlyRate = annualRate / 12;
    const numberOfMonths = years * 12;

    // Calculate future value of the initial investment
    const fvInitial = initialInvestment * Math.pow(1 + monthlyRate, numberOfMonths);

    // Calculate future value of the series of monthly contributions
    const fvContributions = monthlyContribution * ( (Math.pow(1 + monthlyRate, numberOfMonths) - 1) / monthlyRate );

    const totalValue = fvInitial + fvContributions;
    
    const totalContributions = initialInvestment + (monthlyContribution * numberOfMonths);
    const interestEarned = totalValue - totalContributions;

    return {
        portfolioValue: totalValue,
        interestEarned: interestEarned
    };
}

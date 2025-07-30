
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

export function calculateAustralianIncomeTax(income: number) {
  // ATO Tax Rates 2024-25
  // $0 – $18,200: Nil
  // $18,201 – $45,000: 16c for each $1 over $18,200
  // $45,001 – $135,000: $4,288 plus 30c for each $1 over $45,000
  // $135,001 – $190,000: $31,288 plus 37c for each $1 over $135,000
  // $190,001 and over: $51,638 plus 45c for each $1 over $190,000
  
  let tax = 0;
  
  if (income <= 18200) {
    tax = 0;
  } else if (income <= 45000) {
    tax = (income - 18200) * 0.16;
  } else if (income <= 135000) {
    tax = 4288 + (income - 45000) * 0.30;
  } else if (income <= 190000) {
    tax = 31288 + (income - 135000) * 0.37;
  } else {
    tax = 51638 + (income - 190000) * 0.45;
  }
  
  // Add Medicare Levy (2% for most taxpayers)
  // Medicare Levy threshold for 2024-25 is $24,276 for individuals
  let medicareLevy = 0;
  if (income > 24276) {
    medicareLevy = income * 0.02;
  }
  
  return tax + medicareLevy;
}

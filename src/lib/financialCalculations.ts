
export function normalizeToMonthly(amount: number, frequency: string) {
    switch (frequency) {
        case 'Weekly':
            return amount * 4.33;
        case 'Fortnightly':
            return amount * 2.165;
        case 'Yearly':
            return amount / 12;
        case 'Monthly':
        default:
            return amount;
    }
}

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

export function calculateAustralianIncomeTax(income: number) {
  // ATO Tax Rates 2024-25
  // $0 – $18,200: Nil
  // $18,201 – $45,000: 16c for each $1 over $18,200
  // $45,001 – $135,000: $4,288 plus 30c for each $1 over $45,000
  // $135,001 – $190,000: $31,288 plus 37c for each $1 over $135,000
  // $190,001 and over: $51,638 plus 45c for each $1 over $190,000
  
  if (income <= 18200) {
    return 0;
  } else if (income <= 45000) {
    return (income - 18200) * 0.16;
  } else if (income <= 135000) {
    return 4288 + (income - 45000) * 0.30;
  } else if (income <= 190000) {
    return 31288 + (income - 135000) * 0.37;
  } else {
    return 51638 + (income - 190000) * 0.45;
  }
}

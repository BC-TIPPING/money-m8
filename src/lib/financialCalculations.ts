
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
  let tax = 0;
  // Note: Using 2025-26 tax brackets. These are subject to change.
  // https://www.ato.gov.au/rates/individual-income-tax-rates/
  if (income > 190000) {
    tax += (income - 190000) * 0.45;
    income = 190000;
  }
  if (income > 135000) {
    tax += (income - 135000) * 0.37;
    income = 135000;
  }
  if (income > 45000) {
    tax += (income - 45000) * 0.30;
    income = 45000;
  }
  if (income > 18200) {
    tax += (income - 18200) * 0.16;
  }
  return tax;
}

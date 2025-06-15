
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
  // Note: Using 2023-24 tax brackets. These are subject to change.
  if (income > 180000) {
    tax += (income - 180000) * 0.45;
    income = 180000;
  }
  if (income > 120000) {
    tax += (income - 120000) * 0.37;
    income = 120000;
  }
  if (income > 45000) {
    tax += (income - 45000) * 0.325;
    income = 45000;
  }
  if (income > 18200) {
    tax += (income - 18200) * 0.19;
  }
  return tax;
}

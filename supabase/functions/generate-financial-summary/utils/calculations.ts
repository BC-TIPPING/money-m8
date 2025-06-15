
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

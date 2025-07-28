export const BUDGET_CATEGORIES = [
  { category: 'Housing (Rent/Mortgage)', minPercent: 15, maxPercent: 25, notes: 'Rent, mortgage, or house payments' },
  { category: 'Utilities', minPercent: 3, maxPercent: 8, notes: 'Electricity, gas, water, internet' },
  { category: 'Food & Groceries', minPercent: 10, maxPercent: 15, notes: 'Includes groceries and eating out' },
  { category: 'Transport', minPercent: 10, maxPercent: 15, notes: 'Fuel, public transport, car insurance' },
  { category: 'Health & Medical', minPercent: 3, maxPercent: 6, notes: 'Insurance, GP, dental, pharmacy' },
  { category: 'Debt Repayments', minPercent: 5, maxPercent: 10, notes: 'Loans, credit cards (excl. mortgage)' },
  { category: 'Savings & Investments', minPercent: 10, maxPercent: 20, notes: 'Emergency fund, super, investing' },
  { category: 'Insurance', minPercent: 2, maxPercent: 5, notes: 'Life, home, car (non-health)' },
  { category: 'Children & Education', minPercent: 5, maxPercent: 10, notes: 'Childcare, school, supplies' },
  { category: 'Entertainment & Subscriptions', minPercent: 2, maxPercent: 5, notes: 'Streaming, movies, outings' },
  { category: 'Clothing & Personal Care', minPercent: 2, maxPercent: 5, notes: 'Clothes, grooming, haircuts' },
  { category: 'Pets', minPercent: 1, maxPercent: 3, notes: 'Food, vet, grooming' },
  { category: 'Travel & Holidays', minPercent: 3, maxPercent: 8, notes: 'Flights, hotels, local trips' },
  { category: 'Gifts & Donations', minPercent: 1, maxPercent: 3, notes: 'Birthdays, holidays, charity' },
  { category: 'Hobbies & Fitness', minPercent: 2, maxPercent: 4, notes: 'Gym, sports, personal hobbies' },
  { category: 'Miscellaneous', minPercent: 1, maxPercent: 3, notes: 'Buffer for one-offs or unknowns' },
];

export const PRELOADED_EXPENSE_CATEGORIES = BUDGET_CATEGORIES.map(c => c.category);

export const INCOME_FREQUENCIES = ["Weekly", "Fortnightly", "Monthly", "Yearly"];

export const PRELOADED_INCOME_CATEGORIES = [
  "Salary/Wages",
  "Business Income",
  "Investment Income",
  "Government Benefits",
  "Other",
];


import { getDebtReductionInstructions } from './instructions/debt.ts';
import { getBuyAHomeInstructions, getPayOffHomeLoanSoonerInstructions } from './instructions/home.ts';
import { getGrowInvestmentsInstructions } from './instructions/investment.ts';
import { getImproveFinancialLiteracyInstructions, getLiteracyBoostSection } from './instructions/literacy.ts';
import { getDefaultInstructions } from './instructions/default.ts';

export { getLiteracyBoostSection };

export function getGoalSpecificInstructions(primaryGoal: string, personality: string = 'default', debtDetails?: any[]) {
    switch (primaryGoal) {
        case 'Reduce debt':
            return getDebtReductionInstructions(personality, debtDetails);
        case 'Buy a house':
            return getBuyAHomeInstructions();
        case 'Pay off home loan sooner':
            return getPayOffHomeLoanSoonerInstructions();
        case 'Grow investments':
            return getGrowInvestmentsInstructions();
        case 'Improve financial literacy':
             return getImproveFinancialLiteracyInstructions();
        default:
            return getDefaultInstructions(primaryGoal);
    }
}

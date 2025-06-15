
export function getDefaultInstructions(primaryGoal: string) {
    return `
**Your Action Plan**
- Provide a set of 3-5 actionable next steps tailored to their goal of "${primaryGoal}".
- These steps should be simple, clear, and encouraging.
            `;
}

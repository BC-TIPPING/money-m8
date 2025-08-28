
export function getGoalSpecificResources(primaryGoal: string) {
    switch (primaryGoal) {
        case 'Reduce debt':
            return `
- **Book:** "The Barefoot Investor" by Scott Pape. It has a great, simple strategy for getting out of debt. Find it on [Booktopia](https://www.booktopia.com.au/the-barefoot-investor-scott-pape/book/9780730324218.html).
- **Article:** ASIC's MoneySmart guide on [Managing Debt](https://moneysmart.gov.au/managing-debt).
`;
        case 'Buy a house':
            return `
- **Book:** "The Barefoot Investor for Families" by Scott Pape. It has a dedicated section on saving for a home. Find it on [Amazon Australia](https://www.amazon.com.au/Barefoot-Investor-Families-Scott-Pape/dp/0730368804).
- **Article:** A great overview on [How to Save for a House Deposit](https://www.canstar.com.au/home-loans/how-to-save-for-a-house-deposit/).
- **Government Resource:** Check your eligibility for the [First Home Owner Grant](https://www.firsthome.gov.au/) in your state.
`;
        case 'Pay off home loan sooner':
            return `
- **Article:** MoneySmart's excellent guide on [Paying off your mortgage faster](https://moneysmart.gov.au/home-loans/paying-off-your-mortgage-faster).
- **Podcast:** "My Millennial Money" often has practical episodes on mortgage strategy. Listen on [Spotify](https://open.spotify.com/show/345sF2f24p2aM3iG5A5rV1).
- **Calculator:** Most banks have an 'extra repayments calculator' on their site. Here's one from [CommBank](https://www.commbank.com.au/digital/home-buying/calculator/property-repayment).
`;
        case 'Grow investments':
            return `
- **Book:** "The Little Book of Common Sense Investing" by John C. Bogle. A classic on passive index fund investing. Find it on [Booktopia](https://www.booktopia.com.au/the-little-book-of-common-sense-investing-john-c-bogle/book/9781119404507.html).
- **Podcast:** "The Australian Finance Podcast" has a fantastic free "ETF Investing 101" series. Listen on [their website](https://www.rask.com.au/podcasts/australian-finance-podcast/).
- **Article:** MoneySmart's guide to [Choosing your investments](https://moneysmart.gov.au/how-to-invest/choose-your-investments).
`;
        default:
            return `
- **Book:** "The Barefoot Investor" by Scott Pape. It's the best place to start for any financial goal in Australia. Find it on [Booktopia](https://www.booktopia.com.au/the-barefoot-investor-scott-pape/book/9780730324218.html).
- **Website:** ASIC's [MoneySmart](https://moneysmart.gov.au/) website is a trustworthy, unbiased source for all financial topics.
- **Podcast:** "She's on the Money" provides great tips in a very accessible way. Listen on [Spotify](https://open.spotify.com/show/5r41hB9aFE8d5z2bA9gQfF).
`;
    }
}

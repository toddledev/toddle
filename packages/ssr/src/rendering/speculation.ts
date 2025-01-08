// See docs here https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/speculationrules
export const defaultSpeculationRules = {
  prerender: [
    {
      source: 'document',
      where: {
        // Prerender all elements with data-prerender="eager" with eagerness=eager
        selector_matches: '[data-prerender="eager"]',
      },
      eagerness: 'eager',
    },
    {
      source: 'document',
      where: {
        // Prerender all elements with data-prerender="moderate" with eagerness=moderate
        selector_matches: '[data-prerender="moderate"]',
      },
      eagerness: 'moderate',
    },
  ],
}

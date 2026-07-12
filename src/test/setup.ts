import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement scrollIntoView; the quiz auto-scrolls to its result.
Element.prototype.scrollIntoView ??= () => {}

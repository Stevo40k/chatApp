# Gemini Project Mandates

You are an expert in **Node.js** and **TypeScript**, committed to high-quality engineering standards.

## Engineering Principles
- **Clean Code & DRY:** Adhere strictly to Clean Code principles and the "Don't Repeat Yourself" philosophy.
- **Performance:** Continuously look for opportunities to optimize code for peak performance.
- **Testing Excellence:** You are an expert in **Playwright** for end-to-end testing and will incorporate E2E tests whenever they provide architectural or business value.

## Quality Gates & Workflow
- **Code Coverage:** A minimum of **80% unit test coverage** is required for all changes.
- **Validation Loop:**
    1. Run unit tests after **every** code change to ensure no regressions.
    2. If tests fail, perform a root-cause analysis:
        - If the failure is due to updated business logic, rewrite the test to align with the new requirements.
        - If the failure is a regression, fix the implementation.
- **Commits:** Do not commit code to the repository unless the 80% coverage threshold is met and all tests pass.

# Antigravity Rules

- **No comments**: Avoid unnecessary comments.
- **TypeScript Always**: Always use TypeScript types (avoid `any`).
- **No repetitive code**: Do not repeat logic or large blocks of code.
- **Avoid DRY dogma**: Avoid over-engineering or complex abstractions in the name of DRY. Prefer readability and simplicity.
- **Spec First**: Before implementing any feature, read `spec.md`. Never generate code that contradicts the Contrato or Dominio. Tests are generated from the Validación section — never written manually.
- **Database Normalization**: When designing or modifying a database schema, ensure it follows normalization principles (1NF, 2NF, 3NF) where appropriate to maintain data integrity and reduce redundancy.
- **Facto Design System**: Before creating any visual component or page, read and apply the `.agents/skills/facto-design/SKILL.md` skill. Every component must match Facto's dark premium aesthetic — no generic styles allowed.

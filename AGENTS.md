# AGENT INSTRUCTIONS

This project is a ReactJS frontend application.

## Your Role

You are a senior React developer.

Before generating code:

1. Read existing code
2. Reuse existing components
3. Follow project architecture
4. Do not create duplicate services
5. Do not introduce new libraries unless necessary

---

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Query
- React Router

---

## Architecture Rules

- Feature-based architecture
- Shared components in /shared
- API logic in /services
- Business logic in hooks

Do not put API calls directly inside components.

---

## UI Rules

Always use:

- Existing Button component
- Existing Modal component
- Existing Table component

Do not create inline styles.

Use Tailwind classes only.

---

## State Management

Use:

- React Query for server data
- Context only for global states

Do not use Redux.

---

## Component Rules

Keep component under 1000 lines of code.

If component becomes too large:

- Extract hooks
- Extract child components

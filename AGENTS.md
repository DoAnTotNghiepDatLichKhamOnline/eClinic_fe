# AGENT INSTRUCTIONS

This project is a React frontend application.

---

## Your Role

You are a senior React engineer.

Before generating code:

1. Read existing code first
2. Reuse existing components whenever possible
3. Follow existing project architecture
4. Do not create duplicate services, hooks, utilities, or components
5. Do not introduce new libraries unless strictly necessary
6. Prefer modifying existing code over creating new implementations
7. Maintain consistency with existing coding style

---

## Tech Stack

- React
- TypeScript
- Vite
- TailwindCSS
- React Query
- React Router
- Ant Design
- Axios
- React Hook Form
- Zod

---

## Architecture Rules

Project follows Feature-Based Architecture.

Structure:

src/
├── features/
├── shared/
├── services/
├── styles/
├── assets/
├── routes/
├── types/
├── utils/

Rules:

- Feature UI belongs in features/*
- Shared reusable components belong in shared/*
- API logic belongs in services/*
- Business logic belongs in hooks/*
- Types belong in types/*
- Pure utility functions belong in utils/*

Do not:

- Put API calls directly inside components
- Place business logic inside JSX
- Create duplicate feature structures

---

## Component Rules

Keep components small and maintainable.

Guidelines:

- Prefer < 500 lines
- Hard limit: 1000 lines
- Extract child components when necessary
- Extract hooks when state/logic becomes complex
- Components should focus on UI rendering
- Hooks should handle behavior

Naming:

- PascalCase for components
- useXxx for hooks
- camelCase for variables/functions

Example:

usePatients.ts
PatientTable.tsx
PatientForm.tsx

---

## React Rules

Prefer:

- Functional Components
- React Hooks
- Composition over inheritance

Avoid:

- Class Components
- Excessive prop drilling
- Large monolithic components


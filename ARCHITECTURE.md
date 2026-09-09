# Feature-based architecture

The application is organized by product feature/domain. The landing page is the first complete feature and keeps its page-specific UI, data, and composition together.

```text
src/
├── features/
│   └── landing/
│       ├── LandingPage.tsx
│       ├── index.ts
│       └── components/
│           ├── header/
│           ├── hero/
│           ├── trust-bar/
│           ├── specialties/
│           ├── doctors/
│           ├── centers/
│           ├── cta/
│           ├── footer/
│           └── emergency-fab/
├── components/      # reusable UI and layout primitives
├── context/         # app-wide React context
├── services/        # API clients/integration layer (future)
├── hooks/           # reusable hooks (future)
├── routes/          # routing setup (future)
├── utils/
└── assets/
```

New pages/features should become siblings of `landing`, for example `auth`, `booking`, `doctors`, `patients`, and `admin`. Shared components should remain outside feature folders when they are reused by multiple features.

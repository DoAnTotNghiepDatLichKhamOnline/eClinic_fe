# Feature-Based Architecture

The frontend is organized by product feature. Feature-specific pages, components,
styles, and static data live together; cross-feature UI and application context
live in `shared/`.

```text
src/
├── features/
│   ├── admin/
│   ├── auth/
│   ├── doctor/
│   ├── landing/
│   └── patient/
│       ├── appointment/       # Public booking flow
│       ├── appointments/      # Signed-in patient's appointment calendar
│       └── doctors/
├── routes/                    # Public, patient, doctor, and admin route trees
├── services/                  # API boundary and mock data access
├── shared/
│   ├── components/            # Reusable UI and layout primitives
│   └── context/               # Application-wide state
├── styles/                    # Global styles and design tokens
├── types/                     # Shared TypeScript types
└── utils/                     # Pure helpers and cross-feature utilities
```

## Appointment Routes

- `/appointment` is the public booking flow for guests and signed-in patients.
	Signed-in patient details are prefilled where available, and bookings are
	associated with that account. Guest booking returns a booking reference.
- `/patient/appointments` is protected for the patient role and shows that
	patient's booked appointments. `/patient` redirects to this page.
- The booking date/time selector represents slot selection. The patient
	calendar represents existing appointments. The doctor's work calendar
	represents assigned shifts; these views may share interaction patterns but
	must not share domain records.

`services/appointmentService.ts` currently uses browser storage as a frontend
mock for signed-in patient appointments. It is not a backend persistence or
authorization boundary. Production data access and authorization belong on the
server; client-side role guards only control navigation and presentation.

New feature pages should be placed under the owning `features/*` domain.
Components belong in `shared/` only when they are reused across features.

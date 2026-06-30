# AGENTS.md

# Obech Flow Logistics

## Project Context

This is a React + Vite logistics management system owned by the project owner.

Always preserve the existing project architecture and coding style.

## Technology Stack

- React
- Vite
- React Router
- React Query
- Tailwind CSS
- Local Storage (temporary)
- Supabase (planned for production)

## Project Structure

```
src/
components/
pages/
pages/admin/
layouts/
hooks/
services/
utils/
```

## Development Rules

- Return complete files instead of partial snippets whenever possible.
- Never modify unrelated modules.
- Build one feature completely before starting another.
- Every change must pass:

```bash
npm run build
```

before moving to the next task.

## Current Development Phase

Frontend-first development.

Current storage:

- localStorage

Future production backend:

- Supabase

## Current Modules

Public Website

- Home
- Services
- Booking
- Tracking
- About
- Contact

Admin Portal

- Login
- Dashboard
- Bookings
- Customers
- Drivers
- Vehicles
- Tracking
- Reports
- Settings

## Coding Philosophy

Think like a logistics software architect.

Avoid unnecessary abstractions.

Keep components reusable, readable, and production-ready.

## Future Deployment

Frontend:

- Vercel

Backend:

- Supabase

Domain:

- Obech Flow Logistics
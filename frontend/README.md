# Livelihood Navigator Frontend

This is the React frontend for the Livelihood Navigator platform. It provides the candidate-facing portal, multilingual UI, onboarding flow, dashboards, and voice-assisted career guidance experience.

## Stack

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- Recharts

## Features

- Landing page with multilingual content
- Beneficiary onboarding and profile form
- Voice-enabled interaction and speech prompts
- Course and opportunity recommendations
- Dashboard views for officers and beneficiaries
- Certificate verification flow
- Responsive UI for desktop and mobile screens

## Local development

```bash
cd frontend
npm install
npm run dev
```

Then open:

- http://localhost:5173

## Production build

```bash
cd frontend
npm run build
npm run preview
```

## Notes

This frontend talks to the backend API on port 5000 and the Python AI service on port 8000. Make sure both services are running before testing the full user journey.

## Environment

The frontend expects the backend base URL configured in the API client. If needed, update the service URL in the API files before running the app.

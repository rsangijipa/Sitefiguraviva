# Instituto Figura Viva

A React-based website for Instituto Figura Viva, a Gestalt therapy institute offering clinical services, professional training, and educational courses.

## Overview

This is a Vite + React application with:
- React 19 for the UI
- React Router for navigation  
- TailwindCSS for styling
- Framer Motion for animations
- Firebase integration for backend services

## Project Structure

```
/
├── src/
│   ├── components/    # Reusable UI components (Navbar, Footer, etc.)
│   ├── context/       # React context providers
│   ├── pages/         # Page components
│   ├── services/      # API and Firebase services
│   ├── App.jsx        # Main app component with routing
│   └── main.jsx       # Entry point
├── public/            # Static assets
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
├── tailwind.config.js # Tailwind configuration
└── package.json       # Dependencies and scripts
```

Note: There is also a `next-platform/` directory which appears to be a Next.js version of the app, but the main project uses Vite.

## Development

The development server runs on port 5000:
```bash
npm run dev
```

## Deployment

The app is configured for Replit autoscale deployment:
- Build: `npm run build`
- Preview: `npm run preview`

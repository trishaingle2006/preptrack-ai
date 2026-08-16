# PrepTrack AI

PrepTrack AI is an integrated, AI-assisted placement preparation platform built for the ElevanceSkills internship assignment. It combines adaptive interviews, company-specific recruiter simulations, placement-readiness analysis, peer challenges, enterprise authentication, and role-based access control in one responsive application.

## Live application

**Production:** https://preptrack-ai-sepia.vercel.app

The application is deployed on Vercel and uses Firebase Authentication and Cloud Firestore. AI-assisted evaluation is provided through Gemini with validated local fallbacks for temporary service failures.

## Core modules

- **Adaptive Interview Engine** — evaluates every response, changes difficulty, maintains context, generates follow-ups, detects repeated answers, supports skips, prevents duplicate questions, and produces progression reports.
- **AI Recruiter Simulator** — provides educational company practice profiles with different interview styles, focus areas, thresholds, adaptive questions, and company-specific reports.
- **Placement Readiness Engine** — combines resume evidence, interview history, and completed practice into configurable readiness scores, classifications, improvement roadmaps, and historical assessments.
- **Peer Challenge Arena** — offers daily and weekly HR, Technical, Aptitude, and Domain-Specific challenges with server-side scoring, leaderboards, ranks, badges, streaks, and ranking history.
- **Enterprise Authentication** — includes email verification, strong passwords, time-limited password reset, failed-login lockout, login/device history, one-active-session enforcement, password-age policy, session management, and security alerts.
- **Role-Based Access Control** — implements Student, Mentor, and Administrator roles with permission-aware navigation, protected routes, server-authorized operations, mentor review/feedback, and administrator user/settings management.

## Technology stack

- React 19 and React Router
- Vite 7
- Firebase Authentication
- Cloud Firestore and Firestore Security Rules
- Firebase Admin SDK
- Vercel Serverless Functions
- Gemini API
- Lucide React icons
- ESLint

## Architecture

The original single-file college project was migrated into a modular React application:

```text
src/
  components/      protected and authorized route components
  context/         authentication and profile state
  data/            structured practice and company data
  pages/           feature pages and role workspaces
  security/        scalable permissions and role mappings
  services/        authenticated API, interview, security, and data services
api/               Vercel API entry point and token verification
functions/src/     server-authoritative AI, security, challenge, and RBAC handlers
```

Sensitive AI and administrative operations run on the server. The browser sends a Firebase ID token; the API verifies it, reloads the user role from Firestore, validates inputs, and performs authorized database operations with the Admin SDK.

## Local setup

Requirements: Node.js 22 and npm.

```bash
npm install
cd functions
npm install
cd ..
```

Copy `.env.example` to `.env` and enter the public Firebase web configuration. Never commit `.env`, service-account keys, Gemini keys, or security pepper values.

Start development:

```bash
npm run dev
```

Quality checks:

```bash
npm run lint
npm run build
```

## Deployment

The frontend and authenticated API are deployed together on Vercel. Production-only secrets are configured in Vercel and are not stored in this repository. Firestore rules and indexes are deployed separately with Firebase CLI.

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes
npx vercel --prod
```

## Roles

| Role | Main permissions |
| --- | --- |
| Student | Practice, interviews, readiness, challenges, notes, and account security |
| Mentor | Review student interview/readiness history and provide feedback |
| Administrator | Manage users, roles, account status, platform settings, and protected workspaces |

New accounts always receive the Student role. An initial Administrator must be bootstrapped securely in Firestore; subsequent role changes are performed through the protected Administration Console.

## Verified evidence

- Adaptive interview completed with dynamic Easy → Medium → Hard progression and a 10/10 report.
- Amazon recruiter simulation completed at 9.4/10 against a 7.5/10 practice threshold.
- Readiness history improved from 69/100 to 71/100 after additional practice evidence.
- Challenge submission achieved 95/100, rank #1, a one-day streak, and two badges.
- Email verification, active-session replacement, login history, new-device alert, and unauthorized-route blocking were verified.
- Administrator user/settings management and Mentor student review/feedback were verified using separate role accounts.

## Security notes

- Secrets are excluded by `.gitignore` and stored only in deployment environment variables.
- Server APIs verify Firebase ID tokens and re-check roles from Firestore.
- Administrative and mentor inputs are validated server-side.
- Firestore rules prevent users from modifying their own role or status.
- Resume and interview text is treated as untrusted input before AI processing.

## Author

Trisha Ingle — Frontend Developer and Computer Science Student


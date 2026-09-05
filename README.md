# PrepTrack AI

An AI-assisted placement preparation platform created as an integrated internship project. PrepTrack AI brings interview practice, recruiter simulation, readiness analysis, peer challenges, secure authentication, and role-based collaboration into one responsive application.

[Open the live application](https://preptrack-ai-sepia.vercel.app) · [View the source repository](https://github.com/trishaingle2006/preptrack-ai)

## Project overview

Students often use separate tools for interview practice, aptitude preparation, progress tracking, and career feedback. PrepTrack AI solves this fragmentation by converting preparation activity into an evolving, evidence-based learning experience.

The platform adapts interview difficulty to each response, evaluates answers with AI, combines performance data into a placement-readiness roadmap, and supports mentors and administrators through protected role-specific workspaces.

## Internship objectives

- Build one production-ready application from six connected internship modules.
- Apply AI to meaningful evaluation and personalization tasks.
- Protect user data and privileged operations with server-side authorization.
- Provide a professional experience across mobile, tablet, and desktop devices.
- Deploy the application and document a reproducible development workflow.

## Six connected modules

| Module | Key capabilities |
| --- | --- |
| Adaptive Interview Engine | Context-aware answer evaluation, dynamic difficulty, follow-up questions, duplicate prevention, skip handling, repeated-answer detection, and final progression reports |
| AI Recruiter Simulator | Educational company profiles, role-focused questions, configurable standards, adaptive interviews, weighted evaluation, and company-specific reports |
| Placement Readiness Engine | Resume analysis, interview and practice evidence, readiness scoring, candidate classification, improvement roadmap, and report history |
| Peer Challenge Arena | Daily and weekly challenges, server-side scoring, leaderboards, ranks, badges, streaks, and ranking history |
| Enterprise Authentication | Registration, Google and email sign-in, email verification, secure password recovery, password policy, session tracking, login activity, and security alerts |
| Role-Based Access Control | Student, Mentor, and Administrator permissions, protected navigation and routes, mentor feedback, user management, and platform configuration |

The application also contains a practice library, personal study notes, a progress dashboard, dark and light themes, responsive navigation, loading states, and recovery-focused error handling.

## How the AI workflow operates

1. The authenticated client submits a structured request with the user's Firebase ID token.
2. The server verifies the token, reloads the account role from Firestore, and validates the request.
3. Gemini evaluates the response or evidence using task-specific structured instructions.
4. The server validates and normalizes the AI result before returning it.
5. Interview difficulty, feedback, readiness recommendations, or challenge results are updated.
6. A deterministic local evaluator keeps supported learning flows usable if the AI service is temporarily unavailable.

AI results are educational guidance. Company simulator profiles are based on broad interview patterns and are not official hiring processes or guarantees.

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, React Router, JavaScript, HTML5, CSS3 |
| Build and quality | Vite 7, ESLint |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore and Firestore Security Rules |
| Server | Vercel Serverless Functions, Firebase Admin SDK |
| AI | Google Gemini API with validated local fallbacks |
| Interface | Lucide React icons, responsive CSS, dark/light themes |
| Deployment | Vercel and Firebase |

## Architecture

```text
Browser (React application)
    │
    ├── Firebase Authentication
    ├── Cloud Firestore (rules-protected user data)
    └── Authenticated /api requests
             │
             └── Vercel Serverless API
                    ├── Firebase ID-token verification
                    ├── Firestore role and status checks
                    ├── input validation and rate limiting
                    └── Gemini evaluation / secure Admin SDK writes
```

Sensitive AI, challenge, security, mentor, and administrative actions are performed on the server. Authorization does not rely only on hidden buttons or client-side routes.

## Project structure

```text
preptrack-ai/
├── api/                         Vercel serverless entry point
├── functions/src/               server-side feature handlers
├── src/
│   ├── components/              routing, loading, theme, and error UI
│   ├── context/                 authentication and account state
│   ├── data/                    questions and simulator profiles
│   ├── hooks/                   reusable application hooks
│   ├── pages/                   feature and role workspace pages
│   ├── security/                permissions and role mappings
│   └── services/                authenticated API and feature services
├── firestore.rules              database authorization rules
├── firestore.indexes.json       required Firestore indexes
├── vercel.json                  production routing configuration
└── .env.example                 public client configuration template
```

## Roles and permissions

| Role | Workspace access |
| --- | --- |
| Student | Practice, notes, adaptive interviews, recruiter simulations, readiness reports, challenges, and personal account security |
| Mentor | Student performance review, interview and readiness history, and structured mentor feedback |
| Administrator | User roles, account status, platform configuration, Mentor Centre, and all protected workspaces |

New registrations receive the Student role. A trusted administrator must bootstrap the first Administrator account in Firestore. Users cannot grant themselves additional permissions.

## Local development

### Requirements

- Node.js 22
- npm
- A Firebase project with Authentication and Cloud Firestore enabled
- A Gemini API key for live AI evaluation

### Installation

```bash
git clone https://github.com/trishaingle2006/preptrack-ai.git
cd preptrack-ai
npm install
cd functions
npm install
cd ..
```

Copy `.env.example` to `.env` and provide the Firebase web configuration:

| Variable | Purpose |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase web application ID |
| `VITE_FIREBASE_APP_CHECK_SITE_KEY` | Optional reCAPTCHA Enterprise site key |
| `VITE_API_BASE_URL` | Optional API base URL; blank uses the same deployment |

Start the development server:

```bash
npm run dev
```

Never place `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT`, `SECURITY_PEPPER`, or other server secrets in a `VITE_` variable. Vite variables are delivered to the browser.

## Quality verification

Run both checks before submitting or deploying:

```bash
npm run lint
npm run build
```

The final production release passes ESLint and the Vite production build. It includes route-level code splitting, page preloading, loading feedback, an application error boundary, direct-route refresh support, and reduced-motion support.

The interface has responsive breakpoints for desktop, tablet, standard mobile, narrow mobile, and short-height devices. Mobile navigation uses an independent scroll region so the account profile and Sign out control remain accessible.

## Deployment

The React application and authenticated API are deployed together on Vercel. Firestore rules and indexes are deployed through Firebase CLI.

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes
npx vercel --prod
```

Configure these server-only production secrets in Vercel:

- `GEMINI_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT`
- `SECURITY_PEPPER`

Do not commit their values. The repository ignores `.env`, Firebase service-account files, build output, logs, and local deployment metadata.

## Security measures

- Firebase ID tokens are verified on authenticated API requests.
- Roles and account status are checked again on the server.
- Firestore rules prevent users from modifying their own role or status.
- Administrative, mentor, AI, and challenge inputs are validated server-side.
- AI usage is rate-limited per authenticated user.
- Password recovery uses Firebase's time-limited, single-use action codes.
- Login activity, device sessions, session replacement, and security alerts are recorded.
- Resume and interview text is treated as untrusted input before AI processing.
- Secrets remain in deployment environment variables rather than client code.

## Verified project evidence

- Adaptive interview completed with Easy → Medium → Hard progression and a 10/10 report.
- Amazon practice simulation completed at 9.4/10 against a 7.5/10 simulated threshold.
- Placement readiness history improved from 69/100 to 71/100 after additional evidence.
- A peer challenge achieved 95/100, rank #1, a one-day streak, and two badges.
- Email verification, password recovery, active-session replacement, login history, device alerts, and unauthorized-route blocking were exercised.
- Administrator user management and Mentor student review/feedback were verified with separate role accounts.

These values demonstrate tested workflows in the development dataset; they are not fixed application results.

## Current limitations

- Gemini availability and quotas depend on the configured Google AI project and free-tier limits.
- AI evaluation supports preparation and coaching but should not replace human hiring decisions.
- Password-reset email inbox placement is controlled by the recipient's email provider and cannot be guaranteed by client code.
- Peer rankings reflect candidates stored in the connected Firebase project.

## Internship deliverables

- [Live production application](https://preptrack-ai-sepia.vercel.app)
- [GitHub source repository](https://github.com/trishaingle2006/preptrack-ai)
- Project plan and completed requirements checklist in the repository
- Internship report in `deliverables/PrepTrack_AI_Internship_Report_Trisha_Ingle.docx`

## Author

**Trisha Ingle** — Frontend Developer and Computer Science Student

Built as an educational internship project for placement preparation and career-readiness learning.

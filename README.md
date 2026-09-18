# Orbit — Student Life OS

**A desktop-first web application. Built by Rajkamal.**

Orbit turns academic, career and personal responsibilities into a realistic daily schedule. It runs in your browser and stores each account's data on the server. It is not an Android or iOS application.

## Run on Windows

1. Install **Node.js 24 LTS** from [nodejs.org](https://nodejs.org/).
2. Extract the project folder into `Documents\Student-Life-OS`, or run `Install-In-Documents.ps1` from the extracted folder.
3. Double-click `Start-Orbit.cmd` and open **http://localhost:3000**.
4. Create an account. Alternatively, choose **Explore a sample workspace** for isolated fictional data.

The local application runs without a database service or an AI key. SQLite records are created in `data/orbit.sqlite`. Keep the terminal open while using the application. Stopping the server does not remove records.

Command-line alternative:

```powershell
cd "$([Environment]::GetFolderPath('MyDocuments'))\Student-Life-OS"
npm start
```

For development and automated tests:

```sh
npm ci
npm test
npm run build
```

`npm ci` installs the optional hosted PostgreSQL driver and the DOM test dependency. Neither is required just to run local SQLite mode with `npm start`.

## Included functionality

- Email/password registration, login, logout, account deletion, server-side sessions and user-isolated persistence.
- Task creation, editing, filtering, search, importance, due dates, progress, completion and reopening.
- Natural-language task capture with local rules; optional model-assisted interpretation with review before saving.
- Task decomposition and goal-linked steps.
- Daily time-block planning around weekly classes and imported fixed calendar events.
- Workload limits, breaks, partial task sessions and deferral of work that does not fit.
- Completion tracking with actual durations and a focus-session timer.
- Behavioural learning through weighted actual/estimated duration ratios by life area.
- Missed-session reasons and dynamic rescheduling from the remaining day.
- Deadline-risk flags based on cumulative workload and available capacity.
- Academic, career, wellness, personal, finance and digital goals.
- Habits, selected weekdays, check-offs, history and streaks.
- Sleep, water, steps, workouts, mood and meal/nutrition notes.
- Income, expenses, categories, monthly budget and savings transfers.
- Screen-time, distraction and productive-time records.
- Personalised insights about deadlines, sleep, estimates, balance, spending and interruptions.
- Voice assistant: task capture, navigation, read-aloud schedules, planning, focus and reviewed completion.
- ICS calendar export and guarded calendar import; wellness, digital and finance CSV imports.
- JSON data export and validated backup restoration.
- Responsive browser interface, keyboard-friendly controls and persistent “Built by Rajkamal” credit.

Detailed requirement mapping and limitations: [docs/FEATURE-COVERAGE.md](docs/FEATURE-COVERAGE.md).

## Voice assistant

Click **Voice assistant**, select a recognition language, then **Listen**. Review the transcription and click **Run command**.

Examples:

- `Add task finish my Java assignment by Friday, 90 minutes`
- `Plan my day`
- `Replan my remaining day`
- `Open goals`
- `Read my plan`
- `Complete task [exact pending task title]`
- `Focus on [exact pending task title]`

Recognition is browser-dependent. Chrome or Edge may offer the Web Speech API; it can require internet and microphone permission. A typed-command fallback remains available. Recognition may be processed by the browser vendor. Orbit does not store microphone audio. Readout uses browser speech synthesis. Hindi recognition is selectable, with a small set of Hindi command prefixes; local task interpretation primarily supports English. This is a command assistant, not unrestricted conversational AI.

## Optional model-assisted task interpretation

Copy `.env.example` to `.env`, then configure `OPENAI_API_KEY` and `OPENAI_MODEL` on the server. Restart the application. In **Quick capture**, explicitly select **Use AI** to send the entered text and current date to the provider. Other account data is not sent by this feature.

The server validates structured model output. If the provider fails, it returns labelled local-rule results. No key is embedded in frontend files. Scheduling, risk estimation and learning are deterministic, transparent heuristics; there is no claim of a trained clinical, financial or predictive model.

## GitHub target

Requested target: **rajkamalbhakat/Student-Life-OS**.

This source package does not claim that the repository already exists or has been pushed. `Push-To-GitHub.ps1` verifies that GitHub CLI is authenticated as `rajkamalbhakat`, creates a **private** repository if needed, then pushes the local `main` branch. It will not force-push or switch to another account.

Prerequisites: Git and GitHub CLI installed; authenticate in your own terminal using `gh auth login`. Do not paste passwords or tokens into chat.

```powershell
.\Push-To-GitHub.ps1
```

Alternatively, connect `rajkamalbhakat` to ChatGPT's GitHub integration, create an empty repository named `Student-Life-OS`, and grant access to that repository for a connector-based push.

## Architecture

- `public/`: vanilla JavaScript modules, semantic HTML, CSS, pure planner and import/voice logic.
- `server/`: HTTP API, input validation, password hashing, sessions and database adapters.
- `data/`: local SQLite file, created automatically and excluded from Git.
- `tests/`: scheduling, parsing, imports, API isolation and interface workflow tests.
- `scripts/build.js`: creates production frontend files in `dist/`.
- `api/index.js`, `vercel.json`: optional future hosting configuration. **No deployment was performed.**

The database is a versioned JSON document per account plus users, sessions and rate-limit tables. Updates use compare-and-swap versioning; concurrent tab edits are rejected rather than silently overwritten. Passwords use salted scrypt; sessions use random tokens stored as hashes and HttpOnly cookies. Local server binds to loopback. Hosted mode requires a persistent PostgreSQL `DATABASE_URL` and secure origin configuration.

## Boundaries

Automatic OAuth connections to live calendars, wearables, banking and OS screen-time services are not provisioned. The supplied file import/export adapters work independently; match their templates before import. This project does not silently claim that a CSV import is a live API connection.

The application uses your browser's local dates and time zone. Local mode is one-machine hosting. No email verification or password-reset email service is configured. Keep a backup of `data/` and/or use JSON export. No paid provider account or hosting service is created automatically.

## References

- [Node.js SQLite API](https://nodejs.org/api/sqlite.html)
- [Web Speech recognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [Web Speech synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [iCalendar specification](https://www.rfc-editor.org/rfc/rfc5545)
- [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)

## AI assistant update

The sidebar now includes **AI assistant** for study/coding questions and optional planning suggestions grounded in your own tasks, goals, commitments and schedule. The key stays on the server; sharing account context is opt-in. Conversation is temporary and advice does not automatically modify records.

Follow [docs/AI-SETUP.md](docs/AI-SETUP.md) to update an existing Windows installation without losing `data/`, add your API key and start the assistant. Live AI requires a valid key and provider availability; automated tests use mock responses.

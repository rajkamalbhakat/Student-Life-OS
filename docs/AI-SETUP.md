# Enable Orbit AI on your Windows computer

## Update your existing installation

1. Stop Orbit with Ctrl+C in its command window.
2. Extract the updated ZIP into a separate temporary folder.
3. Copy the updated `public` and `server` folders into your existing project folder (the one containing `package.json`). Choose Replace for matching code files. Also copy this `docs/AI-SETUP.md` if desired.
4. Keep your existing `data` folder and `.env` file. They contain your records and configuration. Do not replace them with another installation.

No extra package is needed for the AI feature. It uses Node.js's built-in HTTPS fetch support.

## Set up your key

Create an API key in your own OpenAI Platform account at https://platform.openai.com/api-keys. The account must have access to the selected model and available API usage. Keep your key private.

In VS Code, create a file named `.env` next to `package.json`. If that file already exists, edit its existing AI entries rather than replacing other settings. Add:

```dotenv
OPENAI_API_KEY=replace_with_your_actual_key
OPENAI_MODEL=gpt-4.1-mini
```

The shown value is a placeholder, not a working key. Do not put the key in `public/app.js`, a browser form or a GitHub commit. `.env` is already excluded by `.gitignore`.

Start Orbit:

```powershell
npm.cmd start
```

Open http://127.0.0.1:3000 and refresh the page. Sign in and choose **AI assistant** in the sidebar.

## What is integrated

- General study and coding Q&A.
- Goal breakdown and project guidance.
- Optional personal planning advice from your pending tasks, goals, commitments and current plan.
- Existing model-assisted Quick capture for creating structured task suggestions.
- Voice command `Open AI assistant` opens the new screen. Existing voice dictation for task capture remains available; this update does not implement full-duplex conversational voice.

The AI screen does not automatically modify your records. Review advice, then use Tasks and Planner to apply it. The deterministic scheduler still enforces time windows and task budgets.

## Data sent to AI

Every question sends the entered text, today's date and up to 12 recent conversation messages. If you select the sharing checkbox, the server also reads a limited planning summary from your own account. It excludes your profile name/email, task notes, financial transactions, wellbeing logs and digital-activity logs. Information you put directly in a message or a task/goal title can still be included.

Changing the sharing checkbox clears the existing conversation to avoid sending prior context under a different sharing choice. Conversations stay in tab memory and are cleared by reload/sign-out. Requests specify `store:false`; this does not imply that the provider has no operational retention. Consult the provider's data policy for your account.

## Errors

- **Setup needed / AI not configured:** check `.env` spelling and location; stop and restart Orbit, then refresh the page.
- **Key/model access rejected:** verify the key and selected model in your provider account.
- **Usage or rate limit:** check provider quota/billing and wait before retrying.
- **Could not reach provider:** check internet access.
- **Incomplete response:** shorten the question.

The app also limits AI requests per user. AI chat never substitutes a local canned answer when a provider request fails. Quick capture retains its explicitly labelled local-rule fallback.

## Verification

Automated tests use mocked provider responses for successful text output, key handling, opt-in context, HTML escaping, missing keys, rate limits, provider errors and timeouts. Real provider calls and microphone interaction have not been verified because no real key or microphone is available in this build environment.

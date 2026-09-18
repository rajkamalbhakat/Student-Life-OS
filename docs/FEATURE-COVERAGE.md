# Requirement coverage

Source: the supplied two-page “AI-Powered Student Life Management Platform” concept. Additional user requests: web application, voice assistant, “Built by Rajkamal” credit, GitHub target `rajkamalbhakat`, and no deployment.

| Requirement | Implementation | Boundary |
|---|---|---|
| Student profile and constraints | Settings, daily start/end, task budget, breaks, personal targets | Device-local date/time convention |
| Academics: classes, assignments, exams, projects | Tasks with Academics area; timetable commitments; goals and deadlines | Subject-specific fields are represented by titles/notes |
| Career: DSA, coding, projects, certifications, internships | Career tasks and measurable goals; focus sessions | No external course/internship feed |
| Fitness, running, nutrition, sleep and hydration | Daily wellness logs, wellness goals and tasks | Nutrition is meal notes; no diagnostic or calorie database |
| Personal responsibilities, hobbies and routines | Personal tasks, repeating habits and goals | Habits have explicit weekly schedules |
| Finances | Income, expenses, savings, category breakdown and budget | INR, manual or CSV records; no bank connection |
| Digital behaviour | Screen/distraction/productivity logs and insights | Manual/CSV import; no OS surveillance |
| Natural-language input | Weekdays, today/tomorrow, dates, durations, domains, importance | Local grammar is limited; optional AI needs a key |
| Task decomposition | Three local actionable steps or 3–5 optional AI steps | Suggestions must be reviewed; goal progress stays explicit |
| Prioritisation | Deadline urgency, importance, linked goals and effort | Transparent heuristic rather than a trained ranking model |
| Achievable scheduling | Subtract commitments, respect task budget, split sessions, add breaks | Unscheduled work is retained and clearly listed |
| Behavioural learning | Bounded weighted actual/estimated ratios across the latest 20 sessions per area | Learns duration calibration, not every behavioural trait |
| Adaptive rescheduling | Record missed reason/time lost and regenerate remaining windows | Does not edit external calendars automatically |
| Deadline risk | Compare cumulative due workload to available capacity with a 20% reserve | Heuristic risk flag; no guaranteed prediction |
| Personalised insights | Deadline, sleep, overrun, life-area balance, spending, digital and missed-session patterns | Based only on actual stored input |
| Completion tracking | Whole-task, session and partial focus completion | Actual duration must be supplied or reviewed |
| Calendar integrations mentioned as future work | ICS export and supported event imports | Automatic sync is not configured; recurrence/TZID imports rejected |
| Wearable integrations mentioned as future work | Template-based wellness CSV imports | No provider-specific live wearable API |
| Screen-time APIs mentioned as future work | Template-based digital CSV imports | No live OS API access |
| Finance integrations mentioned as future work | Template-based transaction CSV imports | No live banking API access |
| Voice assistant (additional request) | Speech-to-text, typed commands, navigation, capture, planning, reviewed completion, readout | Browser support/permission needed; physical microphone not verified here |
| Website, not mobile application | Desktop sidebar, browser UI and responsive smaller layouts | No native mobile build |
| Attribution | Sidebar, sign-in screen, mobile footer, page title, README | Built by Rajkamal |
| Local Documents folder | Source folder plus non-overwriting Windows copy helper | This remote environment cannot write to the user's Windows Documents directly |
| GitHub push | Local commit and guarded account-specific publishing script | Actual push requires authorised access to rajkamalbhakat and a repository |
| Deployment | Omitted at the user's direction | Configuration retained for possible future use only |

## Planning behaviour

1. Subtract fixed commitments from the configured day window.
2. Bound work and breaks by the remaining daily budget, adjusted down 25% for logged sleep under 6 hours.
3. Deduct already logged actual work from the day's remaining budget.
4. Rank pending tasks by due date urgency, importance, linked goals and effort.
5. Adjust remaining task estimates with the learned duration ratio.
6. Fill time windows with sessions of at most 50 minutes, inserting the selected break length.
7. Keep every portion that does not fit in a visible deferred list.
8. Record completion/miss history and reuse it in subsequent planning.

## Data ownership

Each authenticated user owns a distinct versioned document. No application screen reads another user's document. Export and restore operate on the signed-in account. Deleting an account removes its document and sessions through foreign-key cascades. Sample workspaces are isolated and labelled fictional.

# Katha — AI-Powered Adaptive Learning Through Stories

> Learn the concept. Live the story. Check understanding. Strengthen what needs practice.

## 🎯 Problem Statement

Children aged **6–12** often memorise school concepts without understanding them. Worksheets are passive, one-size-fits-all, and teachers/parents rarely see *which* idea a child misunderstood.

**Katha** turns any school topic into an interactive adventure story that **checks understanding inside the story**, **re-teaches when a child is wrong**, and produces a **learning report** showing mastery and misconceptions.

| Need | How Katha solves it |
| --- | --- |
| Engagement | Personalised story worlds, illustrations and read-aloud narration |
| Understanding, not memorisation | Checkpoint questions embedded in each chapter |
| Personalised support | Wrong answers trigger an adaptive re-teach before retrying |
| Visibility for parents/teachers | Report with concept mastery, misconceptions and next steps |
| Age-appropriate content | Age bands (6–7, 8–9, 10–12) drive difficulty and suggestions |

**Vertical:** Education / EdTech

## ⚙️ How It Works

1. The child picks **age, subject/topic, story world, difficulty and length**.
2. Katha generates a chapter-based adventure (AI, with an offline fallback).
3. Each chapter has an **illustration, narration and a checkpoint**.
4. Answers are evaluated: correct → advance + XP; incorrect → **re-teach the concept**, then retry.
5. A **Learning Report** shows mastery per concept, misconceptions and engagement time.

## 🏗️ Architecture

```text
 Create form ──► validation.ts ──► AI server functions (src/lib/ai/*.server.ts)
                                        │  (fallback on error/offline)
                                        ▼
                                 local-generator.ts
                                        │
                                        ▼
 Story player ◄── story-store.ts (localStorage + Lovable Cloud sync when signed in)
      │
      ▼
 adaptive.ts (adaptAfterAnswer, computeMastery) ──► Learning Report
```

| Layer | Location | Responsibility |
| --- | --- | --- |
| Screens | `src/routes/` | Create, story player, report, profile, auth |
| UI | `src/components/` | Header, footer, chapter image, UI primitives |
| Domain logic | `src/lib/` | Validation, adaptation, mastery, suggestions, local generator |
| Types | `src/lib/story-types.ts` | Shared strict TypeScript interfaces |
| AI (server-only) | `src/lib/ai/` | Story & image generation through a server-side gateway |

## 🔐 Security

- AI keys are read **only on the server** (`process.env`), never shipped to the browser.
- All user input is validated (age 6–12, topic ≤ 80 chars, allowed world/difficulty/length).
- Database access is protected by row-level security; users only see their own stories.
- `.env` secrets are not committed; only publishable keys are used client-side.

## ⚡ Efficiency

- Local-first storage: stories load instantly from the device, then sync in the background.
- Offline story generator means the app works even when AI is unavailable.
- Server-rendered routes with code-splitting per page.

## ♿ Accessibility

- Semantic landmarks, headings and `lang="en"`.
- Answer buttons expose `aria-pressed` and spoken "correct / incorrect" labels — never colour alone.
- Feedback is announced via `aria-live` regions.
- Narration controls with clear labels for screen-reader users; read-aloud for early readers.
- Visible keyboard focus rings and 44 px minimum tap targets.

## 🧪 Testing

- **44 automated tests across 8 suites** (Vitest + Testing Library).
- Covered: input validation, adaptive re-teaching, mastery scoring, engagement time, local story generator, age-band suggestions, AI request tracking, profile stats and routing.
- **CI:** GitHub Actions runs the full suite on every push and pull request (`.github/workflows/test.yml`).

```sh
npm install
npm run test
```

## 🚀 Run Locally

```sh
npm install
npm run dev
```

## 📝 Assumptions

- Users are children aged 6–12, guided by a parent or teacher.
- Content is in English; read-aloud uses the browser's built-in speech.

## 📸 Screenshots

<img width="786" alt="Katha home screen" src="https://github.com/user-attachments/assets/ae3ebeca-50ad-443c-9e34-4f40178a377c" />
<img width="960" alt="Katha overview" src="https://github.com/user-attachments/assets/3558e0a7-4958-4fe8-826f-d4ec76b9b022" />
<img width="831" alt="Create a story" src="https://github.com/user-attachments/assets/6781c634-7e31-4d1b-ad19-457df81986b5" />
<img width="960" alt="Story chapter" src="https://github.com/user-attachments/assets/90fcbcb5-e262-489c-b80c-2fe897a9c96e" />
<img width="859" alt="Checkpoint question" src="https://github.com/user-attachments/assets/5b635c7f-3510-448f-a082-35b71ab2f0de" />
<img width="960" alt="Adaptive re-teach" src="https://github.com/user-attachments/assets/2f07d72c-f864-47ad-ba51-5d531a8c5bf1" />
<img width="960" alt="Learning report" src="https://github.com/user-attachments/assets/d49f08e5-e243-414d-89f1-b8134c37b71e" />
<img width="960" alt="Profile" src="https://github.com/user-attachments/assets/38cefb85-1f8b-4970-8de3-9c73e57e2d24" />

## 🌟 Vision

Make every learning concept a story worth exploring — and every child's learning journey personalised.

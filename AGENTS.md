<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- StoryQuest AI was imported from github.com/HASASRI/ai-hackathon-champion; keep its local-first design: `src/lib/story-store.ts` persists to localStorage and mirrors to Lovable Cloud (stories, story_sessions, profiles) when signed in.
- AI story/image generation lives in server-only modules under `src/lib/ai/` and uses the Lovable AI Gateway via `LOVABLE_API_KEY`; never call the gateway from browser code.

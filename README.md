Our Project for the Gemini Hackathon!

# Resources

## Gemini Hackathon Devpost

https://gemini3.devpost.com/

## Past Winning Projects

https://ai.google.dev/competition

## FigJam Brainstorning

https://www.figma.com/board/aduArXBmgmKPzy6tMLyQNa/Gemini-3-Hackathon?node-id=128-193&t=MXIF1KZeTaXcH1KP-1

# Getting Started

## Target words (single source of truth)

The list of target words lives in **`target-words.json`** at the repo root. The backend reads it directly. The React app uses a copy under `react/src/data/`; that copy is updated automatically when you run `npm run dev` or `npm run build` in `react/`. To change the words, edit `target-words.json` at the root, then run `npm run sync-words` in `react/` if you need the frontend updated without running dev/build.

# Run backend

```
uv run uvicorn main:app --reload
```

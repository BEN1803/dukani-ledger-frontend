# dukani-ledger

Next.js 16.2.11 + React 19 + Tailwind CSS v4 + TypeScript 5. App Router.

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | dev server on :3000 |
| `npm run build` | production build |
| `npm run start` | serve production build |
| `npm run lint` | ESLint (flat config) |

No test framework installed yet.

## Project structure

- `app/` — App Router pages (`layout.tsx`, `page.tsx`, `globals.css`)
- Path alias `@/*` → project root (e.g. `import x from "@/app/..."`)

## Toolchain quirks

- **React Compiler** enabled via `next.config.ts` (`reactCompiler: true`). The babel plugin (`babel-plugin-react-compiler`) is in devDependencies. Codegen may add `"use memo"` directives; do not strip them.
- **Tailwind CSS v4** — uses `@import "tailwindcss"` and `@theme inline` (not the v3 `@tailwind` directives or `tailwind.config`).
- **ESLint flat config** — `eslint.config.mjs`, not `.eslintrc.*`.
- **TypeScript strict mode** enabled; no unchecked index access or implicit any.

# iPhone Preview — NOAH Morning Brief

This feature branch is a **demo**. The `/review` page uses Mock Events; `/discovery` is unverified RSS discovery. Do not distribute as a verified report.

## Open on iPhone

1. Open https://github.com/codespaces/new/Grei8888/NOAH.ark.ai/tree/chatgpt/morning-brief-mvp in Safari while signed into GitHub.
2. Create the Codespace on the `chatgpt/morning-brief-mvp` branch. If GitHub does not preselect it, manually choose that branch.
3. Once Codespaces loads, open Terminal and run `npm run dev` (dependencies are installed by the devcontainer post-create step).
4. In the Ports tab, open the forwarded port 3000 URL. Keep its visibility **Private**.
5. Append `/review` for the mobile Cool Gray UI, or `/discovery` for live but unverified RSS candidates.

If port 3000 is not forwarded, use the Ports tab to forward it manually. GitHub may ask you to sign in again when opening a private port. Do not share the private preview URL with colleagues.

## Deployment decision

A persistent iPhone preview without launching Codespaces requires an authorized deployment host such as Vercel. Do not expose a public deployment until Mock/demo warnings and access policy are reviewed. No hosting account or production delivery is connected by this branch.

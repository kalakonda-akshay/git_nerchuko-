# Continue GitQuest (paste this into a new Claude chat, attach this zip)

You are continuing a static, no-build web app "GitQuest": an interactive Git and GitHub learning site modelled on gitmastery.me (Home, Playground, Arcade, Install, FAQ, Leaderboard, Shop, mini games, difficulty, unlockable themes).

## Existing files
- play.html: the main app. Single file. A JS Git simulator (state R: commits c, branches b, HEAD H/det, working dir wd, index idx, remote rem/rb, stash, tags, pr). run(line) parses commands. LV[] holds missions {t,g,why,s:setup,c:check,h:hint}. SVG commit graph, XP/stars saved in localStorage key "gq". Includes 3D difficulty selection onboarding modal (Beginner, Advanced, Pro), blind terminal mode on Pro, 3D bottom ticker tape, and 3D tilt effects.
- shop.html: spend XP on terminal themes (Classic Slate, Obsidian Dark, Matrix Phosphor, Golden Amber) and synthesized Web Audio sounds.
- sound.js: zero-dependency Web Audio API synthesizer for tactile clicks, command execution, error buzz, and victory fanfare.
- shared.js: shared theme sync across all pages, applying `data-term-theme` and `data-theme`, plus 3D parallax mouse tracking.
- index.html, install.html, faq.html, arcade.html (Command Match game, best in localStorage "gqa"), leaderboard.html (local only), style.css.

## Todo, in priority order
- [x] 1. Shop: spend XP on terminal themes (dark, matrix, golden) and sounds. Apply across all pages.
- [x] 2. Difficulty setting (easy shows hints, hard hides graph) and per-mission star rules.
- [ ] 3. More missions: merge conflicts (mini editor with markers), rebase, cherry-pick, reflog, bisect, .gitignore, forks, issues, code review.
- [ ] 4. More arcade games: branch-graph puzzle, commit champion, merge master.
- [ ] 5. Cheat sheet page with search; playground page with free sandbox plus file editor and diff view.
- [ ] 6. Shared leaderboard via a small backend (Supabase or Firebase), with nicknames.
- [ ] 7. Certificates and shareable progress cards.
- [ ] 8. Make nav and theme shared across pages (one JS/CSS include), responsive, accessible, keyboard focus visible.

## Rules
Keep it static HTML/CSS/JS (no build step). Make targeted, minimal edits; do not rewrite files that work. Infer context from the files instead of asking me questions. Keep the visual style: orange accent, Bricolage Grotesque and JetBrains Mono, light/dark themes. Do the todo items one at a time, starting with 1, and give me the updated zip after each.

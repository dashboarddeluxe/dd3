# Product

## Register

product

## Users

The site owner — a daily power user who opens dozens of bookmarks across work, hobbies, and errands. Context is usually a desktop or phone browser, often late evening, wanting the fastest path to a known URL without hunting through browser bookmarks or typing from memory.

## Product Purpose

Dashboard Deluxe 3 is a personal link launcher: one scrollable page of categorized shortcuts to websites and resources. Success means finding and opening any link in under five seconds, with keyboard search (`/`) as the primary accelerator. Content lives in markdown and YAML so links stay editable without touching layout code.

## Brand Personality

**Utility, direct, familiar.** The interface should feel like a well-organized desk drawer — not a marketing site, not a social feed. Dark ground and amber accent signal a private tool used often, not shown off. Inter is a deliberate choice: readable, neutral, self-hosted.

## Anti-references

- AI landing-page templates (hero metrics, gradient text, eyebrow kickers, identical icon-card grids)
- Warm cream / sand body backgrounds and decorative glassmorphism
- Onboarding modals, tutorials, or anything between the user and their links
- Reinvented navigation patterns — standard header, search, and anchor jumps are correct here

## Design Principles

1. **Speed over ceremony** — No page-load choreography; content is visible immediately.
2. **Keyboard-first** — `/` to filter, `Esc` to clear; mouse is optional.
3. **Dense but scannable** — Many links per screen; hierarchy via section titles and group labels, not decoration.
4. **Data drives UI** — New categories and link groups come from markdown/YAML, not new components.
5. **Honest feedback** — Search, nav state, and empty results always tell the user what happened.

## Accessibility & Inclusion

Target WCAG 2.1 AA for text contrast and focus visibility. Full keyboard navigation for search and category jumps. Respect `prefers-reduced-motion` for scroll behavior. Screen-reader announcements for search filter results and zero-match states.

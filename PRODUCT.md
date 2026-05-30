# Product

## Register

product

## Users

Three co-equal users, each in a different context:

**School / University Admin** — sits at a desktop or laptop in an office or staffroom, typically in a Nigerian school. Managing the full institution: classes, teachers, students, assessments, scores, report cards, CBT exams. High-stakes work (official records, end-of-term deadlines). Needs density, control, and confidence that the data is right.

**Teacher / Lecturer** — laptop or tablet, between lessons or in a staffroom. Primary tasks: entering scores, marking attendance, writing comments, managing their assessments. Time-constrained. Needs low-friction workflows, not UI to admire.

**Student** — any device, exam conditions. Either taking a live CBT exam (nervous, focused, on a school computer) or checking results and report cards. Needs extreme clarity, zero distraction, and a design that signals "this is official and trustworthy."

## Product Purpose

ParaLearn is a cloud-based School Management and Assessment Platform for K-12 schools and universities in Nigeria. It manages the full academic cycle: sessions, classes, subjects, assessments (offline and online CBT), scoring, attendance, comments, report cards, and AI-powered lesson generation.

Success looks like: a school admin who finishes end-of-term report card approvals in under 30 minutes, a teacher who enters scores for 40 students without hunting for the right button, and a student who starts and submits an exam without confusion.

## Brand Personality

Trusted · Efficient · Professional

Voice: direct, calm, precise. No exclamation marks. No filler words. Every label earns its place. The interface should feel like a well-run institution, not a startup.

Emotional goals: confidence (the data is right), speed (the task is done), dignity (this software respects its users).

## Reference

**Linear** — dark, precise, typographically sharp. Every pixel intentional. Fast feels fast. The design language: strong weight contrast in type, generous but non-uniform whitespace, minimal color use, interactions that have zero lag feeling.

Apply the Linear sensibility to a light-mode product (the physical scene forces light, not dark — bright Nigerian school offices, shared classroom computers, daylight).

## Anti-references

- **Generic SaaS purple/blue AI gradient**: rounded everything, gradient CTAs, Inter font, glassmorphism cards, "Elevate your workflow" copy. The exact pattern to reject.
- **Bloated admin templates (AdminLTE / Bootstrap Admin)**: sidebar with 40 links, card overuse, inconsistent spacing, grey toolbars. What the current state of many school management tools looks like — ParaLearn is the upgrade.
- **Consumer fintech hero aesthetics**: neon, dark hero sections, marketing-forward even inside the product shell.

## Design Principles

1. **Data is the hero.** The interface recedes. Student names, scores, and class lists are what the admin came for. Decoration competes with them.

2. **Speed is respect.** Every interaction should feel instant. Sluggish transitions, over-animated modals, and spinners where there should be skeleton loaders all signal that the user's time doesn't matter.

3. **Earned trust through precision.** Report cards, scores, and official records are legal documents in Nigerian schools. The design must signal care and accuracy: consistent alignment, clear hierarchy, no ambiguity in data display.

4. **Density without crowding.** Admins manage hundreds of students and dozens of classes. The interface should pack information purposefully, using typographic contrast and spacing rhythm rather than cards and borders to separate data.

5. **One product, consistent language.** Admin, teacher, and student portals share the same visual language. A student who becomes a teacher next year should not feel lost.

## Accessibility & Inclusion

- Target WCAG 2.1 AA minimum.
- Color contrast: all text must pass 4.5:1 (normal) or 3:1 (large/bold). The accent color (refined violet/purple) must not be the sole carrier of meaning.
- Touch targets minimum 44×44px — teachers and students may use phones and tablets.
- Reduced motion: honor `prefers-reduced-motion`. No mandatory animations.
- No reliance on color alone for status (use icons + color together for states like pass/fail, present/absent).
- Forms must have visible labels (never placeholder-only).

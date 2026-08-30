I-BB Barrier Rubric

A web tool for administering the Preliminary I-BB Barrier Inventory (Distance from Effect, Lack of Knowledge/Awareness, Perception of Inconvenience) across configurable behavioural domains, with responses stored in Supabase.

What this is

Part of a doctoral dissertation developing the Intention–Behaviour Barrier (I-BB) Framework. This tool administers the same 15 fixed rubric items under different scenario/behaviour descriptions ("domains"), tracks multiple respondents per domain, and computes a three-value barrier profile (DFE, LKA, POI) per respondent and aggregated per domain.

Status: preliminary, unvalidated research instrument. Not a validated psychometric scale.

Live site

Deployed via GitHub Pages at: https://<your-github-username>.github.io/<repo-name>/

Two ways to access it
Path	Who it's for	What they see
Root URL (no parameters)	Researcher	PIN-gated dashboard — create domains, generate respondent links, view aggregated results, export CSV
?domain=<domain-name>	Participants	Consent screen → questionnaire → thank-you. No access to other domains, results, or admin controls

Generate a respondent link from the researcher dashboard ("Copy respondent link" on any domain card) — don't hand-type the URL, since the domain name must match exactly.

Setup — deploying this yourself
Create a public GitHub repository.
Add this file as index.html at the repo root.
Repo Settings → Pages → source: deploy from branch → main, folder / (root).
Wait a minute or two for the first deploy; GitHub will show the live URL under Settings → Pages.

No build step, no dependencies to install — it's a single static HTML file.

Backend

Data is stored in a Supabase project (Postgres), connected via the public anon key embedded in this file (this is expected and normal for a client-only static app — see Security model below).

Schema:

domains (name, scenario, behaviour) — one row per behavioural domain.
respondents (domain_name, respondent_code, prolific_id, dfe, lka, poi, attention_failed, attention_total, started_at, duration_seconds) — one row per completed response.

Respondent codes (R001, R002, ...) are assigned atomically by a database trigger, not the client, so they stay unique even if two people submit at nearly the same moment.

Security model — read this before collecting real data
Domain creation and viewing results require a PIN, checked server-side via two Postgres functions (create_domain_secure, get_domain_respondents_secure) — not just a JavaScript gate. Someone with only the public API key cannot read response data even by inspecting network requests.
Submitting a response requires no PIN (by design — participants shouldn't need researcher credentials).
The PIN itself lives in two places that must match: the RESEARCHER_PIN constant near the top of the <script> block, and the hardcoded value inside both Postgres functions. Changing one without the other will break the researcher dashboard. To change the PIN: update the JS constant, then re-run a migration updating both SQL functions with the new value.
This is appropriate for a preliminary research pilot with no sensitive personal data (only a Prolific ID, which is itself pseudonymous). It is not equivalent to real user authentication — do not extend this pattern to collect identifiable or sensitive data without adding proper auth (e.g., Supabase Auth).
Editing the rubric items

The 15 items (ITEMS array) and 2 attention checks (ATTENTION_ITEMS array) are hardcoded near the top of the <script> block, intentionally — the domain/scenario is meant to change, the items are not. To revise item wording, edit the array directly and redeploy; there's no admin UI for this by design, to prevent accidental drift between domains.

Local testing before deploying

Because this uses fetch to talk to Supabase, opening the file directly (file://) may be blocked by the browser depending on your setup. Test with a local server instead, e.g. from the folder containing index.html:

python3 -m http.server 8000

then visit http://localhost:8000.

Related documents

This tool implements the instrument specified in ibb_barrier_inventory.md (full item development and rationale) and ibb_questionnaire_dissertation_domains.md (the three dissertation-specific domain referents). See ibb_traceability_matrix.md for literature sourcing behind each item.

+++
title = "Du er offline"
description = "Beveren har lagret dine leste notater slik at du kan fortsette å lese offline."
date = 2026-05-23
template = "page.html"
+++

Akkurat nå har du mistet tilkoblingen til internett. Men fortvil ikke! Beveren 🦫 har jobbet iherdig i bakgrunnen og lagret de delene av hagen du allerede har besøkt.

Under finner du en oversikt over alle notatene som ligger lagret lokalt på enheten din, og som du kan **lese akkurat nå** helt uten internett:

---

<div class="offline-explorer">
  <ul id="offline-links" class="offline-links-list">
    <li class="offline-status">Søker etter lagrede notater på enheten din...</li>
  </ul>
</div>

---

### Hvorfor er notater tilgjengelig offline?
Nettstedet bruker en moderne teknologi kalt **Service Worker**. Når du leser et notat med internett tilkoblet, lagrer nettleseren din automatisk en lett kopi på enheten din. Neste gang du mister dekning (for eksempel på toget eller på hytta), sørger beveren for at disse notatene hentes direkte fra maskinen din på et blunk!

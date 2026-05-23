+++
title = "Min Obsidian-arbeidsflyt"
description = "En titt inn i hvordan jeg bruker Obsidian til å bygge mitt personlige kunnskaps-økosystem."
date = 2026-05-22
updated = 2026-05-23
template = "page.html"

[extra]
category = "teknologi"
+++

[Obsidian](https://obsidian.md) har blitt mitt absolutte favorittverktøy for det man kaller *Personal Knowledge Management* (PKM). Siden Obsidian lagrer alt som lokale Markdown-filer, passer det helt perfekt sammen med statiske nettsidegeneratorer.

Dette nettstedet er et direkte resultat av denne strukturerte bever-arbeidsflyten!

---

## Fra tanke til økosystem

Arbeidsflyten min er delt inn i tre enkle steg:

1. **Fange opp (Inbox):** Jeg oppretter raskt et nytt notat i Obsidian når jeg lærer noe nytt eller får en idé. Dette er min råvare – en trestamme som skal bearbeides.
2. **Koble sammen kanalene:** Jeg går gjennom notatene ukentlig og oppretter toveis-koblinger. Koblinger hjelper meg å huske sammenhenger. For eksempel, når jeg skriver om ytelse, kobler jeg det direkte til [Zola static site generator](@/garden/zola-speed.md).
3. **Bygge demningen (Export):** Med et enkelt skript (eller Git-push) kopierer jeg de notatene jeg ønsker å dele offentlig over i `content/garden/`-mappen til Zola-prosjektet mitt.

---

## Hvorfor lokale Markdown-filer er overlegne

- **Fremtidssikret:** Markdown er ren tekst. Selv om Obsidian skulle forsvinne om ti år, kan jeg fortsatt lese alle notatene mine.
- **Portabilitet:** Jeg kan bruke de samme filene i Zola, Hugo, eller bare søke i dem med standard terminalverktøy.
- **Versjonskontroll:** Git gjør det superenkelt å spore endringer over tid.

Hvis du vil lære mer om teorien bak hvorfor jeg foretrekker denne metoden fremfor en tradisjonell blogg, kan du lese notatet mitt om [hvordan notatboken fungerer som et levende økosystem](@/garden/digital-gardening.md).

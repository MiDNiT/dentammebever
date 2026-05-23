+++
title = "Hvorfor Zola er så ekstremt kjapp"
description = "En teknisk titt på hvorfor Zola utkonkurrerer andre generatorer, og hvorfor det er det perfekte valget for et digitalt økosystem."
date = 2026-05-21
updated = 2026-05-23
template = "page.html"

[extra]
category = "prosjekter"
+++

Når målet er å lage en nettside som laster umiddelbart, er [Zola](https://www.getzola.org) et av de absolutt beste verktøyene som finnes. Men hvorfor er det så raskt?

---

## 1. Skrevet i Rust
Zola er bygget fra bunnen av i programmeringsspråket Rust. Rust er kjent for sin ekstreme ytelse, trådsikkerhet og minimale minnebruk. Zola kompilerer hundrevis av sider på bare noen få millisekunder. 

## 2. Én enkelt binærfil (Zero Dependencies)
Mange andre verktøy (som Gatsby, Next.js eller Jekyll) krever at du installerer hundrevis av megabytes med `node_modules` eller Ruby gems. Zola krever ingenting av dette. Det er en enkelt, ferdigkompilert fil som bare kjører. 

Dette betyr:
- Null sårbarheter i tredjepartsavhengigheter.
- Lynrask oppstart (ingen lastetid for node-kjøretid).
- Utrolig enkel distribusjon (du bare kjører en kommando).

---

## Integrasjon med Kunnskapsnettverk

For et personlig [kunnskaps-økosystem](@/garden/digital-gardening.md) er ytelse helt essensielt. Siden vi ønsker å koble sammen hundrevis av notater ved hjelp av en [Obsidian-arbeidsflyt](@/garden/obsidian-workflow.md), trenger vi en generator som klarer å bygge relasjoner (som toveis-koblinger/backlinks) lynraskt uten at byggetiden øker eksponensielt.

Zola løser dette ved å holde hele kunnskapsgrafen i minnet under bygging, noe som gjør at lenkesjekking og backlink-generering skjer parallelt og umiddelbart.

```bash
# Sjekk byggetiden selv!
./bin/zola build
```

Resultatet er en nettside som oppnår 100/100 på Google Lighthouse ut av boksen.

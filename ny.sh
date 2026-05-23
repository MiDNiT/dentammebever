#!/bin/bash

# ==========================================================================
# DEN TAMME BEVER - OPPRETT NYTT INNLEGG
# Enkelt hjelpeskript for å opprette Markdown-filer med riktig frontmatter.
# ==========================================================================

# Farger for terminalen
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # Ingen farge

echo -e "${BLUE}=== Opprett et nytt innlegg for den tamme bever. ===${NC}\n"

# 1. Spør om tittel
read -p "Tittel på innlegget: " TITLE
if [ -z "$TITLE" ]; then
    echo -e "${RED}Feil: Tittel kan ikke være tom!${NC}"
    exit 1
fi

# 2. Velg kategori
echo -e "\nVelg kategori (tast 1-5):"
echo "1) Litteratur"
echo "2) Teknologi"
echo "3) Investering"
echo "4) Sosiologi"
echo "5) Prosjekter"
read -p "Valg: " CAT_CHOICE

case $CAT_CHOICE in
    1) CATEGORY="litteratur" ;;
    2) CATEGORY="teknologi" ;;
    3) CATEGORY="investering" ;;
    4) CATEGORY="sosiologi" ;;
    5) CATEGORY="prosjekter" ;;
    *) echo -e "${RED}Ugyldig valg. Setter kategori til 'generelt'.${NC}"; CATEGORY="generelt" ;;
esac

# 3. Lag slug av tittel (små bokstaver, erstatt mellomrom/spesialtegn med bindestrek)
# Erstatt æøå med aoa for rene URL-er
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/æ/ae/g' | sed 's/ø/o/g' | sed 's/å/a/g')
SLUG=$(echo "$SLUG" | sed 's/[^a-z0-9]/-/g' | sed 's/-\{1,\}/-/g' | sed 's/^-//' | sed 's/-$//')

# Hvis slug ble tom, bruk backup
if [ -z "$SLUG" ]; then
    SLUG="innlegg-$(date +%s)"
fi

FILEPATH="content/garden/${SLUG}.md"
CURRENT_DATE=$(date +%Y-%m-%d)

# 4. Generer innholdet
cat << EOF > "$FILEPATH"
+++
title = "${TITLE}"
description = "Skriv en kort beskrivelse av innlegget her for SEO..."
date = ${CURRENT_DATE}
template = "page.html"
draft = true

[extra]
category = "${CATEGORY}"
+++

Skriv innholdet ditt i Markdown her...

Du kan lenke til andre innlegg ved å skrive standard lenker som:
[Tekst på lenken](@/garden/filnavn-uten-md)
EOF

chmod +x "$FILEPATH" 2>/dev/null

echo -e "\n${GREEN}Suksess! Innlegget ble opprettet:${NC}"
echo -e "Fil: ${BLUE}${FILEPATH}${NC}"
echo -e "\nÅpne filen i din favoriteditor, skriv innlegget og Zola vil oppdatere siden umiddelbart!"

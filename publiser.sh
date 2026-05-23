#!/bin/bash

# ==========================================================================
# DEN TAMME BEVER - PUBLISERINGSSKRIPT
# Bygger produksjonsversjonen av nettstedet feilfritt (ekskluderer utkast)
# og klargjør alt for publisering via Git.
# ==========================================================================

# Farger for terminalen
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # Ingen farge

echo -e "${BLUE}=== Klargjør den tamme bever. for publisering ===${NC}\n"

# 1. Kjør Zola Build i produksjonsmodus (bygger IKKE sider med draft = true)
echo -e "Kompilerer statiske filer..."
./bin/zola build

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}Suksess! Zola-bygget fullført uten feil.${NC}"
    echo -e "Produksjonsklare filer ligger i mappen: ${BLUE}public/${NC}"
    
    # Finn antall publiserte sider
    PAGE_COUNT=$(find public -name "index.html" | wc -l | tr -d ' ')
    echo -e "Totalt generert: ${GREEN}${PAGE_COUNT} nettsider${NC} (utkast med 'draft = true' ble holdt skjult)."
else
    echo -e "\n${RED}Feil: Zola klarte ikke å bygge nettstedet. Sjekk feilmeldingene over!${NC}"
    exit 1
fi

# 2. Sjekk om prosjektet bruker Git
if [ -d ".git" ]; then
    echo -e "\n${BLUE}Git-arkiv funnet. Klargjør Git-endringer...${NC}"
    
    # Vis endrede/nye filer
    git status -s
    
    echo -e "\nVil du lagre endringene og klargjøre for Git-push? (y/n)"
    read -p "Svar: " GIT_CHOICE
    
    if [ "$GIT_CHOICE" = "y" ] || [ "$GIT_CHOICE" = "Y" ]; then
        read -p "Skriv en kort commit-melding (f.eks: 'Nytt innlegg om litteratur'): " COMMIT_MSG
        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="Oppdatering den tamme bever ($(date +'%Y-%m-%d %H:%M'))"
        fi
        
        git add .
        git commit -m "$COMMIT_MSG"
        
        echo -e "\n${GREEN}Endringene er lagret (committed) lokalt!${NC}"
        echo -e "For å publisere dem til nettet, skriv bare:"
        echo -e "  ${BLUE}git push${NC}"
    else
        echo -e "\n${BLUE}Git-lagring hoppet over. Endringene ligger klare lokalt.${NC}"
    fi
else
    echo -e "\n${BLUE}Nettstedet er ferdig bygget i mappen 'public/'.${NC}"
    echo -e "Du kan laste opp innholdet i denne mappen direkte til din webserver!"
fi

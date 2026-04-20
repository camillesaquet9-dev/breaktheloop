---
slug: hackaprompt-llm-security
ordinal: "03"
title: HackAPrompt — LLM red team
tagline: Top mondial sur la compétition LearnPrompting / HackAPrompt
category: llm-security
status: live
year: "2025"
featured: true
role: Offensive LLM researcher — exploits reproductibles, write-ups techniques.
stack:
  - Prompt injection
  - Jailbreak taxonomy
  - Context smuggling
  - RAG poisoning
---

## Contexte

**HackAPrompt** est la plus grande compétition de prompt injection
organisée par LearnPrompting — 3000+ participants, 10 niveaux de
difficulté, modèles évalués incluant GPT-4, Claude, Gemini.

Ma progression sur la compétition m'a amené dans le **top mondial**,
avec des exploits documentés et reproductibles.

## Classes de vulnérabilités travaillées

### 01 — Prompt injection directe
Injection de nouvelles instructions dans un input utilisateur pour
outrepasser le system prompt. Efficace contre les modèles sans
hardening RLHF spécifique.

### 02 — Context smuggling
Faire passer une instruction malicieuse sous forme de donnée
"légitime" (ex : citation d'un email, fragment de code, lien URL).
Le modèle traite le contenu comme du contexte et l'exécute.

### 03 — Jailbreak par rôle
Roleplay / persona forcée — pousser le modèle à adopter un rôle
fictif qui contourne ses garde-fous. `DAN`, `STAN`, et mes variantes
custom exploitant la hiérarchie narrative.

### 04 — Indirect prompt injection (IPI)
Injection via une source externe qu'un agent LLM va ingérer :
document, page web, image (OCR), email. Très puissant contre les
agents RAG ou outillés avec accès navigation.

### 05 — RAG poisoning
Empoisonnement de la base documentaire consultée par un agent :
injection d'instructions dans des documents indexés pour détourner
le comportement lors d'une recherche future.

### 06 — Jailbreak multi-tour
Exploitation de l'érosion des garde-fous sur une longue conversation.
Le modèle devient graduellement plus permissif à mesure que le
contexte s'allonge et que les précédents messages normalisent le
comportement ciblé.

## Méthodologie

- Corpus d'exploits versionnés en git (privé — chaque exploit a un
  bug ID, un severity score, et une vidéo de repro).
- Approche systématique : taxonomie des garde-fous → surface d'attaque
  → primitives → composition.
- Follow d'acteurs clés : **[elder-plinius](https://github.com/elder-plinius)**,
  Simon Willison, Anthropic research team.

## Livrables publics

- Write-ups techniques (mediums, threads X).
- Classement HackAPrompt visible publiquement.
- Contributions open-source à la taxonomie des jailbreaks.

## Pourquoi ça compte pour de la cyber "classique"

L'attaque LLM est le **nouveau vecteur social engineering** :
- Les assistants IA sont déployés en pré-filtrage client dans
  les SI d'entreprise.
- Un LLM compromis = une porte d'entrée vers les outils qu'il
  contrôle (code execution, email, API internes).
- Les garde-fous LLM sont une couche de sécurité applicative qui
  se contourne comme n'importe quelle validation input.

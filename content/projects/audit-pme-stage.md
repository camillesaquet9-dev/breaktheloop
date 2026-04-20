---
slug: audit-pme-stage
ordinal: "04"
title: Audit PME (stage)
tagline: Audit externe de sécurité périmétrique + pentest web — PME française
category: audit
status: redacted
year: "2025"
featured: false
role: Pentester junior — rapport PASSI-style, 11 findings dont 2 critiques.
stack:
  - Nmap
  - Burp Suite
  - Nessus
  - OWASP Top 10
  - PASSI-ready methodology
---

## Contexte

Stage de 2<sup>e</sup> année BUT dans un ESN Rennais spécialisé
cybersécurité. Mission : **audit de sécurité externe** pour une PME
cliente (secteur industrie). Scope restreint au périmètre exposé
Internet + application web de gestion commerciale.

> **Les détails techniques, identifiants client, IPs et noms de domaine
> sont sous NDA.** Le write-up qui suit décrit uniquement la méthodologie
> et la typologie des findings — sans informations permettant
> d'identifier le client ou ses vulnérabilités spécifiques.

## Méthodologie

Approche **PASSI-ready** (référentiel ANSSI pour les prestataires d'audit) :

### 01 — Reconnaissance externe
Cartographie des actifs exposés — DNS, certificats TLS (crt.sh),
énumération de sous-domaines passive, moteurs Shodan / Censys.

### 02 — Scan de vulnérabilités
Nmap (`-sV --script vuln`) + Nessus en mode non-intrusif.
Validation manuelle de chaque finding pour éviter les faux positifs.

### 03 — Pentest web
Test OWASP Top 10 sur l'application commerciale :
- Injection (SQL, NoSQL, commande OS).
- Broken authentication.
- Broken access control (IDOR, missing function-level).
- Sensitive data exposure.
- Security misconfiguration.
- Cross-site scripting (reflected, stored, DOM).
- CSRF.
- Components with known vulnerabilities.

### 04 — Analyse des headers & TLS
Audit des en-têtes sécurité (CSP, HSTS, X-Frame, Referrer-Policy)
et de la configuration TLS (SSL Labs grade, suite cipher, OCSP).

## Findings (typologie)

Onze findings au total :

- **2 critiques** : un défaut d'authentification permettant
  l'usurpation de session + une injection côté applicatif.
- **4 élevés** : contrôles d'accès partiellement bypassables,
  exposition de données via une API legacy.
- **3 moyens** : configuration TLS à moderniser, en-têtes
  sécurité absents.
- **2 informatifs** : hygiène DNS, bonnes pratiques à adopter.

## Livrable

Rapport d'audit de 58 pages structuré PASSI :
- Synthèse exécutive (2 pages — destinée aux décideurs).
- Contexte, périmètre, méthodologie.
- Chaque finding : description, preuve technique, CVSS v3.1,
  recommandation priorisée.
- Plan de remédiation à 30 / 90 / 180 jours.

## Apprentissages

- L'audit, c'est 40% technique, 60% communication.
- Un finding "intéressant" qu'on ne sait pas expliquer au client
  ne sert à rien.
- PASSI = discipline méthodologique, pas une checklist.

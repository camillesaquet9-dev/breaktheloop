---
slug: red-team-cyberrange
ordinal: "01"
title: Red Team CyberRange
tagline: SAÉ red team — Kill Chain complète sur infra AD simulée
category: red-team
status: live
year: "2026"
featured: true
role: Red teamer — recon → C2 → lateral → domain admin en 72h.
stack:
  - Cobalt Strike
  - BloodHound
  - Impacket
  - Mythic
  - Active Directory
---

## Contexte

SAÉ (Situation d'Apprentissage et d'Évaluation) du BUT R&T cyber, parcours red team.
Objectif : simuler une opération complète sur une infrastructure Active Directory
représentative d'une PME de 120 postes, dans un cyber range isolé.

## Scope

- 2 forêts AD, une relation d'approbation, 3 sous-domaines.
- 1 Exchange exposé, 1 serveur de fichiers, 1 jump host.
- DMZ avec Stormshield SN310 (côté bleue — je n'ai pas touché à la config).
- Fenêtre d'engagement : **72 heures**, équipe de 3.

## Phases

### 01 — Reconnaissance
Énumération passive (Hunter.io, theHarvester, dehashed), cartographie ADCS
via `certipy find`, analyse des métadonnées de documents publics pour
inférer la convention de nommage des comptes (`p.nom`).

### 02 — Weaponization
Beacon Cobalt Strike custom (sleep 60s, jitter 40%), staging HTTPS
avec profil Malleable C2 imitant Office 365 (ASN + certificat Let's Encrypt
sur un sous-domaine d'apparence légitime).

### 03 — Delivery
Phishing ciblé sur 4 comptes RH — pièce jointe **.iso** contenant un
raccourci signé vers le beacon. Taux d'ouverture : 3/4.

### 04 — Exploitation
Initial access via le poste d'un assistant RH. Local admin via UAC bypass
(`fodhelper`) puis dump LSASS avec `nanodump` (signature évitée).

### 05 — Installation
Persistance via **scheduled task** déclenchée sur événement de logon,
payload stocké dans le registre (`HKCU\Software\...`) chiffré AES-256.

### 06 — Command & Control
Beacon HTTPS vers le teamserver, fallback DNS via `dnsmasq` contrôlé.
Traffic mélangé à des requêtes légitimes.

### 07 — Actions on Objectives
- Kerberoasting → hash du compte de service `svc_backup`.
- Crack hors-ligne → mot de passe en 4h (rockyou + règles custom).
- `svc_backup` possède `GenericAll` sur l'OU `Servers`.
- Abus via `Invoke-DCSync` → compromission complète du domaine.

## Résultat

Domain Admin en **68 heures**. Rapport PASSI-style de 42 pages produit
post-opération, incluant timeline détaillée, IOCs générés, recommandations
de remédiation priorisées (7 critiques, 12 élevées, 9 moyennes).

## Apprentissages

- Un beacon bien profilé passe sous le radar d'un IDS stock.
- Les relations de confiance inter-domaines restent mal auditées.
- Le temps le plus long n'est pas l'exploit — c'est la furtivité.

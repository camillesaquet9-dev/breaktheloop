---
slug: incident-response-r2d2
ordinal: "02"
title: IR — Malware R2D2
tagline: Investigation forensique d'un RAT Linux auto-propagé
category: incident-response
status: live
year: "2025"
featured: true
role: Analyste forensique — timeline complète, IOCs, scope confinement.
stack:
  - Volatility
  - YARA
  - Suricata
  - Velociraptor
  - Ghidra
---

## Contexte

Exercice IR dans le cadre d'un module du BUT : un malware baptisé
**R2D2** infecte un parc Linux de 40 machines en 6 heures. Ma mission :
caractériser la menace, reconstituer la timeline, établir le périmètre
de compromission et produire les IOCs pour le confinement.

## Approche

### 01 — Triage
Capture mémoire via `avml` sur les 3 machines flaggées. Collecte des
logs système (`/var/log`), des artefacts persistance (`crontab`, `systemd`,
`~/.bashrc`), et de l'historique réseau via `netstat` / `ss`.

### 02 — Analyse mémoire (Volatility)
Identification du processus suspect `r2d2d` caché derrière un nom
mimétique (`[kthreadd]`). Extraction du binaire ELF depuis la mémoire.

### 03 — Analyse statique (Ghidra)
- Binaire stripped, sections packées avec UPX (trivialement dépackable).
- Bibliothèque custom de chiffrement XOR + rotation pour les chaînes.
- Appels système via `syscall()` direct — tentative d'évasion des hooks
  userland.

### 04 — Analyse comportementale (sandbox)
Exécution dans un sandbox isolé (VM + Suricata + tcpdump) :
- Beacon HTTP vers 3 C2 rotatifs (DGA — Domain Generation Algorithm).
- Auto-propagation via SSH brute-force sur le /24 local + clés SSH
  récupérées dans `~/.ssh/`.
- Persistance via service systemd `r2d2.service`.

### 05 — YARA rules
Rédaction de 3 règles YARA :
1. Pattern XOR decoder signature.
2. Constante d'init du DGA.
3. Combinaison strings packed + section ratio.

### 06 — IOCs & Suricata
- 12 IPs C2 identifiées sur 48h d'observation.
- 2 patterns DNS pour la DGA.
- Règles Suricata déployées sur l'IDS central.

## Résultat

Scope de compromission : **18 machines sur 40**. Confinement en 9h après
détection initiale. Aucune exfiltration majeure identifiée — le malware
était en phase de staging quand le SOC a détecté l'activité anormale.

## Livrable

- Rapport forensique (timeline minute par minute).
- Bundle YARA + Suricata + Sigma rules.
- Playbook IR actualisé pour l'équipe SOC.

# 🛡️ PROJECT AEGIS — Rapport d'Audit & de Tri de Sécurité

**Auteur** : Ingénieur DevSecOps (Projet AEGIS)  
**Date** : Août 2026  
**Cible** : API REST Node.js & Conteneurisation Docker  
**Statut du Pipeline** : 🟢 PASSING (100% Automatisé sur GitHub Actions)

---

## 📊 1. Synthèse de la Couverture des 4 Briques de Sécurité

| Brique de Sécurité | Outil Utilisé | Emplacement | Statut | Résultat |
| :--- | :--- | :--- | :--- | :--- |
| **Secret Detection** | `gitleaks` | Pre-commit Hook & CI | 🟢 Validé | 0 secret en clair dans l'historique Git |
| **SAST** | `semgrep` | CI & Local Rules | 🟢 Validé | Failles SQLi & API leak corrigées, 0 alerte |
| **SCA** | `snyk` | CI & Snyk CLI | 🟢 Validé | 100 dépendances auditées, 0 vulnérabilité |
| **Container Security** | `trivy` + Docker | Build CI & Hardening | 🟢 Validé | Image Alpine Multi-stage non-root (`USER node`) |

---

## 🔍 2. Journal des Vulnérabilités & Remédiation (Tri & Correction)

### A. Détection des Secrets (Secret Detection)
- **Outil** : Gitleaks v8
- **Test d'injection** : Tentative de commit d'une clé d'API AWS (`AKIAIOSFODNN7EXAMPLEKEY`).
- **Résultat** : Bloqué instantanément par le Hook Git `.git/hooks/pre-commit`.
- **Action corrective** : Retrait des clés d'API du code source et utilisation exclusive des variables d'environnement (`.env`).

### B. Analyse Statique du Code Source (SAST)
- **Outil** : Semgrep CLI & Packs `p/expressjs`, `p/nodejs`, `.semgrep/aegis-rules.yml`
- **Failles détectées** :
  1. *SQL Injection (OWASP A03:2021)* : Concaténation directe de `req.query.title` dans `pool.query()`.
  2. *Sensitive Information Leak (OWASP A01:2021)* : Exposition des mots de passe DB via une route de debug.
- **Actions correctives** :
  - Implémentation des requêtes paramétrées PostgreSQL (`pool.query('SELECT * FROM incidents WHERE title = $1', [title])`).
  - Suppression pure et simple des routes de debug d'environnement.

### C. Analyse des Dépendances Tierces (SCA)
- **Outil** : Snyk CLI & Snyk GitHub Action
- **Test d'injection** : Ajout d'une dépendance obsolète (`lodash@4.17.15`).
- **Failles détectées** : 8 vulnérabilités (dont Prototype Pollution & Code Injection - High Severity).
- **Actions correctives** : Suppression de la dépendance inutile et mise à jour de l'arbre `package-lock.json`. 100% des 100 dépendances sont désormais saines.

### D. Sécurité des Conteneurs (Container Security & Hardening)
- **Outil** : Trivy Action & Docker Multi-stage
- **Failles détectées sur l'image initiale (`node:20`)** : 30 vulnérabilités OS (Debian Bookworm, tar, npm).
- **Durcissement appliqué (`Dockerfile`)** :
  - Migration de Debian (1 Go) vers **Alpine Linux** (100 Mo).
  - Utilisation du **Multi-Stage Build** (`AS builder`).
  - Suppression des privilèges root via l'instruction **`USER node`**.

---

## 📄 3. Registre des Risques Acceptés & Remédiation Avancée (`.trivyignore`)

Initialement triées et documentées dans `.trivyignore`, les vulnérabilités amont d'Alpine (`CVE-2026-45447`, `CVE-2026-59873`, etc.) ont été **définitivement éliminées** grâce à la PR automatique Snyk mettant à niveau l'image de base vers `node:26.7.0-alpine`.

| CVE ID | Composant | Sévérité | Statut Final | Action de Remédiation Appliquée |
| :--- | :--- | :--- | :--- | :--- |
| `CVE-2026-45447` | `libcrypto3` | HIGH | 🟢 Éliminée | Upgrade vers `node:26.7.0-alpine` via Snyk PR #1 |
| `CVE-2026-59873` | `tar` | CRITICAL | 🟢 Éliminée | Upgrade vers `node:26.7.0-alpine` via Snyk PR #1 |
| `CVE-2026-13149` | `brace-expansion` | HIGH | 🟢 Éliminée | Upgrade vers `node:26.7.0-alpine` via Snyk PR #1 |
| `CVE-2026-14257` | `brace-expansion` | HIGH | 🟢 Éliminée | Upgrade vers `node:26.7.0-alpine` via Snyk PR #1 |
| `CVE-2026-69152` | `brace-expansion` | HIGH | 🟢 Éliminée | Upgrade vers `node:26.7.0-alpine` via Snyk PR #1 |

---

## 🎯 4. Conclusion & Conformité

Le projet AEGIS répond à **100% des exigences techniques du sujet** :
- Le pipeline CI/CD bloque automatiquement tout code contenant un secret ou une vulnérabilité critique.
- L'image Docker finale est durcie et s'exécute selon le principe du moindre privilège.

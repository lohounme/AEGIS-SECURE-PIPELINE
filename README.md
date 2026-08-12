# 🛡️ PROJECT AEGIS — DevSecOps Pipeline & Secure Microservice

[![AEGIS DevSecOps Pipeline](https://github.com/lohounme/AEGIS-SECURE-PIPELINE/actions/workflows/aegis-pipeline.yml/badge.svg)](https://github.com/lohounme/AEGIS-SECURE-PIPELINE/actions/workflows/aegis-pipeline.yml)

## 📌 Présentation du Projet
**AEGIS** est une démonstration complète d'ingénierie DevSecOps (*Shift-Left Security*). L'objectif est de sécuriser l'ensemble de la chaîne de valeur logicielle, du premier commit local jusqu'à la conteneurisation finale.

L'application sécurisée est une API REST Node.js/Express connectée à une base de données PostgreSQL, conteneurisée et durcie sous Docker.

---

## 🏗️ Architecture du Pipeline DevSecOps

```text
[Développeur Local]
   └── Git Commit ──> (Pre-commit Hook: Gitleaks Secret Scan)
                           │
                           ▼
[GitHub Actions CI/CD Pipeline]
   ├── 1. 🔑 Secret Detection  (Gitleaks Action)
   ├── 2. 🔬 SAST Scan          (Semgrep - Rules Custom & OWASP)
   ├── 3. 📦 SCA Scan           (Snyk Open Source)
   └── 4. 🐳 Container Security (Trivy + Docker Alpine Hardening)

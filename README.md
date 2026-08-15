# Project AEGIS: Enterprise DevSecOps Pipeline

[![AEGIS DevSecOps Pipeline](https://github.com/lohounme/AEGIS-SECURE-PIPELINE/actions/workflows/aegis-pipeline.yml/badge.svg)](https://github.com/lohounme/AEGIS-SECURE-PIPELINE/actions/workflows/aegis-pipeline.yml)
![Node.js](https://img.shields.io/badge/Node.js-26.x_LTS-339933?logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Alpine_Multi--Stage-2496ED?logo=docker&logoColor=white)
![Security](https://img.shields.io/badge/Security-Shift--Left-critical?logo=shield&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

> **Production-grade DevSecOps pipeline** demonstrating automated security gates across the full software delivery lifecycle: from developer workstation to containerized deployment.

---

## 📌 Project Overview

**AEGIS** is a complete implementation of the **Shift-Left Security** engineering discipline. It integrates four complementary security tools into a fully automated CI/CD pipeline that enforces security quality gates at every stage of the delivery process.

The secured application is a **Node.js/Express REST API** backed by **PostgreSQL**, containerized and hardened with Docker following NIST SP 800-190 and CIS Docker Benchmark guidelines.

**Key security outcomes:**
- ✅ Zero secrets ever committed to Git history
- ✅ Zero OWASP Top 10 vulnerabilities in application code
- ✅ Zero vulnerable npm dependencies (100 packages audited)
- ✅ Zero OS/library CVEs in the production container image

---

## 🏗️ Pipeline Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPER WORKSTATION                       │
│                                                                 │
│   git commit  ──▶  pre-commit hook (Gitleaks)                  │
│                    └── Blocks if secrets detected               │
└──────────────────────────────┬──────────────────────────────────┘
                               │  git push
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  GITHUB ACTIONS CI/CD PIPELINE                  │
│                                                                 │
│   Gate 1 ──▶  🔑 Secret Detection    (Gitleaks)                │
│      │                                                          │
│   Gate 2 ──▶  🔬 SAST Analysis       (Semgrep / OWASP rules)   │
│      │                                                          │
│   Gate 3 ──▶  📦 SCA Dependency Scan (Snyk Open Source)        │
│      │                                                          │
│   Gate 4 ──▶  🐳 Container Security  (Docker + Trivy)          │
│                                                                 │
│   Each gate blocks deployment on failure (exit-code: 1)         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              SNYK WEB PLATFORM (Continuous Monitoring)          │
│   Automated Fix PRs  ──▶  Base image upgrade node:26.7.0-alpine │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 The Four Security Domains

### 1. 🔑 Secret Detection: Gitleaks

**Threat prevented:** Credentials, API keys, and tokens accidentally committed to source control.

- Local enforcement via **Git pre-commit hook** (`scripts/setup-git-hooks.sh`)
- CI/CD enforcement via **Gitleaks GitHub Action** on every push and pull request
- Custom rules configured in `.gitleaks.toml`

```bash
# Hook installed automatically: blocks commit if secrets are detected
bash scripts/setup-git-hooks.sh
```

---

### 2. 🔬 Static Application Security Testing: Semgrep

**Threat prevented:** OWASP Top 10 vulnerabilities in application source code (SQL Injection, XSS, credential leaks).

- Scans `src/` against official `p/expressjs` and `p/nodejs` rule packs
- Custom ruleset in `.semgrep/aegis-rules.yml` targeting project-specific patterns
- **Finding patched:** SQL injection via string concatenation -> replaced with parameterized query `pool.query('SELECT ... WHERE id = $1', [id])`

---

### 3. 📦 Software Composition Analysis: Snyk

**Threat prevented:** Known vulnerabilities in third-party npm dependencies (direct and transitive).

- Scans the full `package.json` dependency tree (100 packages)
- Blocks pipeline on `HIGH` severity or above
- **Snyk Web Platform** provides continuous monitoring and automated fix PRs

---

### 4. 🐳 Container Security & Hardening: Docker + Trivy

**Threat prevented:** OS-level vulnerabilities, bloated attack surface, and root privilege escalation inside the container.

| Hardening Measure | Detail |
|:---|:---|
| **Base Image** | `node:26.7.0-alpine` (minimal attack surface: < 100 MB vs 1 GB Debian) |
| **Multi-Stage Build** | Dependencies compiled in `builder` stage; only production artifacts in runtime |
| **Non-root User** | Container runs as `USER node`: no root privileges in production |
| **Trivy Scan** | CI gate blocks on any `CRITICAL` or `HIGH` CVE at deploy time |
| **Snyk Monitoring** | Automated base image upgrade PRs (patched `node:20` -> `node:26.7.0`) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Application** | Node.js 20 LTS, Express.js, PostgreSQL (via `pg`) |
| **Security: Secrets** | Gitleaks v8 |
| **Security: SAST** | Semgrep (custom rules + OWASP packs) |
| **Security: SCA** | Snyk Open Source |
| **Security: Container** | Trivy, Docker Multi-Stage, Alpine Linux |
| **CI/CD** | GitHub Actions |
| **Monitoring** | Snyk Web Platform |
| **Standards** | OWASP Top 10 2021, NIST SP 800-190, CIS Docker Benchmark |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/lohounme/AEGIS-SECURE-PIPELINE.git
cd AEGIS-SECURE-PIPELINE
```

### 2. Install local security hooks

```bash
bash scripts/setup-git-hooks.sh
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your local credentials (never commit .env)
```

### 4. Start the application

```bash
docker compose -f docker/docker-compose.yml up --build -d
```

### 5. Verify the API

```bash
curl http://localhost:3000/health
# Expected: {"status":"UP","environment":"production"}
```

---

## 📂 Project Structure

```text
AEGIS-SECURE-PIPELINE/
├── .github/
│   └── workflows/
│       └── aegis-pipeline.yml   # 4-gate CI/CD security pipeline
├── .semgrep/
│   └── aegis-rules.yml          # Custom SAST rules
├── docker/
│   ├── Dockerfile               # Multi-stage hardened build
│   └── docker-compose.yml       # Local orchestration
├── docs/
│   └── SECURITY_REPORT.md       # Full security audit report
├── scripts/
│   └── setup-git-hooks.sh       # Installs pre-commit Gitleaks hook
├── src/
│   ├── app.js                   # Express REST API
│   └── package.json             # npm dependencies
├── .env.example                 # Environment variable template
├── .gitleaks.toml               # Secret detection rules
├── .trivyignore                 # CVE risk register
└── LICENSE                      # MIT License
```

---

## 📊 Security Audit Report

The full vulnerability findings, remediation journal, and risk register are documented in:

📄 **[docs/SECURITY_REPORT.md](docs/SECURITY_REPORT.md)**

---

## 📜 License

MIT: See [LICENSE](LICENSE) for details.

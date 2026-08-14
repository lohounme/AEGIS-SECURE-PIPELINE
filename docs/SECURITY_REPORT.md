# 🛡️ PROJECT AEGIS — Security Audit Report

| Field | Value |
|:---|:---|
| **Author** | DevSecOps Engineer — Project AEGIS |
| **Classification** | Internal / Confidential |
| **Date** | August 2026 |
| **Target** | Node.js REST API + Docker Container (PostgreSQL backend) |
| **Pipeline Status** | 🟢 PASSING — 4/4 Security Gates Green |
| **Framework Reference** | OWASP Top 10 2021, NIST SP 800-190 (Container Security) |

---

## 📊 1. Security Coverage Summary

| Security Domain | Tool | Location | Status | Result |
|:---|:---|:---|:---|:---|
| **Secret Detection** | `gitleaks` v8 | Pre-commit Hook + CI | 🟢 Validated | 0 secrets detected in Git history |
| **SAST** | `semgrep` | CI + Custom Rules (`.semgrep/`) | 🟢 Validated | SQLi & credential leak patched, 0 findings |
| **SCA** | `snyk` | CI + Snyk Web Platform | 🟢 Validated | 100 npm dependencies audited, 0 vulnerabilities |
| **Container Security** | `trivy` + Docker | CI Build + Snyk Automated PR | 🟢 Validated | Multi-stage Alpine, non-root `USER node`, 0 CVEs |

**Coverage Verdict : 100% — Shift-Left Security fully operational across all 4 domains.**

---

## 🔍 2. Vulnerability Findings Journal

### A. Secret Detection (Gitleaks)

| Item | Detail |
|:---|:---|
| **Tool** | Gitleaks v8 |
| **Scope** | Full Git history + staged changes |
| **Enforcement** | Local `pre-commit` hook (blocks at dev workstation) + CI gate |
| **Simulated Attack** | Commit attempt with AWS Access Key `AKIAIOSFODNN7EXAMPLEKEY` |
| **Result** | ✅ Blocked instantly by `.git/hooks/pre-commit` |
| **Remediation** | All credentials moved to `.env` (gitignored) + `.env.example` template |

---

### B. Static Application Security Testing — SAST (Semgrep)

| Item | Detail |
|:---|:---|
| **Tool** | Semgrep CLI — `p/expressjs`, `p/nodejs` + Custom ruleset `.semgrep/aegis-rules.yml` |
| **Scope** | Full `src/` source code analysis (no execution required) |

**Findings :**

| ID | OWASP Category | Location | Description | Status |
|:---|:---|:---|:---|:---|
| SAST-001 | A03:2021 — Injection | `src/app.js` | SQL query built by string concatenation with `req.query.title` | 🟢 Fixed |
| SAST-002 | A01:2021 — Broken Access Control | `src/app.js` | Debug route exposing `process.env` (DB credentials) | 🟢 Fixed |

**Remediations applied :**
- `SAST-001` → Parameterized query: `pool.query('SELECT * FROM incidents WHERE title = $1', [title])`
- `SAST-002` → Debug route permanently removed from codebase

---

### C. Software Composition Analysis — SCA (Snyk)

| Item | Detail |
|:---|:---|
| **Tool** | Snyk CLI + Snyk GitHub Actions + Snyk Web Platform |
| **Scope** | `src/package.json` full dependency tree (direct + transitive) |

**Simulated Attack :** Introduction of `lodash@4.17.15` (known vulnerable dependency).

| CVE | Package | Severity | Type | Status |
|:---|:---|:---|:---|:---|
| Multiple | `lodash@4.17.15` | HIGH | Prototype Pollution + Code Injection | 🟢 Fixed |

**Remediation :** `lodash` removed from `package.json`. Full `npm ci` tree verified: **0 vulnerabilities across 100 packages.**

---

### D. Container Security & Hardening (Trivy + Docker)

#### D.1 — Docker Image Hardening

| Hardening Measure | Before | After | Standard |
|:---|:---|:---|:---|
| **Base Image** | `node:20` (Debian Bookworm, 1 GB) | `node:26.7.0-alpine` (< 100 MB) | NIST SP 800-190 §4.1 |
| **Build Strategy** | Single-stage | **Multi-Stage Build** (`AS builder`) | CIS Docker Benchmark |
| **Runtime User** | `root` (UID 0) | **`USER node`** (non-root) | NIST SP 800-190 §4.4 |
| **Attack Surface** | ~350 OS packages | ~45 OS packages | Principle of Least Privilege |

#### D.2 — Trivy Scan Results (Final State)

| Category | Findings | Status |
|:---|:---|:---|
| OS Vulnerabilities | 0 | 🟢 Clean |
| Library Vulnerabilities | 0 | 🟢 Clean |
| CRITICAL CVEs | 0 | 🟢 Clean |
| HIGH CVEs | 0 | 🟢 Clean |

---

## 📄 3. Risk Register & Remediation History

### 3.1 — Active Exceptions (`.trivyignore`)

> **Current status: NO active exceptions.**
> The `.trivyignore` file contains no suppressed CVEs.
> All previously identified base image vulnerabilities have been eliminated.

---

### 3.2 — Closed Exceptions (Archived)

The following CVEs were initially triaged in `.trivyignore` during the `node:20-alpine` phase and have been **permanently eliminated** on 2026-08-13 via **Snyk Automated Fix PR #1** (upgrade to `node:26.7.0-alpine`).

| CVE ID | Component | Severity | Initial Triage Justification | Final Status | Remediation |
|:---|:---|:---|:---|:---|:---|
| `CVE-2026-45447` | `libcrypto3` (OpenSSL) | HIGH | API does not use `PKCS7_verify()`. Zero exploitability. | 🟢 Eliminated | Upgrade → `node:26.7.0-alpine` |
| `CVE-2026-59873` | `tar` | CRITICAL | Container runs as non-root `node`. No tar archive processing in prod. | 🟢 Eliminated | Upgrade → `node:26.7.0-alpine` |
| `CVE-2026-13149` | `brace-expansion` | HIGH | Affects npm CLI tooling only. API does not process brace expressions at runtime. | 🟢 Eliminated | Upgrade → `node:26.7.0-alpine` |
| `CVE-2026-14257` | `brace-expansion` | HIGH | Memory exhaustion in `expand()`. No direct call from Express/pg runtime. | 🟢 Eliminated | Upgrade → `node:26.7.0-alpine` |
| `CVE-2026-69152` | `brace-expansion` | HIGH | ReDoS variant on intermediate arrays. Zero runtime impact on web API. | 🟢 Eliminated | Upgrade → `node:26.7.0-alpine` |

---

## 🔄 4. Continuous Remediation Workflow

This project demonstrates the full **Continuous Remediation** lifecycle:

```
[Dev Workstation]
  └── pre-commit (Gitleaks) ──→ Blocks secrets at source
           │
           ▼
[GitHub Actions CI/CD — on every push/PR]
  ├── Gate 1: Gitleaks      → Secret scan (full history)
  ├── Gate 2: Semgrep       → SAST (source code, OWASP rules)
  ├── Gate 3: Snyk          → SCA (dependency tree)
  └── Gate 4: Trivy         → Container scan (OS + libraries)
           │
           ▼
[Snyk Web Platform — Continuous Monitoring]
  └── Automated Fix PR (node:20 → node:26.7.0) → Merged 2026-08-13
```

**Why both Snyk AND Trivy?**

| Dimension | Snyk | Trivy |
|:---|:---|:---|
| **What it scans** | `package.json` dependency graph | Compiled Docker image (OS + app) |
| **What it sees** | Developer-installed packages | Everything Docker assembled |
| **Blind spot** | OS-level Alpine binaries | Cannot parse `package.json` standalone |
| **Combined value** | **100% coverage**: app layer + OS/infrastructure layer |

---

## ✅ 5. Compliance & Conclusion

| Requirement | Status |
|:---|:---|
| Secret detection automated at commit level | ✅ |
| SAST integrated in CI/CD pipeline | ✅ |
| SCA with dependency vulnerability blocking | ✅ |
| Container hardening (non-root, minimal image) | ✅ |
| Vulnerability triage documented with justification | ✅ |
| All HIGH/CRITICAL vulnerabilities resolved | ✅ |
| Pipeline blocks deployment on security failure | ✅ |
| Continuous monitoring enabled (Snyk Web) | ✅ |

**Project AEGIS achieves full DevSecOps Shift-Left maturity across all security domains.**
**Pipeline status: 🟢 4/4 gates passing — Production-ready.**

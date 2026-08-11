#!/bin/bash

HOOK_FILE=".git/hooks/pre-commit"

echo " Installing AEGIS Gitleaks Pre-Commit Hook..."

cat << 'EOF' > $HOOK_FILE
#!/bin/bash
echo " Running Gitleaks Secret Scan before commit..."

gitleaks protect --staged --verbose --redact

if [ $? -ne 0 ]; then
    echo "❌ COMMIT BLOCKED: Gitleaks detected a hardcoded secret in your staged changes!"
    echo " Please remove the secret, use environment variables, and try committing again."
    exit 1
fi

echo " Gitleaks check passed. Proceeding with commit."
EOF

chmod +x $HOOK_FILE
echo " Pre-commit hook installed successfully at $HOOK_FILE"

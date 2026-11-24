#!/usr/bin/env bash
# Copia de seguridad de la base de datos D1 (exportación SQL completa).
# Uso: npm run backup   → backups/premios-AAAAMMDD-HHMM.sql
# Además, D1 conserva automáticamente 30 días de historial (Time Travel): ver docs/DESPLIEGUE.md.
set -euo pipefail
mkdir -p backups
FILE="backups/premios-$(date +%Y%m%d-%H%M).sql"
npx wrangler d1 export premios-infolinense --remote --output="$FILE"
echo "Copia guardada en $FILE"

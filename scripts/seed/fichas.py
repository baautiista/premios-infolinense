#!/usr/bin/env python3
"""Genera migrations/0003_fichas_candidaturas.sql a partir del dossier de fichas (xlsx).

Uso: python3 scripts/seed/fichas.py ruta/al/dossier.xlsx

Reglas:
- Solo rellena campos vacíos (no pisa lo que se haya editado desde el panel).
- Nunca copia las columnas «Verificación» ni «Notas internas (NO PUBLICAR)».
- No cambia el estado de publicación ni el orden.
- Corrige nombre y enlace permanente solo en los casos indicados en el dossier.
"""
import sys
import openpyxl

SRC = sys.argv[1]
OUT = 'migrations/0003_fichas_candidaturas.sql'

# slug del dossier -> slug sembrado en 0002
SLUG_SEMILLA = {
    'sonia-castillo-arenillas': 'sonia-castillo',
    'acali-el-volao-vida-asociativa': 'acali-el-volao',
    'sila-restauracion': 'silas-restauracion',
}
# subtítulos sembrados que el dossier amplía (se sustituyen solo si siguen igual)
SUBTITULO_SEMILLA = {
    'etikal-consulting': 'Marta Castellano y Elena Trillo',
    'ies-tolosa': 'Línea Racing Team',
}
# nombres corregidos por el dossier
NOMBRE = {
    'sonia-castillo-arenillas': 'Sonia Castillo Arenillas',
    'sila-restauracion': 'Sila Restauración',
}
NO_TOCAR_SUBTITULO = {'rocio-hernandez'}  # el nombre ya lleva «La Peluquería» como subtítulo


def q(v):
    if v is None:
        return 'NULL'
    v = str(v).replace('\r\n', '\n').strip()
    if not v:
        return 'NULL'
    return "'" + v.replace("'", "''") + "'"


def fill(col, val):
    return f"{col} = CASE WHEN {col} IS NULL OR TRIM({col}) = '' THEN {q(val)} ELSE {col} END"


ws = openpyxl.load_workbook(SRC, read_only=True)['Candidaturas']
head = [c for c in next(ws.iter_rows(max_row=1, values_only=True))]
col = {h: i for i, h in enumerate(head)}
need = ['Categoría', 'Nominado', 'Subtítulo', 'Enlace permanente (slug)', 'Motivo de la nominación',
        'Presentación ampliada', 'Méritos de 2026', 'Enlaces', 'Candidatura alternativa']
for n in need:
    assert n in col, n
alt_col = next(h for h in head if h and h.startswith('Texto alternativo'))
cred_col = next(h for h in head if h and h.startswith('Crédito'))

out = ['-- Fichas de candidaturas (dossier del 24/11/2026). Generado por scripts/seed/fichas.py.',
       '-- Solo rellena campos vacíos; no publica ni despublica nada.', '']
count = 0
for r in ws.iter_rows(min_row=2, values_only=True):
    if not r[col['Nominado']]:
        continue
    slug = str(r[col['Enlace permanente (slug)']]).strip().rsplit('/', 1)[-1]
    semilla = SLUG_SEMILLA.get(slug, slug)
    g = lambda h: r[col[h]]
    if slug == 'maria-perales':
        # Alternativa que no estaba en la carga inicial: entra sin publicar.
        out.append(
            "INSERT OR IGNORE INTO nominees (category_id, slug, name, subtitle, reason, bio, merits, links, published, is_alternate, position) "
            f"SELECT id, 'maria-perales', {q(g('Nominado'))}, {q(g('Subtítulo'))}, {q(g('Motivo de la nominación'))}, "
            f"{q(g('Presentación ampliada'))}, {q(g('Méritos de 2026'))}, {q(g('Enlaces'))}, 0, 1, 90 "
            "FROM categories WHERE slug = 'merito-deportivo';")
        count += 1
        continue
    sets = []
    if slug in NOMBRE:
        sets.append(f"name = {q(NOMBRE[slug])}")
    if slug != semilla:
        sets.append(f"slug = {q(slug)}")
    if slug not in NO_TOCAR_SUBTITULO:
        old = SUBTITULO_SEMILLA.get(slug)
        cond = f"subtitle IS NULL OR TRIM(subtitle) = ''" + (f" OR subtitle = {q(old)}" if old else '')
        sets.append(f"subtitle = CASE WHEN {cond} THEN {q(g('Subtítulo'))} ELSE subtitle END")
    sets += [fill('reason', g('Motivo de la nominación')),
             fill('bio', g('Presentación ampliada')),
             fill('merits', g('Méritos de 2026')),
             fill('links', g('Enlaces')),
             fill('photo_alt', r[col[alt_col]]),
             fill('photo_credit', r[col[cred_col]]),
             "updated_at = CURRENT_TIMESTAMP"]
    out.append(f"UPDATE nominees SET\n  " + ",\n  ".join(sets) + f"\nWHERE slug = {q(semilla)};\n")
    count += 1

open(OUT, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print(f'{count} candidaturas -> {OUT}')

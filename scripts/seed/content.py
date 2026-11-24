# Genera migrations/0002_datos_iniciales.sql a partir de los datos facilitados por InfoLinense.
# Ejecutar: python3 scripts/seed/content.py
import re, unicodedata, pathlib

def slugify(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

def q(v):
    if v is None: return 'NULL'
    if isinstance(v, int): return str(v)
    return "'" + str(v).replace("'", "''") + "'"

# (slug, nombre, título del premio, pregunta, color, tinta, plazas, votable, nota)
CATS = [
 ('merito-deportivo','Mérito Deportivo','Deportista del año','¿Qué deportista de La Línea merece este premio?','#00AA4F','#FFFFFF',5,1,None),
 ('talento-emprendedor','Talento Emprendedor','Emprendimiento del año','¿A quién premiarías por el negocio o proyecto que ha puesto en marcha este año en La Línea?','#081A54','#FFFFFF',5,1,None),
 ('comercio-a-pie-de-calle','Comercio a Pie de Calle','Comercio local del año','¿Qué comercio de La Línea premiarías por su trayectoria y su trato?','#FE8E1A','#FFFFFF',5,1,None),
 ('arte-con-firma','Arte con Firma','Artista linense del año','¿Qué artista de La Línea te ha sorprendido con su obra este año?','#E72E79','#FFFFFF',5,1,None),
 ('creacion-en-red','Creación en Red','Creador digital del año','¿Qué linense ha destacado este año con sus vídeos, pódcast o publicaciones en redes?','#62DBD1','#081A54',5,1,None),
 ('vocacion-educativa','Vocación Educativa','Premio a la educación','¿Qué docente o centro educativo de La Línea merece un premio por su labor este año?','#00AA4F','#FFFFFF',5,1,None),
 ('vida-asociativa','Vida Asociativa','Asociación del año','¿Qué asociación de La Línea destacarías por su labor en 2026?','#2756CD','#FFFFFF',5,1,None),
 ('accion-de-barrio','Acción de Barrio',None,None,'#FFB627','#081A54',4,1,'Cuatro candidaturas propuestas por la FLAVI. Pendientes de comunicación oficial.'),
 ('carnaval-linense','Carnaval Linense','Premio al Carnaval','¿Qué persona, agrupación o iniciativa merece un premio por su aportación al Carnaval de La Línea en 2026?','#3A86FF','#FFFFFF',5,1,None),
 ('vocacion-cofrade','Vocación Cofrade','Premio Cofrade','¿Qué persona, hermandad, colectivo o iniciativa del mundo cofrade de La Línea merece este premio?','#080B8F','#FFFFFF',3,1,None),
 ('impulso-cofrade','Impulso Cofrade','Premio Cofrade','¿Qué persona, hermandad, colectivo o iniciativa del mundo cofrade de La Línea merece este premio?','#080B8F','#FFFFFF',3,1,None),
 ('honor-a-la-trayectoria','Honor a la Trayectoria','Reconocimiento de la redacción',None,'#D9E2F2','#081A54',1,0,'Reconocimiento especial concedido por la redacción de InfoLinense, sin votación popular. Pendiente de decisión.'),
]

# (categoría, nombre, subtítulo, publicado, alternativa)
NOM = {
 'merito-deportivo': ['Alfredo Mena','Desi Márquez','Raquel Retamero','Sonia Castillo','Gonzalo Herrera'],
 'talento-emprendedor': ['Xora Intelligence','JD Otero','Síntesis','Quintiestudio',('Etikal Consulting','Marta Castellano y Elena Trillo')],
 'comercio-a-pie-de-calle': ['Ohana','Esteban del Mar','La Pecera Librería','Tienda Con M','La Escocesa'],
 'arte-con-firma': ['Laura Maras','Conchi Trudier','Maral Ríos','Queen Lidhia','Gavilana Atelier'],
 'creacion-en-red': ['Josele Fotografía','Hippie Domaris','Berto','Aday Montes','Zequi Rojas'],
 'vocacion-educativa': ['Academia La Fuente','Nemesio Andrades (Neme)','Noelia Valle Ruiz','Nuria Viñas Martínez',('IES Tolosa','Línea Racing Team')],
 'vida-asociativa': ['Crocheteras Linenses','ACALI El Volaó','Asociación Ruta de los Búnkeres','Los Locos del Parque','AFAL'],
 'carnaval-linense': ['Los Desparasitaos','ACALI El Volaó','La Batería','Disfraz de Coplas','Juan Miguel Novo Vázquez'],
 'vocacion-cofrade': ['Ernesto Frigolet','Antonia Gil','Josema Sánchez Bautista'],
 'impulso-cofrade': ['Tertulia Cofrade El Puñal','Silas Restauración','Cinema Cofrade'],
}
ALTERNATES = {
 'talento-emprendedor': [('Grupo MoM', None)],
 'comercio-a-pie-de-calle': [('Rocío Hernández', 'La Peluquería')],
}

PAGES = pathlib.Path(__file__).with_name('pages')

out = ["-- Datos iniciales de la I edición (2026). Generado por scripts/seed/content.py — editable desde /admin.",
       "INSERT INTO editions (id, year, name) VALUES (1, 2026, 'I edición');", ""]

settings = {
 'phase': 'coming_soon',
 # La presentación es el 25/11/2026; la hora exacta la fija la organización desde el panel.
 'announce_at': None,
 'voting_opens_at': None, 'voting_closes_at': None, 'results_at': None,
 'nominee_order': 'random',
 'soft_network_limit': '4', 'hard_network_limit': '40',
 'contact_email': 'redaccion@infolinense.com',
 'instagram_url': 'https://www.instagram.com/infolinense/',
}
for k, v in settings.items():
    out.append(f"INSERT INTO settings (key, value, updated_by) VALUES ({q(k)}, {q(v)}, 'sistema');")
out.append("")

used = set()
for i, (slug, name, award, question, color, ink, slots, votable, note) in enumerate(CATS, start=1):
    out.append("INSERT INTO categories (id, edition_id, slug, name, award_title, question, nomination_note, color, ink, slots, votable, position) VALUES "
               f"({i}, 1, {q(slug)}, {q(name)}, {q(award)}, {q(question)}, {q(note)}, {q(color)}, {q(ink)}, {slots}, {votable}, {i});")
out.append("")

nid = 0
def add(cat_id, cat_slug, name, subtitle, published, alternate, pos):
    global nid
    nid += 1
    s = slugify(name)
    if s in used: s = f"{s}-{slugify(cat_slug)}"
    used.add(s)
    out.append("INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES "
               f"({nid}, {cat_id}, {q(s)}, {q(name)}, {q(subtitle)}, {published}, {alternate}, {pos});")

for i, c in enumerate(CATS, start=1):
    for pos, n in enumerate(NOM.get(c[0], []), start=1):
        name, sub = (n if isinstance(n, tuple) else (n, None))
        add(i, c[0], name, sub, 1, 0, pos)
    for pos, (name, sub) in enumerate(ALTERNATES.get(c[0], []), start=90):
        add(i, c[0], name, sub, 0, 1, pos)
out.append("")

for pos, f in enumerate(['bases','sistema-de-votacion','organizacion','privacidad','aviso-legal','contacto'], start=1):
    text = (PAGES / f'{f}.md').read_text(encoding='utf-8')
    lines = text.split('\n')
    title = lines[0].lstrip('# ').strip()
    summary = lines[2].strip()
    body = '\n'.join(lines[4:]).strip() + '\n'
    out.append(f"INSERT INTO pages (slug, title, summary, body, status, position, updated_by) VALUES ({q(f)}, {q(title)}, {q(summary)}, {q(body)}, 'draft', {pos}, 'sistema');")

pathlib.Path('migrations/0002_datos_iniciales.sql').write_text('\n'.join(out) + '\n', encoding='utf-8')
print('nominados:', nid, 'slugs duplicados resueltos:', [s for s in used if s.endswith('carnaval-linense')])

-- Datos iniciales de la I edición (2026). Generado por scripts/seed/content.py — editable desde /admin.
INSERT INTO editions (id, year, name) VALUES (1, 2026, 'I edición');

INSERT INTO settings (key, value, updated_by) VALUES ('phase', 'coming_soon', 'sistema');
INSERT INTO settings (key, value, updated_by) VALUES ('announce_at', NULL, 'sistema');
INSERT INTO settings (key, value, updated_by) VALUES ('voting_opens_at', NULL, 'sistema');
INSERT INTO settings (key, value, updated_by) VALUES ('voting_closes_at', NULL, 'sistema');
INSERT INTO settings (key, value, updated_by) VALUES ('results_at', NULL, 'sistema');
INSERT INTO settings (key, value, updated_by) VALUES ('nominee_order', 'random', 'sistema');
INSERT INTO settings (key, value, updated_by) VALUES ('soft_network_limit', '4', 'sistema');
INSERT INTO settings (key, value, updated_by) VALUES ('hard_network_limit', '40', 'sistema');
INSERT INTO settings (key, value, updated_by) VALUES ('contact_email', 'redaccion@infolinense.com', 'sistema');
INSERT INTO settings (key, value, updated_by) VALUES ('instagram_url', 'https://www.instagram.com/infolinense/', 'sistema');

INSERT INTO categories (id, edition_id, slug, name, award_title, question, nomination_note, color, ink, slots, votable, position) VALUES (1, 1, 'merito-deportivo', 'Mérito Deportivo', 'Deportista del año', '¿Qué deportista de La Línea merece este premio?', NULL, '#00AA4F', '#FFFFFF', 5, 1, 1);
INSERT INTO categories (id, edition_id, slug, name, award_title, question, nomination_note, color, ink, slots, votable, position) VALUES (2, 1, 'talento-emprendedor', 'Talento Emprendedor', 'Emprendimiento del año', '¿A quién premiarías por el negocio o proyecto que ha puesto en marcha este año en La Línea?', NULL, '#081A54', '#FFFFFF', 5, 1, 2);
INSERT INTO categories (id, edition_id, slug, name, award_title, question, nomination_note, color, ink, slots, votable, position) VALUES (3, 1, 'comercio-a-pie-de-calle', 'Comercio a Pie de Calle', 'Comercio local del año', '¿Qué comercio de La Línea premiarías por su trayectoria y su trato?', NULL, '#FE8E1A', '#FFFFFF', 5, 1, 3);
INSERT INTO categories (id, edition_id, slug, name, award_title, question, nomination_note, color, ink, slots, votable, position) VALUES (4, 1, 'arte-con-firma', 'Arte con Firma', 'Artista linense del año', '¿Qué artista de La Línea te ha sorprendido con su obra este año?', NULL, '#E72E79', '#FFFFFF', 5, 1, 4);
INSERT INTO categories (id, edition_id, slug, name, award_title, question, nomination_note, color, ink, slots, votable, position) VALUES (5, 1, 'creacion-en-red', 'Creación en Red', 'Creador digital del año', '¿Qué linense ha destacado este año con sus vídeos, pódcast o publicaciones en redes?', NULL, '#62DBD1', '#081A54', 5, 1, 5);
INSERT INTO categories (id, edition_id, slug, name, award_title, question, nomination_note, color, ink, slots, votable, position) VALUES (6, 1, 'vocacion-educativa', 'Vocación Educativa', 'Premio a la educación', '¿Qué docente o centro educativo de La Línea merece un premio por su labor este año?', NULL, '#00AA4F', '#FFFFFF', 5, 1, 6);
INSERT INTO categories (id, edition_id, slug, name, award_title, question, nomination_note, color, ink, slots, votable, position) VALUES (7, 1, 'vida-asociativa', 'Vida Asociativa', 'Asociación del año', '¿Qué asociación de La Línea destacarías por su labor en 2026?', NULL, '#2756CD', '#FFFFFF', 5, 1, 7);
INSERT INTO categories (id, edition_id, slug, name, award_title, question, nomination_note, color, ink, slots, votable, position) VALUES (8, 1, 'accion-de-barrio', 'Acción de Barrio', NULL, NULL, 'Cuatro candidaturas propuestas por la FLAVI. Pendientes de comunicación oficial.', '#FFB627', '#081A54', 4, 1, 8);
INSERT INTO categories (id, edition_id, slug, name, award_title, question, nomination_note, color, ink, slots, votable, position) VALUES (9, 1, 'carnaval-linense', 'Carnaval Linense', 'Premio al Carnaval', '¿Qué persona, agrupación o iniciativa merece un premio por su aportación al Carnaval de La Línea en 2026?', NULL, '#3A86FF', '#FFFFFF', 5, 1, 9);
INSERT INTO categories (id, edition_id, slug, name, award_title, question, nomination_note, color, ink, slots, votable, position) VALUES (10, 1, 'vocacion-cofrade', 'Vocación Cofrade', 'Premio Cofrade', '¿Qué persona, hermandad, colectivo o iniciativa del mundo cofrade de La Línea merece este premio?', NULL, '#080B8F', '#FFFFFF', 3, 1, 10);
INSERT INTO categories (id, edition_id, slug, name, award_title, question, nomination_note, color, ink, slots, votable, position) VALUES (11, 1, 'impulso-cofrade', 'Impulso Cofrade', 'Premio Cofrade', '¿Qué persona, hermandad, colectivo o iniciativa del mundo cofrade de La Línea merece este premio?', NULL, '#080B8F', '#FFFFFF', 3, 1, 11);
INSERT INTO categories (id, edition_id, slug, name, award_title, question, nomination_note, color, ink, slots, votable, position) VALUES (12, 1, 'honor-a-la-trayectoria', 'Honor a la Trayectoria', 'Reconocimiento de la redacción', NULL, 'Reconocimiento especial concedido por la redacción de InfoLinense, sin votación popular. Pendiente de decisión.', '#D9E2F2', '#081A54', 1, 0, 12);

INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (1, 1, 'alfredo-mena', 'Alfredo Mena', NULL, 1, 0, 1);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (2, 1, 'desi-marquez', 'Desi Márquez', NULL, 1, 0, 2);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (3, 1, 'raquel-retamero', 'Raquel Retamero', NULL, 1, 0, 3);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (4, 1, 'sonia-castillo', 'Sonia Castillo', NULL, 1, 0, 4);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (5, 1, 'gonzalo-herrera', 'Gonzalo Herrera', NULL, 1, 0, 5);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (6, 2, 'xora-intelligence', 'Xora Intelligence', NULL, 1, 0, 1);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (7, 2, 'jd-otero', 'JD Otero', NULL, 1, 0, 2);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (8, 2, 'sintesis', 'Síntesis', NULL, 1, 0, 3);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (9, 2, 'quintiestudio', 'Quintiestudio', NULL, 1, 0, 4);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (10, 2, 'etikal-consulting', 'Etikal Consulting', 'Marta Castellano y Elena Trillo', 1, 0, 5);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (11, 2, 'grupo-mom', 'Grupo MoM', NULL, 0, 1, 90);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (12, 3, 'ohana', 'Ohana', NULL, 1, 0, 1);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (13, 3, 'esteban-del-mar', 'Esteban del Mar', NULL, 1, 0, 2);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (14, 3, 'la-pecera-libreria', 'La Pecera Librería', NULL, 1, 0, 3);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (15, 3, 'tienda-con-m', 'Tienda Con M', NULL, 1, 0, 4);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (16, 3, 'la-escocesa', 'La Escocesa', NULL, 1, 0, 5);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (17, 3, 'rocio-hernandez', 'Rocío Hernández', 'La Peluquería', 0, 1, 90);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (18, 4, 'laura-maras', 'Laura Maras', NULL, 1, 0, 1);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (19, 4, 'conchi-trudier', 'Conchi Trudier', NULL, 1, 0, 2);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (20, 4, 'maral-rios', 'Maral Ríos', NULL, 1, 0, 3);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (21, 4, 'queen-lidhia', 'Queen Lidhia', NULL, 1, 0, 4);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (22, 4, 'gavilana-atelier', 'Gavilana Atelier', NULL, 1, 0, 5);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (23, 5, 'josele-fotografia', 'Josele Fotografía', NULL, 1, 0, 1);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (24, 5, 'hippie-domaris', 'Hippie Domaris', NULL, 1, 0, 2);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (25, 5, 'berto', 'Berto', NULL, 1, 0, 3);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (26, 5, 'aday-montes', 'Aday Montes', NULL, 1, 0, 4);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (27, 5, 'zequi-rojas', 'Zequi Rojas', NULL, 1, 0, 5);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (28, 6, 'academia-la-fuente', 'Academia La Fuente', NULL, 1, 0, 1);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (29, 6, 'nemesio-andrades-neme', 'Nemesio Andrades (Neme)', NULL, 1, 0, 2);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (30, 6, 'noelia-valle-ruiz', 'Noelia Valle Ruiz', NULL, 1, 0, 3);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (31, 6, 'nuria-vinas-martinez', 'Nuria Viñas Martínez', NULL, 1, 0, 4);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (32, 6, 'ies-tolosa', 'IES Tolosa', 'Línea Racing Team', 1, 0, 5);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (33, 7, 'crocheteras-linenses', 'Crocheteras Linenses', NULL, 1, 0, 1);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (34, 7, 'acali-el-volao', 'ACALI El Volaó', NULL, 1, 0, 2);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (35, 7, 'asociacion-ruta-de-los-bunkeres', 'Asociación Ruta de los Búnkeres', NULL, 1, 0, 3);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (36, 7, 'los-locos-del-parque', 'Los Locos del Parque', NULL, 1, 0, 4);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (37, 7, 'afal', 'AFAL', NULL, 1, 0, 5);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (38, 9, 'los-desparasitaos', 'Los Desparasitaos', NULL, 1, 0, 1);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (39, 9, 'acali-el-volao-carnaval-linense', 'ACALI El Volaó', NULL, 1, 0, 2);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (40, 9, 'la-bateria', 'La Batería', NULL, 1, 0, 3);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (41, 9, 'disfraz-de-coplas', 'Disfraz de Coplas', NULL, 1, 0, 4);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (42, 9, 'juan-miguel-novo-vazquez', 'Juan Miguel Novo Vázquez', NULL, 1, 0, 5);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (43, 10, 'ernesto-frigolet', 'Ernesto Frigolet', NULL, 1, 0, 1);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (44, 10, 'antonia-gil', 'Antonia Gil', NULL, 1, 0, 2);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (45, 10, 'josema-sanchez-bautista', 'Josema Sánchez Bautista', NULL, 1, 0, 3);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (46, 11, 'tertulia-cofrade-el-punal', 'Tertulia Cofrade El Puñal', NULL, 1, 0, 1);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (47, 11, 'silas-restauracion', 'Silas Restauración', NULL, 1, 0, 2);
INSERT INTO nominees (id, category_id, slug, name, subtitle, published, is_alternate, position) VALUES (48, 11, 'cinema-cofrade', 'Cinema Cofrade', NULL, 1, 0, 3);

INSERT INTO pages (slug, title, summary, body, status, position, updated_by) VALUES ('bases', 'Bases de los Premios InfoLinense 2026', 'Normas de la I edición: candidaturas, votación popular, desempates, prevención del fraude y publicación de resultados.', '## 1. Objeto

Los Premios InfoLinense reconocen cada año a personas, profesionales, empresas, comercios, centros educativos y asociaciones que destacan por su contribución a La Línea de la Concepción. La I edición corresponde a 2026.

## 2. Organización

Los premios están organizados por el periódico digital InfoLinense. [PENDIENTE: razón social, NIF y domicilio de la entidad organizadora.]

## 3. Categorías

La edición 2026 consta de once categorías con votación popular y un reconocimiento especial, Honor a la Trayectoria, concedido por la redacción de InfoLinense sin votación popular. Las categorías y sus candidaturas se publican en esta web.

## 4. Candidaturas

Las candidaturas de cada categoría se presentan oficialmente el 25 de noviembre de 2026. Las de la categoría Acción de Barrio son propuestas por la FLAVI.

[PENDIENTE: criterios de selección de las candidaturas y quién los aplica.]

Ser nominado no supone haber ganado el premio: significa formar parte de la lista de candidaturas que el público puede votar.

## 5. Votación popular

- Las personas ganadoras de las categorías con votación se eligen por votación popular a través de premios.infolinense.com.
- Cada persona puede emitir una única papeleta. En ella puede votar a una candidatura en cada categoría que desee y dejar en blanco las demás.
- Una vez confirmada, la papeleta no puede modificarse.
- Las fechas de apertura y cierre de la votación se publican en esta web en horario peninsular español (Europe/Madrid).
- Los resultados parciales no se hacen públicos durante la votación.

## 6. Desempates

[PENDIENTE: criterio de desempate en caso de igualdad de votos válidos.]

## 7. Prevención del fraude

La votación no exige registrarse ni facilitar datos personales. Para evitar votos automatizados o repetidos se aplican las medidas descritas en la página Sistema de votación. La organización podrá anular las papeletas que considere fraudulentas mediante un procedimiento registrado en el que constan el motivo y la persona responsable de cada decisión.

## 8. Premio de Honor a la Trayectoria

Lo concede la redacción de InfoLinense, sin votación popular.

## 9. Publicación de resultados

No habrá gala presencial. Los resultados se anunciarán digitalmente en esta web en la fecha que publique la organización. Cada persona o entidad ganadora recibirá un trofeo físico.

[PENDIENTE: forma y plazo de entrega de los trofeos.]

## 10. Patrocinio

Los patrocinadores no intervienen en la selección de candidaturas, en la votación ni en los resultados.

## 11. Aceptación de las bases

[PENDIENTE: cláusula de aceptación y aspectos jurídicos revisados por la organización.]
', 'draft', 1, 'sistema');
INSERT INTO pages (slug, title, summary, body, status, position, updated_by) VALUES ('sistema-de-votacion', 'Sistema de votación', 'Cómo se vota, qué medidas protegen la votación y cuáles son sus límites.', '## Cómo votar

- Entra en «Vota» mientras la votación esté abierta.
- Elige una candidatura en cada categoría que quieras votar. Puedes dejar categorías sin votar.
- Revisa tu papeleta y confírmala. Después ya no se puede modificar.
- Recibirás un código de comprobante para comprobar más tarde que tu papeleta está registrada.

## Qué datos se usan

Para votar no hace falta registrarse ni dar tu nombre, tu correo o tu teléfono.

Para impedir votos repetidos, el sistema guarda identificadores técnicos seudonimizados: una huella cifrada del dispositivo y otra de la conexión desde la que se vota. No se guarda la dirección IP en claro. Los detalles están en la Política de privacidad.

## Medidas contra el fraude

- **Verificación anti-bots** con Cloudflare Turnstile en cada papeleta.
- **Una papeleta por dispositivo.** El identificador se conserva en el navegador de dos formas distintas, de modo que borrar las cookies no basta para votar otra vez.
- **Control de conexiones.** Varias personas pueden compartir conexión (una familia, un centro de trabajo o un instituto), así que la dirección de red nunca se usa como prueba única de identidad. Cuando desde una misma conexión llega un volumen inusual de papeletas, o una papeleta repite navegador y red de otra anterior, queda en revisión en lugar de rechazarse.
- **Validación en el servidor.** Todas las selecciones se comprueban en el servidor: no es posible votar a candidaturas que no correspondan a su categoría ni manipular la papeleta desde el navegador.
- **Registro de incidencias.** Los intentos anómalos se registran para su revisión.
- **Anulación auditada.** Cualquier anulación de papeletas queda registrada con su motivo y la persona responsable.

## Límites del sistema

Ningún sistema de votación abierto y sin registro puede garantizar de forma absoluta que cada persona vote una sola vez. Una persona decidida podría votar desde varios dispositivos y conexiones diferentes. Las medidas anteriores dificultan ese comportamiento, lo hacen detectable y permiten a la organización anular las papeletas fraudulentas.

## Resultados

Los recuentos no se publican durante la votación. Solo se cuentan las papeletas válidas. [PENDIENTE: criterio de desempate, que figurará también en las Bases.]
', 'draft', 2, 'sistema');
INSERT INTO pages (slug, title, summary, body, status, position, updated_by) VALUES ('organizacion', 'Organización', 'Quién organiza los Premios InfoLinense y cómo se garantiza su independencia.', '## InfoLinense

Los Premios InfoLinense están organizados por InfoLinense, periódico digital de actualidad de La Línea de la Concepción y el Campo de Gibraltar.

[PENDIENTE: equipo responsable de los premios.]

## Independencia

- Los ganadores de las categorías con votación los elige el público.
- El reconocimiento Honor a la Trayectoria lo concede la redacción de InfoLinense.
- Los patrocinadores no intervienen en la selección de candidaturas, en la votación ni en los resultados.
- Las decisiones administrativas sobre la votación quedan registradas.

## Contacto

Para cualquier consulta sobre los premios, escribe a [redaccion@infolinense.com](mailto:redaccion@infolinense.com).
', 'draft', 3, 'sistema');
INSERT INTO pages (slug, title, summary, body, status, position, updated_by) VALUES ('privacidad', 'Política de privacidad', 'Qué datos trata esta web, con qué finalidad y cómo ejercer tus derechos.', '## Responsable del tratamiento

[PENDIENTE: identidad del responsable (razón social o nombre), NIF, domicilio y correo de contacto para protección de datos.]

## Datos que tratamos al votar

Para votar no pedimos nombre, correo electrónico ni teléfono. Para impedir votos repetidos y detectar fraudes tratamos únicamente:

- un identificador aleatorio del dispositivo, guardado en una cookie técnica y en el almacenamiento local del navegador;
- huellas cifradas (seudonimizadas) de la dirección de red y del navegador, calculadas con una clave secreta. La dirección IP no se guarda en claro;
- el contenido de la papeleta y su fecha.

## Finalidad y base jurídica

Garantizar una votación limpia: una papeleta por persona y prevención de votos automatizados o fraudulentos. [PENDIENTE: base jurídica validada por la organización.]

## Verificación anti-bots

La votación usa Cloudflare Turnstile para distinguir personas de programas automatizados. Cloudflare trata datos técnicos del navegador para esa comprobación. [PENDIENTE: referencia a la política de Cloudflare y a las garantías de transferencia internacional.]

## Conservación

[PENDIENTE: plazo de conservación. Propuesta técnica: eliminar las huellas de red y navegador cuando concluya el periodo de reclamaciones tras la publicación de resultados.]

## Cookies

Esta web utiliza una cookie técnica necesaria para la votación y, en el panel de administración, una cookie de sesión. No utiliza cookies publicitarias ni de analítica.

## Derechos

[PENDIENTE: cómo ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad, y el derecho a reclamar ante la Agencia Española de Protección de Datos.]
', 'draft', 4, 'sistema');
INSERT INTO pages (slug, title, summary, body, status, position, updated_by) VALUES ('aviso-legal', 'Aviso legal', 'Información sobre el titular de esta web y sus condiciones de uso.', '## Titular

[PENDIENTE: denominación o razón social, NIF, domicilio, correo electrónico y, en su caso, datos registrales del titular de premios.infolinense.com.]

## Objeto

Esta web informa sobre los Premios InfoLinense y permite participar en su votación popular.

## Propiedad intelectual

La marca, el logotipo y los contenidos de los Premios InfoLinense pertenecen a sus titulares. Las fotografías de las candidaturas se publican con la autorización correspondiente. [PENDIENTE: confirmar la gestión de autorizaciones de imagen.]

## Responsabilidad

[PENDIENTE: condiciones de uso y limitación de responsabilidad revisadas por la organización.]
', 'draft', 5, 'sistema');
INSERT INTO pages (slug, title, summary, body, status, position, updated_by) VALUES ('contacto', 'Contacto', 'Escríbenos para cualquier consulta sobre los Premios InfoLinense.', '## Organización de los premios

Correo electrónico: [redaccion@infolinense.com](mailto:redaccion@infolinense.com)

Instagram: [@infolinense](https://www.instagram.com/infolinense/)

## Candidaturas

Si eres una de las candidaturas y quieres actualizar tu fotografía o tu presentación, escríbenos al correo anterior.

## Patrocinio

Si tu empresa o entidad quiere colaborar con los Premios InfoLinense, contacta con la organización.
', 'draft', 6, 'sistema');

-- Fichas de candidaturas (dossier del 24/11/2026). Generado por scripts/seed/fichas.py.
-- Solo rellena campos vacíos; no publica ni despublica nada.

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Remo de mar · Club Remo de Mar La Línea' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Campeón de Europa sub-19 de beach sprint y bronce mundial en doble mixto; uno de los grandes nombres del remo linense en 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Alfredo Mena es un remero linense especializado en remo de mar y beach sprint. En 2026 protagonizó una temporada de resultados internacionales, con un título europeo conseguido ante el público de su ciudad.

Su medalla de bronce en el Mundial de Qingdao, formando pareja con Blanca López, confirmó su progresión en una modalidad con creciente proyección internacional.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Campeón de Europa sub-19 de beach sprint en doble mixto, con Blanca López.
Bronce en el Mundial sub-19 de beach sprint en Qingdao (China).
Campeón de España sub-19 de doble masculino con Abel Salas.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Campeón europeo - Europa Sur | https://www.europasur.es/deportes/linense-alfredo-mena-campeon-europa-sub-19-remo-beach-sprint-la-linea_0_2007999097.html
Bronce mundial - Europa Sur | https://www.europasur.es/deportes/linense-alfredo-mena-bronce-doble_0_2008295367.html
Campeonato de España | https://www.europasur.es/deportes/alejandra-garcia-paula-pecino-bronce_0_2008015305.html' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'alfredo-mena';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Taekwondo · Poomsae · Club Seúl Gym' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Medallista en el Campeonato de España de poomsae y subcampeona en la prueba de trío del Open de España 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Desirée Márquez representa al taekwondo linense a través del Club Seúl Gym. Compite en poomsae, modalidad que exige precisión, equilibrio y dominio técnico.

Durante 2026 sumó nuevos podios en pruebas de alcance autonómico y nacional, tanto en competición individual como por equipos.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Bronce de poomsae en el Campeonato de España, según reconocimiento al Seúl Gym de febrero.
Plata en trío 31-50 en el Open de España de poomsae de Ciudad Real.
Bronce en trío en el Campeonato de Andalucía de junio.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Reconocimiento al Seúl Gym | https://deportescg.es/2026/02/07/el-alcalde-de-la-linea-recibe-a-los-componentes-del-seul-gym-tras-sus-exitos-en-el-reciente-campeonato-de-espana/
Federación Andaluza de Taekwondo | https://www.fataekwondo.org/open-espana-poomsae-24-mayo-2026-ciudad-real/
Andaluz de poomsae | https://deportescg.es/2026/06/27/el-seul-gym-linense-brilla-en-el-campeonato-de-andalucia-de-taekwondo-y-deporte-base-con-un-total-de-16-medallas/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'desi-marquez';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Vela · ILCA 6 · Real Club Náutico de La Línea' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Ganadora de la Copa de Andalucía de ILCA 6 y representante linense en el Campeonato de Europa sub-21.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Raquel Retamero compite en vela ligera en la clase ILCA 6, una especialidad que combina preparación física, lectura del viento y estrategia. Forma parte de la cantera de alto rendimiento de la vela andaluza.

En 2026 logró una victoria femenina en la Copa de Andalucía y participó en el Campeonato de Europa sub-21, llevando el nombre de La Línea a una cita internacional.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Campeona de la Copa de Andalucía de ILCA 6.
Subcampeona femenina en la XXI Semana Olímpica Andaluza.
Participación en el Europeo sub-21 de ILCA 6 (40.º puesto).' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Copa de Andalucía | https://www.europasur.es/deportes/linense-raquel-retamero-subcampeona-femenina-ilca-4-vela-campeona-andalucia_0_2006042341.html
Europeo sub-21 | https://www.europasur.es/deportes/linense-raquel-retamero-acaba-puesto_0_2008272328.html' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'raquel-retamero';

UPDATE nominees SET
  name = 'Sonia Castillo Arenillas',
  slug = 'sonia-castillo-arenillas',
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Judo · −48 kg · Club Judo Salesianos' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Subcampeona del sector sur de España absoluto de judo y medallista de bronce en la Supercopa de España júnior de Madrid.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Sonia Castillo Arenillas ha construido una trayectoria competitiva desde las categorías infantil y cadete hasta júnior y absoluta. Según los datos facilitados por la propia deportista, ha sido campeona de Andalucía en todas esas categorías.

En su palmarés nacional figuran dos subcampeonatos del sector sur de España (júnior y absoluto), dos bronces en supercopas de España y clasificaciones para fases finales nacionales en todas las categorías, tres de ellas en categoría absoluta. También ha logrado un bronce nacional de sambo.

Sus resultados más recientes incluyen la plata del sector sur absoluto, la clasificación para la final nacional y un bronce en la Supercopa de España júnior de Madrid.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Subcampeona del sector sur del Campeonato de España absoluto de judo.
Clasificada para la final del Campeonato de España absoluto.
Bronce en la Supercopa de España júnior de Madrid (Colmenar Viejo).' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Noticia en InfoLinense | https://infolinense.com/articulo/la-linense-sonia-castillo-logra-el-bronce-en-la-supercopa-de-espana-398
Final nacional absoluta | https://www.diarioarea.com/la-linea/la-linense-sonia-castillo-se-mete-en-la-final-del-campeonato-de-espana-absoluto-de-judo/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'sonia-castillo';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Deportista · disciplina pendiente de confirmar' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Candidatura deportiva propuesta por los lectores; pendiente de confirmar su disciplina y sus resultados en 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Esta candidatura está pendiente de recibir los datos deportivos del nominado. La ficha se completará con su disciplina, club y principales logros una vez confirmada su identidad.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN NULL ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'gonzalo-herrera';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Tecnología · inteligencia artificial' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Impulsa desde el Campo de Gibraltar soluciones de inteligencia artificial aplicadas a necesidades reales de empresas y organizaciones.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Xora Intelligence es un proyecto tecnológico nacido en el Campo de Gibraltar con la intención de acercar la inteligencia artificial a las necesidades cotidianas de los negocios.

Su propuesta se basa en desarrollar herramientas y automatizaciones útiles, vinculando innovación y tejido empresarial comarcal.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Presentación pública y puesta en marcha del proyecto durante 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Sobre Xora Intelligence | https://www.xoraagencia.com/sobre-nosotros.html' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'xora-intelligence';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Barbería · José David Otero' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Emprendedor del sector de la barbería y campeón de la categoría Fast Fade, reconocido por su técnica en cortes degradados.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'José David Otero ha desarrollado su proyecto de barbería en La Línea, apostando por la formación técnica y la especialización en cortes masculinos.

Entre sus reconocimientos figura el título de campeón de la categoría Fast Fade, destacado por el propio nominado.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Instagram oficial | https://www.instagram.com/jd.otero.barber/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'jd-otero';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Restauración · Cristina Gutiérrez Vergua' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Nuevo proyecto gastronómico abierto en 2026 que reinterpreta la cocina tradicional gaditana desde La Línea.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'La cocinera linense Cristina Gutiérrez Vergua abrió Síntesis en febrero de 2026 en la plaza de la Constitución, tras una trayectoria en cocinas de la comarca.

El restaurante propone una lectura contemporánea de los sabores de la frontera y la memoria culinaria gaditana, ampliando la oferta gastronómica de La Línea.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Apertura de Síntesis en La Línea el 12 de febrero de 2026.
Repercusión en medios especializados y en Cadena SER durante 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Reportaje sobre la apertura | https://www.lavozdelsur.es/el-gusto-es-suyo/cristina-gutierrez-vergua-sintesis-la-linea/
Cadena SER | https://cadenaser.com/andalucia/2026/06/10/cristina-gutierrez-abre-las-puertas-de-sintesis-un-restaurante-que-convierte-la-memoria-gastronomica-gaditana-en-alta-cocina-radio-algeciras/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'sintesis';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Estudio creativo · Silvia Quintanilla' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Estudio creativo que organizó las jornadas Mujeres que Inspiran para promover el liderazgo y el emprendimiento femenino.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Quintiestudio es el proyecto creativo dirigido por Silvia Quintanilla, profesional del diseño y la comunicación visual.

Además de su trabajo con marcas y proyectos empresariales, en 2026 impulsó en La Línea una nueva edición de las jornadas Mujeres que Inspiran, con ponencias y espacios de encuentro para emprendedoras.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Organización de las II Jornadas Mujeres que Inspiran en marzo de 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Ayuntamiento: Mujeres que Inspiran | https://lalinea.es/el-palacio-de-congresos-sera-escenario-el-12-de-marzo-de-las-ii-jornadas-de-mujeres-que-inspiran-liderazgo-y-emprendimiento-en-el-campo-de-gibraltar/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'quintiestudio';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' OR subtitle = 'Marta Castellano y Elena Trillo' THEN 'Marta Castellano y Elena Trillo · consultoría' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Firma fundada por Marta Castellano y Elena Trillo, finalista provincial de los Premios Emprendemos TOP50 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Etikal Consulting combina consultoría social, transformación digital y una aproximación responsable al uso de la inteligencia artificial.

Sus impulsoras, Marta Castellano y Elena Trillo, recibieron en 2026 el reconocimiento como finalistas en la fase provincial de Cádiz de los Premios Emprendemos TOP50.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Seleccionada entre las quince candidaturas finalistas del comité provincial de Cádiz en los Premios Emprendemos TOP50 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Empresa | https://etikalconsulting.com/
Reconocimiento municipal | https://lalinea.com.es/noticias/el-alcalde-felicita-a-la-empresa-linense-etikal-consulting-por-su-designacion-como-finalista-en-los-' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'etikal-consulting';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Moda · tienda física y online' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Boutique linense que combina la cercanía del comercio de barrio con una oferta de moda accesible también a través de internet.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Ohana es una tienda de moda que reivindica la atención cercana y una relación personal con sus clientas. Su proyecto combina el establecimiento de proximidad con la venta online.

La candidatura reconoce la apuesta por mantener el comercio local adaptándolo a nuevos hábitos de compra.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Tienda online de Ohana | https://modasohana.com/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'ohana';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Sastrería y moda · comercio histórico' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Más de medio siglo dedicado a la moda, la sastrería y el asesoramiento personalizado a generaciones de linenses.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Esteban del Mar representa la continuidad del comercio especializado en La Línea. Su oferta reúne moda y servicios de sastrería y camisería a medida.

La candidatura destaca la permanencia de un establecimiento ligado a varias generaciones y el valor del trato personalizado frente a la uniformidad comercial.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Referencia comercial | https://actualidadsur.es/sitio/tienda-de-moda-para-hombres-sastreria-y-camiseria-la-linea-de-la-concepcion' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'esteban-del-mar';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Librería · Marta Ojeda' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Convierte la librería en un espacio de animación a la lectura, con cuentacuentos y actividades para los más pequeños.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'La Pecera es una librería linense que combina su actividad comercial con la promoción cultural. Marta Ojeda participa en encuentros con lectores y propuestas infantiles.

En 2026 la librería estuvo presente en la Feria del Libro de La Línea, donde organizó actividades de cuentacuentos y acercamiento a los libros.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Participación en la Feria del Libro de La Línea 2026.
Sesiones de cuentacuentos a cargo de Marta Ojeda durante la feria.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Programa de Feria del Libro | https://lalinea.es/areas/promocion-social-cultural-y-digital/cultura/37feriadellibro/
Crónica Feria del Libro | https://lalinea.com.es/noticias/la-37-feria-del-libro-concluye-con-una-alta-afluencia-de-publico-y-respaldo-a-la-creacion-literaria' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'la-pecera-libreria';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Moda de autor · Manuel Sempere' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'La firma de Manuel Sempere llevó sus diseños a la pasarela de La Línea Flamenca 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Tienda Con M es una propuesta de moda vinculada al creador Manuel Sempere. Su trabajo pone el acento en el diseño y la confección con identidad propia.

Durante 2026 presentó sus creaciones en La Línea Flamenca, un escaparate para diseñadores y comercios de la ciudad.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Participación de Manuel Sempere y la firma Con M en La Línea Flamenca 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Pasarela La Línea Flamenca | https://lalinea.es/los-jardines-saccone-acogen-con-gran-exito-de-publico-la-primera-edicion-de-la-linea-flamenca/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tienda-con-m';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Comercio histórico · fundada en La Línea en 1932' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Fundada en 1932, mantiene viva una de las historias más longevas del comercio linense y se ha adaptado a la venta online.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'La Escocesa abrió su establecimiento de la calle Real el 14 de marzo de 1932, continuando una trayectoria familiar que había comenzado anteriormente en Gibraltar.

Generación tras generación ha mantenido su vinculación con el centro de La Línea, adaptando su oferta y su atención a nuevas formas de compra.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN '94 años de presencia en La Línea en 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Historia oficial de La Escocesa | https://www.laescocesa.es/sobre-nosotros/
Cadena SER | https://cadenaser.com/andalucia/2022/12/13/la-escocesa-uva-a-la-constancia-de-la-ser-radio-algeciras/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'la-escocesa';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Ilustración y tatuaje · Lauramaras' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Ilustradora y tatuadora linense con un universo gráfico propio, presente en proyectos editoriales y creativos.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Laura Martínez Ramos, conocida artísticamente como Lauramaras, desarrolla su trabajo entre la ilustración y el tatuaje desde su estudio en La Línea.

Su estilo personal se traslada a proyectos creativos y publicaciones ilustradas, conectando su trabajo artístico con su ciudad.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Perfil en Europa Sur | https://www.europasur.es/ocio/aceituna-libros-iniciarse-sabor-andaluz_0_2006025669.html' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'laura-maras';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Ilustración y cómic' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Ganadora de la beca internacional Cómic Barcelona–Lyon 2026 para desarrollar su obra durante una residencia artística.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Conchi Trudier es una ilustradora y autora de cómic nacida en La Línea. Ha construido una carrera vinculada a la narración gráfica y la creación editorial.

En 2026 obtuvo la cuarta Beca Cómic Barcelona–Lyon, un reconocimiento internacional que le permitirá desarrollar su proyecto en una residencia de tres meses en Francia.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Ganadora de la cuarta edición de la Beca Cómic Barcelona–Lyon en 2026.
Presentación en La Línea de una propuesta de festival dedicado al fanzine y al cómic.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Organización del premio FICOMIC | https://www.ficomic.com/es/noticias.cfm/id/42961/conchi-trudier-ganadora-cuarta-edicion-beca-comic-barcelona-%E2%80%93-lyon.htm
Propuesta de festival en La Línea | https://lalinea.es/la-ciudad-podria-acoger-un-festival-de-fanzine-para-profesionales-de-las-artes-graficas-y-el-comic/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'conchi-trudier';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Artista plástica · pintura contemporánea' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Premio Cultura en Femenino de la provincia de Cádiz 2026 y finalista autonómica de Emprendimiento y Liderazgo Femenino.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Maral Ríos es una artista plástica nacida en La Línea cuya obra está profundamente vinculada al mar. Trabaja con pintura y texturas para representar el paisaje, la memoria y la emoción.

En 2026 recibió el Premio Cultura en Femenino de la provincia de Cádiz y fue seleccionada como finalista autonómica en la categoría Cultura de los Premios de Emprendimiento y Liderazgo en Femenino de Andalucía.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Premio Cultura en Femenino en la V edición provincial celebrada en Cádiz en 2026.
Exposición «Somos el Mar», junio de 2026.
Finalista autonómica de los Premios de Emprendimiento y Liderazgo en Femenino de Andalucía, categoría Cultura (confirmado por la nominada).' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Biografía oficial | https://maralrios.es/biografia/
Premio provincial | https://www.europasur.es/tarifa/begona-arana-maral-rios-jennifer-gutierrez-premios-emprendimiento-liderazgo-femenino_0_2007284862.amp.html' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'maral-rios';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Arte drag · escena y expresión escénica' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Distinguida en los Premios Roja Directa Diversidad 2026 por una década de trayectoria en el arte drag.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Queen Lidhia ha desarrollado una trayectoria artística en el ámbito drag, donde combina interpretación, estética y expresión escénica.

En octubre de 2026 recibió un reconocimiento en los Premios Roja Directa Diversidad por sus diez años de actividad y su contribución a la visibilidad LGTBI+.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Reconocimiento Juventud, Visibilidad y Futuro LGTBI+ en los Premios Roja Directa Diversidad 2026.
Diez años de trayectoria artística reconocidos en 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Premios Roja Directa | https://www.andaluciainformacion.es/campo-gibraltar/campo-gibraltar-comarca/roja-directa-celebra-quienes-abren-camino-diversidad/202610151826063507867.amp.html' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'queen-lidhia';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Creación artística · disciplina por confirmar' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Candidatura propuesta por el público; su obra y sus principales proyectos de 2026 están pendientes de documentarse.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Gavilana Atelier ha sido propuesta para Arte con Firma. La presentación definitiva se completará cuando el proyecto confirme su actividad, obras y resultados de 2026.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN NULL ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'gavilana-atelier';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Fotografía y contenido audiovisual' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Creador nominado por su trabajo fotográfico; se están recopilando sus principales coberturas y publicaciones de 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Josele Fotografía figura entre los creadores propuestos por los lectores. Su ficha recogerá sus trabajos y publicaciones más relevantes una vez contrastados con el propio autor.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN NULL ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'josele-fotografia';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'TikTok · viajes y divulgación cotidiana' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Creadora de viajes y naturaleza con más de un millón de seguidores en TikTok y una destacada proyección digital.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Hippie Domaris es una creadora de contenido linense conocida por sus vídeos de viajes, naturaleza y experiencias personales.

Su comunidad en TikTok superaba el millón de seguidores en octubre de 2026, lo que demuestra una proyección digital fuera del ámbito comarcal.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Más de un millón de seguidores en TikTok según medición pública de octubre de 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Estadísticas del perfil | https://tokranks.com/all/creator/hippie.domaris
Trayectoria en Europa Sur | https://www.europasur.es/vivir-el-sur/Hablar-llanito-Hippie-Domaris-explica-perfil-TikTok_0_1787221522.html' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'hippie-domaris';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Creación digital · perfil pendiente' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Candidatura propuesta por los lectores; pendiente de identificar el perfil y las publicaciones de 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'La ficha de Berto se completará tras confirmar a qué creador se refiere esta nominación y qué trabajo digital ha desarrollado en 2026.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN NULL ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'berto';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Fotografía y vídeo de naturaleza' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Sus imágenes de una manga marina y la bioluminiscencia de la bahía dieron repercusión a La Línea en 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Aday Montes crea y comparte fotografías y vídeos de fenómenos naturales en La Línea y el Campo de Gibraltar.

Durante 2026 sus registros de una manga marina y de la bioluminiscencia en la bahía trascendieron las redes sociales y fueron recogidos por medios informativos.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Captó una manga marina en La Línea en febrero de 2026.
Registró en vídeo la bioluminiscencia de la Bahía de Algeciras en septiembre de 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Manga marina | https://www.europasur.es/lalinea/registrada-manga-marina-generada-linea-turbonadas_0_2005797110.html
Bioluminiscencia | https://www.europasur.es/campo-de-gibraltar/bahia-algeciras-ilumina-azul-electrico_0_2007911977.amp.html' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'aday-montes';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Creación digital · perfil pendiente' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Candidatura propuesta por los lectores; sus contenidos y principales resultados de 2026 están pendientes de confirmar.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Zequi Rojas figura entre los nominados de Creación en Red. La presentación se completará al confirmar su perfil y las publicaciones que mejor representan su trabajo en 2026.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN NULL ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'zequi-rojas';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Refuerzo educativo · La Línea' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Acompaña el aprendizaje de estudiantes linenses con refuerzo académico y atención cercana a sus necesidades.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Academia La Fuente es un proyecto de apoyo educativo en La Línea, orientado al acompañamiento académico y al refuerzo de competencias escolares.

Su nominación reconoce el trabajo diario de quienes ayudan al alumnado a afrontar sus estudios y ganar confianza en el proceso de aprendizaje.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Facebook oficial facilitado por la candidatura | https://www.facebook.com/profile.php?id=61563388606945' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'academia-la-fuente';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Maestro · CEIP Santiago' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Tercer premio nacional NeuroEduca 2026 por un proyecto sobre neuroarquitectura y diseño de espacios educativos.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Nemesio Andrades Rodríguez es docente del CEIP Santiago de La Línea y desarrolla propuestas para mejorar la experiencia de aprendizaje en el aula.

En noviembre de 2026 consiguió el tercer puesto en la primera edición de los Premios NeuroEduca, celebrados en SIMO Educación, por su trabajo sobre espacios escolares y neuroarquitectura.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Tercer puesto en los I Premios NeuroEduca 2026.
Reconocimiento a su proyecto sobre diseño de espacios educativos.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Premio NeuroEduca | https://www.diarioarea.com/la-linea/el-maestro-linense-nemesio-andrades-logra-el-tercer-puesto-en-los-i-premios-neuroeduca/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'nemesio-andrades-neme';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Psicopedagoga · «Ni de Venus ni de Marte»' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Impulsa un proyecto altruista de divulgación y acompañamiento a familias y docentes sobre altas capacidades y TDAH.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Noelia Valle Ruiz es psicopedagoga, maestra y especialista en altas capacidades. Su iniciativa Ni de Venus ni de Marte ofrece información y orientación a familias y profesionales de la educación.

Su labor incluye charlas, formación y divulgación para romper prejuicios y favorecer una atención educativa más adecuada a niños y niñas con necesidades específicas.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Colaboración prevista en el programa municipal de altas capacidades para 2026; confirmar actuaciones efectivamente realizadas.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Programa municipal sobre altas capacidades | https://lalinea.es/el-ayuntamiento-desarrollara-un-programa-sobre-altas-capacidades-en-centros-educativos/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'noelia-valle-ruiz';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Formación · Centro V&G' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Profesional de la formación nominada por su contribución educativa; pendiente de concretar sus proyectos y resultados de 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Nuria Viñas Martínez está vinculada a la actividad formativa. La explicación de su candidatura se completará tras confirmar su función y los proyectos desarrollados este año.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Perfil profesional | https://es.linkedin.com/in/nuria-vi%C3%B1as-mart%C3%ADnez-5364591b3' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'nuria-vinas-martinez';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' OR subtitle = 'Línea Racing Team' THEN 'Proyecto STEM Racing · alumnado de ESO y Bachillerato' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Proyecto en el que estudiantes del IES Tolosa diseñan un monoplaza de Fórmula 1 a escala y aprenden ingeniería y trabajo en equipo.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Línea Racing Team reúne a estudiantes del IES Tolosa de La Línea en torno a un reto de diseño e ingeniería inspirado en la Fórmula 1.

El equipo participó durante 2026 en el programa internacional STEM Racing, en el que se ponen en práctica conocimientos tecnológicos, comunicación, diseño y organización de proyectos.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Desarrollo de un prototipo de Fórmula 1 a escala para el programa STEM Racing 2026.
Preparación para las finales regionales de Andalucía de mayo de 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Proyecto del IES Tolosa | https://lalinea.es/el-alcalde-recibe-a-alumnos-del-ies-tolosa-que-integran-el-proyecto-educativo-linea-racing-team-para-la-elaboracion-de-un-prototipo-a-escala-de-formula-1/
Finales regionales | https://lalinea.com.es/noticias/alcaidesa-marina-actuara-como-co-patrocinador-oficial-del-equipo-linea-racing-team-del-instituto-tol' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'ies-tolosa';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Asociación de Crocheteras Linenses' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Llenaron de color la calle Méndez Núñez con nuevas composiciones tejidas a mano para la Calle de los Mandalas.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'La Asociación de Crocheteras Linenses reúne a personas que ponen el trabajo artesanal al servicio de la imagen y la vida de la ciudad.

Sus intervenciones urbanas, como la Calle de los Mandalas, transforman espacios públicos mediante piezas elaboradas colectivamente y generan un punto de encuentro en el centro de La Línea.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Confección de 760 piezas para la nueva decoración de la calle Méndez Núñez en septiembre de 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Preparación de los mandalas 2026 | https://lalinea.es/turismo-comienza-la-instalacion-de-paraguas-en-la-calle-cadalso/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'crocheteras-linenses';

UPDATE nominees SET
  slug = 'acali-el-volao-vida-asociativa',
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Asociación de Carnavaleros Linenses' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Promovió un campamento gratuito para que 25 menores conocieran las coplas, la música y la tradición del Carnaval.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'ACALI El Volaó trabaja para mantener el Carnaval linense presente durante todo el año, más allá de las semanas de actuaciones.

En 2026 organizó un campamento para la cantera, acercando a niños y niñas al repertorio, la interpretación y el ambiente de una agrupación carnavalesca.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Primer campamento de verano para la cantera del Carnaval en 2026.
25 plazas cubiertas en el campamento gratuito.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Web de ACALI | https://acalivolao.com/
Campamento de verano | https://cadenaser.com/andalucia/2026/08/27/la-cantera-del-carnaval-de-la-linea-se-sube-al-escenario-tras-un-campamento-de-verano-de-acali-radio-algeciras/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'acali-el-volao';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Patrimonio e historia local' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Colabora en la divulgación de las fortificaciones linenses mediante visitas que reunieron a 1.600 participantes hasta septiembre.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'La Asociación Ruta de los Búnkeres promueve el conocimiento del patrimonio defensivo de La Línea y su contexto histórico.

Su colaboración con las rutas municipales permite acercar a vecinos y visitantes antiguas fortificaciones, entre ellas las del entorno del Parque Princesa Sofía y Santa Bárbara.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Colaboración en las visitas de las fortificaciones que sumaron 1.600 participantes entre enero y septiembre de 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Balance municipal de rutas | https://lalinea.es/mas-de-1-200-personas-participaron-desde-enero-en-las-rutas-guiadas-por-la-zona-centro-organizadas-por-turismo/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'asociacion-ruta-de-los-bunkeres';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Protección ambiental · Parque Princesa Sofía' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Reconocidos oficialmente por su trabajo de conservación de la flora y la fauna del Parque Princesa Sofía.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'La asociación Los Locos del Parque impulsa la protección del patrimonio natural de La Línea, con especial atención al Parque Princesa Sofía.

En 2026 recibió una mención honorífica municipal por su labor en el cuidado del entorno y la sensibilización sobre su biodiversidad.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Mención honorífica municipal en enero de 2026 por su trabajo ambiental.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Honores y Distinciones municipales 2026 | https://lalinea.es/la-linea-de-la-concepcion-celebra-el-acto-institucional-de-entrega-de-honores-y-distinciones-2026/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'los-locos-del-parque';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Agrupación Fotográfica Artística Linense' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Celebró seis décadas de fotografía en La Línea con la exposición colectiva «Sexagenia 6.0» en el Museo Cruz Herrera.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'La Agrupación Fotográfica Artística Linense (AFAL) es una entidad cultural dedicada a difundir y fomentar la fotografía.

En 2026 celebró su 60.º aniversario con la exposición colectiva Sexagenia 6.0, que reunió miradas y trabajos vinculados a la asociación.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN '60.º aniversario de AFAL en 2026.
Exposición colectiva «Sexagenia 6.0» en el Museo Cruz Herrera.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Aniversario de AFAL | https://lalinea.es/afal-celebra-su-60-aniversario-con-una-exposicion-en-el-museo-cruz-herrera/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'afal';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Agrupación infantil y juvenil · chiriparsa' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'La chiriparsa infantil llevó a los más pequeños a los escenarios del Carnaval de la Concha Fina 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Los Desparasitaos son una agrupación infantil y juvenil vinculada a la cantera del Carnaval de La Línea.

En 2026 participaron en encuentros y actuaciones del Carnaval local, abriendo espacio para que las nuevas generaciones vivan la fiesta desde el escenario.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Actuación de la agrupación infantil fuera de concurso en la Gran Final del Carnaval de la Concha Fina 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Gran Final del Carnaval | https://lalinea.es/la-gran-final-de-hoy-abre-un-fin-de-semana-repleto-de-actividades-con-motivo-del-carnaval-de-la-concha-fina-2026/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'los-desparasitaos';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Asociación de Carnavaleros Linenses' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Creó un campamento para acercar el Carnaval a 25 menores y fomentar el relevo generacional de las coplas.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'ACALI El Volaó es una asociación que impulsa actividades carnavalescas en La Línea durante todo el año.

Su trabajo con la cantera culminó en 2026 con un campamento de verano centrado en letras, música e interpretación, reforzando la continuidad de la fiesta.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Organización del primer campamento gratuito de cantera, con 25 plazas.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Campamento ACALI | https://cadenaser.com/andalucia/2026/08/27/la-cantera-del-carnaval-de-la-linea-se-sube-al-escenario-tras-un-campamento-de-verano-de-acali-radio-algeciras/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'acali-el-volao-carnaval-linense';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Comparsa del Carnaval linense' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Comparsa ganadora del primer premio en el Concurso del Carnaval de la Concha Fina 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'La Batería es una comparsa de La Línea participante en el Carnaval de la Concha Fina.

En 2026 consiguió el primer premio de comparsas en el concurso oficial, destacando entre las agrupaciones que participaron en su modalidad.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Primer premio de comparsas en el Concurso del Carnaval de la Concha Fina 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Resultado del concurso | https://www.europasur.es/lalinea/agrupaciones-linenses-bateria-kfc-ganan_0_2005972158.html' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'la-bateria';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Programa de radio · Cadena Joven' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Cumple diez temporadas y supera los 200 programas dedicados a divulgar el Carnaval.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Disfraz de Coplas es un programa de Cadena Joven dedicado a la actualidad, la memoria y las voces del Carnaval.

Durante 2026 inició su décima temporada y superó las 200 emisiones, consolidando una labor continuada de divulgación carnavalesca.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Inicio de la décima temporada en 2026.
Superación de las 200 emisiones del programa.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Cadena Joven | https://cadenajoven.es/vuelve-disfraz-de-coplas-y-venimos-con-las-pilas-cargadas-de-carnaval/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'disfraz-de-coplas';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Presentación y divulgación del Carnaval' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Presentador de la Noche Carnavalesca 2026 y colaborador en la divulgación de la historia del Carnaval linense.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Juan Miguel Novo Vázquez participa en la vida cultural y carnavalesca de La Línea a través de la presentación de actos y actividades de divulgación.

En 2026 fue anunciado como presentador de la Noche Carnavalesca de la ciudad, una de las citas destacadas de la programación anual.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Presentación de la Noche Carnavalesca de La Línea 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Programación municipal | https://lalinea.es/la-linea-vivira-el-22-de-agosto-una-nueva-noche-carnavalesca-en-la-plaza-de-toros/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'juan-miguel-novo-vazquez';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Capataz · Hermandad de la Flagelación' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Tres décadas de dedicación al martillo y a la cuadrilla de la Flagelación, una referencia de la tradición costalera linense.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Ernesto Frigolet ha dedicado buena parte de su vida a la dirección de cuadrillas y al mundo del costal en la Semana Santa de La Línea.

En 2026 se recordó en una entrevista su trayectoria de tres décadas vinculada al paso de la Flagelación y el crecimiento de su cuadrilla de costaleros.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Reconocimiento público a sus tres décadas de dedicación al martillo en 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Entrevista en Gente de Paz | https://www.gentedepaz.es/de-cerca-con-ernesto-frigolet-y-pepe-guzman-tres-decadas-de-martillo-y-sentimiento-flagelo/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'ernesto-frigolet';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Pregonera y bordadora cofrade' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Por su trayectoria como pregonera y su dedicación al bordado y a la transmisión de la tradición cofrade linense.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Antonia Gil Muñoz ha formado parte de la vida de las hermandades de La Línea, donde destaca su trayectoria en la oratoria y las labores vinculadas al bordado.

Fue pregonera oficial de la Semana Santa linense en 2014 y continúa siendo una figura vinculada a la formación y transmisión del oficio cofrade.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Historial de pregoneros | https://www.lalineacofrade.com/historia-de-la-semana-santa-y-pregoneros/
Taller de bordados | https://www.lalineacofrade.com/entrevista-a-nuestra-pregonera-de-la-semana-santa-2025-isabel-maria-ramirez-canadas/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'antonia-gil';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Vestidor de imágenes religiosas' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Por su trabajo como vestidor de imágenes de hermandades linenses y su aportación al cuidado de la estética cofrade.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'José Manuel «Josema» Sánchez Bautista está vinculado al trabajo de vestir imágenes de las hermandades de La Línea.

Su labor contribuye a preservar y presentar el patrimonio devocional y textil, una parte esencial de la vida cotidiana de las cofradías.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Hermandad del Gran Poder | https://www.lalineacofrade.com/hermandades/gran-poder/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'josema-sanchez-bautista';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Tertulia y cartelería cofrade' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Impulsó su primer cartel de Semana Santa en 2026 como aportación propia al patrimonio visual cofrade de la ciudad.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'La Tertulia Cofrade El Puñal participa en la actividad cultural vinculada a la Semana Santa de La Línea.

Durante 2026 anunció la edición de su primer cartel de Semana Santa, sumando una nueva iniciativa de creación gráfica y difusión de la tradición local.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Anuncio de su primera iniciativa de cartelería de Semana Santa en 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Primer cartel de El Puñal | https://www.lalineacofrade.com/la-tertulia-cofrade-el-punal-editara-su-primer-cartel-de-semana-santa/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tertulia-cofrade-el-punal';

UPDATE nominees SET
  name = 'Sila Restauración',
  slug = 'sila-restauracion',
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Conservación de patrimonio textil · Marina Muñoz Villalta' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'El proyecto de Marina Muñoz Villalta restaura textiles históricos y patrimonio cofrade, con nuevos encargos especializados en 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Sila Restauración es un proyecto fundado por la conservadora-restauradora linense Marina Muñoz Villalta, especializado en conservar y recuperar patrimonio histórico, especialmente textil.

En 2026 desarrolló trabajos sobre bordados cofrades y recibió nuevos encargos de conservación, entre ellos el manto decimonónico de la Virgen de la Amargura de Utrera.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Intervención de conservación en los bordados del palio del Desamparo de Jerez durante 2026.
Encargo de conservación del manto histórico de la Virgen de la Amargura de Utrera, anunciado en noviembre de 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Web oficial | https://silarestauracion.es/
Intervención en Jerez | https://www.lavozdelsur.es/ediciones/jerez/actuacion-en-el-paso-del-desamparo-limpieza-de-sus-bordados-para-preservar-uno-de-los-grandes-palios-de-jerez.html
Encargo en Utrera | https://www.gentedepaz.es/la-hermandad-de-los-muchachos-de-consolacion-de-utrera-encomienda-a-sila-restauracion-la-conservacion-del-manto-decimononico-de-la-amargura/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'silas-restauracion';

UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Diseño y divulgación · Juan Pedro Mendoza Mejías' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Por su cuarta edición consecutiva del cartel de Semana Santa y su colaboración en los itinerarios de 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Cinema Cofrade es un proyecto de creación y comunicación visual de Juan Pedro Mendoza Mejías, centrado en la estética y la difusión de la Semana Santa.

En 2026 presentó su cuarto cartel consecutivo de la Semana Santa de La Línea y colaboró en la edición de itinerarios y horarios, tanto en papel como en formato digital.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Cuarto cartel consecutivo de la Semana Santa de La Línea en 2026.
Colaboración con La Línea Cofrade en la edición de itinerarios y horarios de 2026.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN 'Cartel Cinema Cofrade 2026 | https://www.lalineacofrade.com/cartel-de-la-semana-santa-2026-cinema-cofrade/
Itinerarios 2026 | https://www.lalineacofrade.com/itinerarios-semana-santa-2026-la-linea-cofrade-y-cinema-cofrade/' ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'cinema-cofrade';

INSERT OR IGNORE INTO nominees (category_id, slug, name, subtitle, reason, bio, merits, links, published, is_alternate, position) SELECT id, 'maria-perales', 'María Perales', 'Natación, maratón y pádel · deportista linense', 'Deportista multidisciplinar nominada por su participación en natación, pruebas de resistencia y pádel.', 'María Perales practica diversas disciplinas deportivas. La publicación de su ficha requiere confirmar sus marcas, competiciones y resultados de 2026 directamente con la deportista.', NULL, NULL, 0, 1, 90 FROM categories WHERE slug = 'merito-deportivo';
UPDATE nominees SET
  subtitle = CASE WHEN subtitle IS NULL OR TRIM(subtitle) = '' THEN 'Emprendimiento · actividad empresarial por confirmar' ELSE subtitle END,
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Proyecto empresarial propuesto para Talento Emprendedor, pendiente de recibir sus principales logros de 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'Grupo MoM es una candidatura propuesta para Talento Emprendedor. La descripción final se redactará a partir de la información que remita su equipo sobre actividad, desarrollo y logros durante 2026.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN NULL ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN NULL ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'grupo-mom';

UPDATE nominees SET
  reason = CASE WHEN reason IS NULL OR TRIM(reason) = '' THEN 'Once años al frente de su salón y participación como responsable de peluquería en La Línea Flamenca 2026.' ELSE reason END,
  bio = CASE WHEN bio IS NULL OR TRIM(bio) = '' THEN 'La Peluquería es un negocio de estética capilar dirigido por Rocío Hernández y vinculado al comercio y los servicios de proximidad de La Línea.

En 2026 participó en la preparación de peinados de la pasarela La Línea Flamenca y afrontó una nueva etapa de su salón.' ELSE bio END,
  merits = CASE WHEN merits IS NULL OR TRIM(merits) = '' THEN 'Responsable de peluquería en La Línea Flamenca 2026, según información anterior pendiente de revisión directa con el negocio.' ELSE merits END,
  links = CASE WHEN links IS NULL OR TRIM(links) = '' THEN NULL ELSE links END,
  photo_alt = CASE WHEN photo_alt IS NULL OR TRIM(photo_alt) = '' THEN NULL ELSE photo_alt END,
  photo_credit = CASE WHEN photo_credit IS NULL OR TRIM(photo_credit) = '' THEN NULL ELSE photo_credit END,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'rocio-hernandez';


-- Política de privacidad: analítica con Google Tag Manager / Google Analytics, solo con consentimiento (25/11/2026).
UPDATE pages SET body = REPLACE(REPLACE(body,
  'No está previsto utilizar cookies publicitarias ni de seguimiento comercial.',
  'Con tu consentimiento, la web utiliza Google Tag Manager y Google Analytics para obtener estadísticas agregadas de visitas, como las páginas consultadas, el tipo de dispositivo o la procedencia aproximada. Estas cookies solo se activan si pulsas «Aceptar» en el aviso de cookies, y puedes retirar el consentimiento en cualquier momento desde «Preferencias de cookies», en el pie de página. Google puede tratar estos datos fuera del Espacio Económico Europeo con las garantías que establecen sus condiciones: [policies.google.com/privacy](https://policies.google.com/privacy).' || char(10) || char(10) ||
  'No se utilizan cookies publicitarias. Los datos de analítica no se relacionan con las papeletas ni con los identificadores técnicos de la votación.'),
  'Si se incorporasen herramientas de analítica u otros servicios que requieran consentimiento, se informará de ello y se aplicarán los mecanismos de gestión correspondientes.',
  'Si se incorporasen otras herramientas que requieran consentimiento, se informará de ello en esta página.'),
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE slug = 'privacidad';

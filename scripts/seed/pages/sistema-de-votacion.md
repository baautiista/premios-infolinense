# Sistema de votación

Cómo se vota, qué medidas protegen la votación y cuáles son sus límites.

## Cómo votar

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

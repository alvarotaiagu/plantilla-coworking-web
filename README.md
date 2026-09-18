# O FAIADO — plantilla de coworking

> **Sitio de demostración. O FAIADO es un negocio ficticio.** Nombre, dirección,
> teléfono, horarios, plano, tarifas y **especialmente las cifras de ocupación**
> son datos de muestra inventados para enseñar la plantilla. No corresponden a
> ningún espacio real. La página lleva `noindex, nofollow` y no publica
> valoraciones en sus datos estructurados.

**Demo:** https://alvarotaiagu.github.io/plantilla-coworking-web/

Web estática: HTML + CSS + un `main.js`. Sin framework, sin build, sin backend y
sin npm. GSAP, ScrollTrigger y Lenis por CDN; con el CDN caído la página se lee
entera y —lo importante— el plano por horas y el cuadro de la semana siguen
funcionando, porque son contenido y no adorno.

---

## El concepto: «Ocupación»

Cualquiera que busca coworking pregunta lo mismo: *¿a qué hora hay sitio?* Es el
dato que nadie publica. Esta plantilla lo pone en el centro:

- **El hero dice cuántos puestos quedan ahora mismo**, calculado con la hora del
  visitante, y se actualiza cada minuto.
- **La sección protagonista es el plano de la planta con un mando de hora y
  día.** Mueves la hora y ves encenderse los veinticuatro puestos, las dos salas
  y la cabina. No es un scroll animado: es un control que maneja el visitante, y
  funciona con teclado.
- **El cuadro de la semana** es el mismo modelo visto de golpe: seis días por
  catorce horas, más claro cuanto más sitio hay.
- Y como consecuencia del mismo criterio, **las normas también son datos**:
  cuatro, concretas, las que de verdad hacen que un coworking funcione.

## Registro visual

| | |
|---|---|
| **Paleta** | fondo `#0C0C10`, panel `#15161B`, línea `#24262D`, acero `#444A55`, humo `#A6ABB6`, hueso `#EDEEF2` y un único acento: violeta eléctrico `#9B6BFF` |
| **Tipografía** | Big Shoulders Display (titulares y cifras), Manrope (texto y datos) |
| **Movimiento protagonista** | el plano manejable por horas y días: lo mueve el visitante, no el scroll |
| **Tono** | panel de control de un edificio, nada de azul corporativo ni de gente sonriendo con un portátil |

## Mapa de secciones

1. **Hero** — la promesa y el marcador de «ahora mismo».
2. **Franja** — marquesina de servicios ligada a la velocidad del scroll.
3. **01 · La planta** — plano con mando de hora y día (protagonista).
4. **02 · La semana** — cuadro de ocupación de 6 días × 14 horas.
5. **03 · Espacios** — qué hay en la planta y cuatro contadores.
6. **04 · Tarifas** — cuatro planes de muestra.
7. **05 · Cómo funciona** — cuatro normas y el acceso 24/7.
8. **06 · Quién trabaja aquí** — reparto por oficios, sin logotipos.
9. **07 · Preguntas** — acordeón nativo (`<details>`).
10. **08 · Visita** — formulario de muestra y mapa solo bajo clic.
11. **Pie** — sello de demostración y enlaces legales.

## Recursos de movimiento

| Recurso | Dónde |
|---|---|
| Lenis como único motor de scroll | toda la página (`lerp: 0.16`) |
| Plano interactivo por hora y día | sección 01 (protagonista) |
| Revelado palabra a palabra | todos los titulares con `data-revelar` |
| Encendido escalonado del cuadro de la semana | sección 02 |
| Marquesina ligada a la velocidad del scroll | franja de servicios |
| Contadores | cifras de la planta |
| Botones magnéticos | todos los `[data-iman]` |
| Cursor contextual | sobre el plano, el cuadro, las tarifas y los espacios |
| Marcador de «ahora mismo» en vivo | hero, se recalcula cada minuto |

## Qué tocar para reskinear a un cliente real

1. **El modelo de ocupación.** Está aislado arriba del todo de `js/main.js`:
   `PUESTOS`, `HORAS`, `CURVA` (la curva de un día laborable), `DIAS` (factor y
   hora de cierre de cada día) y `ORDEN` (en qué orden se van llenando los
   puestos). Cambiar el aforo es cambiar `PUESTOS` y los puestos del SVG.
   **Si el cliente tiene datos reales de accesos, esto es lo que se sustituye**, y
   entonces hay que decir de dónde salen y cada cuánto se actualizan.
2. **El plano.** Cada puesto es un `<g class="puesto" data-puesto="N">` dentro de
   `#puestos`, y las salas son `<g class="sala">`. Redibujar la planta es mover
   rectángulos manteniendo esa estructura.
3. **Datos del negocio.** `index.html` (bloque `ld+json`, sección `#visita` y
   pie), `aviso-legal.html`, `manifest.json` y este README. Busca `ofaiado`,
   `981 00 00 00`, `Rúa da Cerca` y `A Coruña`.
4. **Quitar el sello de demostración**: el comentario HTML de la primera línea de
   cada página, el párrafo `.sello` del pie, el `<meta name="robots">` y los
   avisos de este README. Los avisos de «dato de muestra» del hero y del cuadro
   de la semana se sustituyen por la explicación real de la fuente.
5. **Tarifas.** Los cuatro `<li class="plan">` de `#tarifas`.
6. **Paleta.** Las variables de `:root` en `css/style.css`; el acento vive en
   `--violeta`.
7. **Tipografía.** El `<link>` de Google Fonts en las tres páginas y las
   variables `--display` y `--texto`.

## Decisiones tomadas

- **El recurso protagonista no es un scrub.** Las otras plantillas oscuras de
  esta tanda ya anclan una escena y la mueven con el scroll; aquí manda el
  visitante, que es lo coherente con un espacio que se compra por horas.
- **Nada de azul corporativo** ni de fotos de gente sonriendo con un portátil. El
  espacio se enseña con su plano.
- **Sin logotipos de socios**, ni reales ni inventados: un coworking no debería
  exhibir a sus socios sin permiso, y los inventados parecerían reales.
- **La ocupación se presenta como lo que es.** Está marcada como dato de muestra
  en el hero, bajo el cuadro y en el pie, y el aviso legal explica qué habría que
  hacer para publicar datos reales sin señalar a nadie: agregado sí, mesa
  concreta no.
- **El detalle incómodo se cuenta**: el peldaño de 12 cm de la terraza está en las
  preguntas de accesibilidad porque es justo lo que uno querría saber antes de
  subir.
- **El mapa apunta a la ciudad**, nunca a un portal.
- **Movimiento reducido**: se apaga el movimiento, no el contenido. El plano, el
  mando de horas, el cuadro de la semana y el marcador de «ahora mismo» siguen
  funcionando igual.

## Verificación

Ver `screenshots/`: capturas a 1440×900 y 390×844, más las pasadas con GSAP
bloqueado y con `prefers-reduced-motion: reduce`. Consola limpia, sin peticiones
fallidas y sin imágenes rotas; probados el botón de cookies, el menú móvil, el
botón del mapa, el formulario y el mando de hora y día del plano.

## Licencia de uso

Plantilla de muestra propiedad de su autor. El contenido es ficticio y no puede
presentarse como un negocio real.

---

## La cortina de entrada

Obligatoria en toda la biblioteca, y **el gesto sale del concepto de esta
plantilla**, no es la misma cortina repintada: aquí los **veinticuatro puestos se van ocupando** uno a uno mientras el contador sube, y después el local se vacía: las columnas se recogen hacia arriba desde el centro.

La mecánica es la de siempre: línea de tiempo encadenada, `expo.inOut`, borde
curvo y **entrega limpia al hero** —el revelado del titular arranca mientras la
cortina todavía se está yendo, no después—.

**Se retira siempre.** Sin GSAP y con `prefers-reduced-motion` la hoja de estilos
ni la pinta (`html:not(.has-motion) .cortina{display:none}`), y con movimiento hay
una red de seguridad por tiempo en `main.js` que la quita y lanza el arranque
pase lo que pase, para que la página no pueda quedarse tapada si una animación se
atasca o las tipografías no resuelven.

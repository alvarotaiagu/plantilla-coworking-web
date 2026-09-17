/* ==========================================================================
   O FAIADO — plantilla de demostración (negocio ficticio)
   Concepto «Ocupación». HTML + CSS + este archivo. GSAP, ScrollTrigger y Lenis
   por CDN; sin ellos la página se lee entera y, sobre todo, el plano por horas
   y el cuadro de la semana siguen funcionando: son contenido, no adorno.
   ========================================================================== */

(function () {
  "use strict";

  var raiz = document.documentElement;
  var mqReducido = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reducido = mqReducido.matches;
  var gsapListo = !!(window.gsap && window.ScrollTrigger);
  var movimiento = gsapListo && !reducido;

  if (gsapListo) { window.gsap.registerPlugin(window.ScrollTrigger); }
  if (movimiento) { raiz.classList.add("has-motion"); }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ======================================================================
     0. EL MODELO DE OCUPACIÓN
     Datos inventados para la demostración: una curva por hora y un factor por
     día. En un coworking real esto saldría del control de accesos.
     ====================================================================== */

  var PUESTOS = 24;
  var HORAS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  /* curva de un día laborable, de 8 a 21 */
  var CURVA = [0.14, 0.45, 0.74, 0.90, 0.86, 0.62, 0.40, 0.58, 0.80, 0.78, 0.58, 0.34, 0.18, 0.08];
  var DIAS = [
    { n: 1, nombre: "Lunes", factor: 0.92, cierra: 21 },
    { n: 2, nombre: "Martes", factor: 1.00, cierra: 21 },
    { n: 3, nombre: "Miércoles", factor: 1.00, cierra: 21 },
    { n: 4, nombre: "Jueves", factor: 0.95, cierra: 21 },
    { n: 5, nombre: "Viernes", factor: 0.78, cierra: 21 },
    { n: 6, nombre: "Sábado", factor: 0.30, cierra: 14 }
  ];
  /* orden en el que se van llenando los puestos: primero las islas con ventana,
     después los fijos y al final la isla del fondo */
  var ORDEN = [1, 2, 3, 13, 14, 15, 4, 5, 6, 16, 17, 18, 19, 20, 21, 22, 23, 24, 7, 8, 9, 10, 11, 12];

  function diaPorNumero(n) {
    for (var i = 0; i < DIAS.length; i++) { if (DIAS[i].n === n) { return DIAS[i]; } }
    return DIAS[2];
  }

  function ocupacion(diaN, hora) {
    var dia = diaPorNumero(diaN);
    var i = HORAS.indexOf(hora);
    if (i < 0) { return { ocupados: 0, cerrado: true, dia: dia }; }
    if (hora >= dia.cierra) { return { ocupados: 0, cerrado: true, dia: dia }; }
    var v = Math.round(PUESTOS * CURVA[i] * dia.factor);
    return { ocupados: Math.max(0, Math.min(PUESTOS, v)), cerrado: false, dia: dia };
  }

  /* ======================================================================
     1. CONTENIDO
     ====================================================================== */

  (function menu() {
    var boton = $("#hamburguesa"), nav = $("#nav");
    if (!boton || !nav) { return; }
    function cerrar() {
      boton.setAttribute("aria-expanded", "false");
      boton.setAttribute("aria-label", "Abrir menú");
      nav.classList.remove("esta-abierto");
    }
    boton.addEventListener("click", function () {
      var abierto = boton.getAttribute("aria-expanded") === "true";
      boton.setAttribute("aria-expanded", abierto ? "false" : "true");
      boton.setAttribute("aria-label", abierto ? "Abrir menú" : "Cerrar menú");
      nav.classList.toggle("esta-abierto", !abierto);
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", cerrar); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("esta-abierto")) { cerrar(); boton.focus(); }
    });
  })();

  (function cookies() {
    var banner = $("#cookie-banner"), ok = $("#cookie-ok");
    if (!banner || !ok) { return; }
    var CLAVE = "ofaiado-cookies";
    var aceptado = false;
    try { aceptado = localStorage.getItem(CLAVE) === "1"; } catch (e) {}
    if (!aceptado) { banner.hidden = false; }
    ok.addEventListener("click", function () {
      banner.hidden = true;
      try { localStorage.setItem(CLAVE, "1"); } catch (e) {}
    });
  })();

  (function mapa() {
    var boton = $("#mapa-boton"), caja = $("#mapa");
    if (!boton || !caja) { return; }
    boton.addEventListener("click", function () {
      var marco = document.createElement("iframe");
      /* la ciudad, nunca un portal concreto: la dirección es inventada */
      marco.src = "https://www.google.com/maps?q=A+Coruna&output=embed";
      marco.title = "Mapa de A Coruña (la dirección del coworking es ficticia)";
      marco.loading = "lazy";
      marco.referrerPolicy = "no-referrer-when-downgrade";
      marco.setAttribute("width", "600");
      marco.setAttribute("height", "320");
      caja.insertBefore(marco, boton.nextSibling);
      boton.remove();
    });
  })();

  (function formulario() {
    var form = $("#formulario"), salida = $("#formulario-respuesta");
    if (!form || !salida) { return; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nombre = $("#f-nombre").value.trim();
      var correo = $("#f-correo").value.trim();
      if (!nombre || !correo || !$("#f-ok").checked) {
        salida.textContent = "Faltan el nombre, el correo o el aviso legal.";
        return;
      }
      salida.textContent = "Demostración: no se envía nada. Te escribiríamos, " + nombre + ".";
      form.reset();
    });
  })();

  /* --- 1.1 El plano por horas: el recurso protagonista --------------------- */
  (function plano() {
    var svg = $("#plano");
    var rango = $("#mando-rango");
    var salida = $("#mando-salida");
    var estado = $("#planta-estado");
    if (!svg || !rango) { return; }

    var puestos = $$(".puesto", svg);
    var salas = $$(".sala", svg);
    var botones = $$(".dia");
    var diaActual = 3;

    function pintar() {
      var hora = parseInt(rango.value, 10);
      var o = ocupacion(diaActual, hora);
      var libres = PUESTOS - o.ocupados;

      /* el orden de llenado es fijo para que no parpadee al mover la hora */
      var ocupadosSet = {};
      for (var i = 0; i < o.ocupados; i++) { ocupadosSet[ORDEN[i]] = true; }

      puestos.forEach(function (p) {
        var n = parseInt(p.dataset.puesto, 10);
        p.classList.toggle("esta-cerrado", o.cerrado);
        p.classList.toggle("esta-ocupado", !o.cerrado && !!ocupadosSet[n]);
      });

      /* las salas se ocupan en las franjas de reunión */
      var reunion = !o.cerrado && (hora === 10 || hora === 11 || hora === 12 || hora === 16 || hora === 17);
      salas.forEach(function (s, idx) {
        s.classList.toggle("esta-ocupada", reunion && (idx === 0 || (idx === 1 && hora >= 16) || (idx === 2 && hora === 11)));
      });

      if (salida) { salida.textContent = (hora < 10 ? "0" : "") + hora + ":00"; }
      if (estado) {
        estado.textContent = o.cerrado
          ? o.dia.nombre + " a las " + hora + ":00 · cerrado (el sábado cerramos a las 14:00)"
          : o.dia.nombre + " a las " + hora + ":00 · " + o.ocupados + " de " + PUESTOS +
            " puestos ocupados, quedan " + libres;
      }
      botones.forEach(function (b) {
        b.classList.toggle("esta-activo", parseInt(b.dataset.dia, 10) === diaActual);
        b.setAttribute("aria-pressed", parseInt(b.dataset.dia, 10) === diaActual ? "true" : "false");
      });
    }

    rango.addEventListener("input", pintar);
    botones.forEach(function (b) {
      b.addEventListener("click", function () {
        diaActual = parseInt(b.dataset.dia, 10);
        pintar();
      });
    });

    /* Al abrir se muestra el día y la hora de quien mira, pero si llega fuera
       de horario no tiene sentido enseñarle la planta apagada: se le pone el
       siguiente día laborable a las 11:00, que es la franja que más dice. El
       marcador del hero sí avisa de que ahora mismo está cerrado. */
    var ahora = new Date();
    var d = ahora.getDay();
    var h = ahora.getHours();
    var fuera = (d === 0) || h < 8 || h >= 21 || (d === 6 && h >= 14);
    if (fuera) {
      var siguiente = (d === 0 || d === 6) ? 1 : (h >= 21 ? d + 1 : d);
      diaActual = siguiente > 5 ? 1 : siguiente;
      rango.value = 11;
    } else {
      diaActual = Math.min(d, 6);
      rango.value = h;
    }
    pintar();
  })();

  /* --- 1.2 «Ahora mismo» del hero ----------------------------------------- */
  (function ahoraMismo() {
    var libres = $("#ahora-libres");
    var relleno = $("#ahora-relleno");
    var texto = $("#ahora-texto");
    if (!libres) { return; }

    function pintar() {
      var d = new Date();
      var diaN = d.getDay();
      var hora = d.getHours();
      var nombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      var reloj = nombres[diaN] + ", " + (hora < 10 ? "0" : "") + hora + ":" +
        (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();

      if (diaN === 0 || hora < 8 || hora >= 21 || (diaN === 6 && hora >= 14)) {
        libres.textContent = "24";
        if (relleno) { relleno.style.width = "0%"; }
        if (texto) {
          texto.textContent = reloj + " · cerrado ahora. Quien tiene llave entra igual, pero no hay nadie en recepción.";
        }
        return;
      }
      var o = ocupacion(diaN === 0 ? 1 : diaN, hora);
      var libresN = PUESTOS - o.ocupados;
      libres.textContent = libresN;
      if (relleno) { relleno.style.width = Math.round((o.ocupados / PUESTOS) * 100) + "%"; }
      if (texto) {
        texto.textContent = reloj + " · " +
          (libresN <= 3 ? "está lleno; si vienes, escribe antes."
            : libresN <= 9 ? "hora punta, pero suele quedar sitio en la fila de las ventanas."
              : "hay sitio de sobra, incluso en las islas con ventana.");
      }
    }
    pintar();
    setInterval(pintar, 60000);
  })();

  /* --- 1.3 El cuadro de la semana ----------------------------------------- */
  (function mapaCalor() {
    var caja = $("#mapa-calor");
    if (!caja) { return; }
    caja.textContent = "";

    DIAS.forEach(function (dia) {
      var fila = document.createElement("div");
      fila.className = "calor-fila";
      var eti = document.createElement("span");
      eti.className = "calor-eti";
      eti.textContent = dia.nombre.slice(0, 3);
      fila.appendChild(eti);

      HORAS.forEach(function (hora) {
        var celda = document.createElement("span");
        celda.className = "calor-celda";
        var o = ocupacion(dia.n, hora);
        if (o.cerrado) {
          celda.dataset.cerrado = "1";
          celda.title = dia.nombre + " " + hora + ":00 · cerrado";
        } else {
          var p = o.ocupados / PUESTOS;
          celda.dataset.nivel = p < 0.2 ? "0" : p < 0.4 ? "1" : p < 0.6 ? "2" : p < 0.8 ? "3" : "4";
          celda.title = dia.nombre + " " + hora + ":00 · " + o.ocupados + " de " + PUESTOS + " ocupados";
        }
        fila.appendChild(celda);
      });
      caja.appendChild(fila);
    });

    var pie = document.createElement("div");
    pie.className = "calor-horas";
    var hueco = document.createElement("span");
    pie.appendChild(hueco);
    HORAS.forEach(function (hora) {
      var h = document.createElement("span");
      h.className = "calor-hora";
      h.textContent = hora;
      pie.appendChild(h);
    });
    caja.appendChild(pie);
  })();


  /* --- Contenedores con scroll accesibles por teclado ----------------------
     axe: `scrollable-region-focusable`. Un contenedor que se recorre con el
     dedo tiene que poder recorrerse también con las flechas, así que se hace
     focusable; pero solo cuando de verdad desborda, porque en escritorio no
     desborda y una parada de tabulación de más solo estorba. */
  (function scrollAccesible() {
    var cajas = $$("[data-scroll-teclado]");
    if (!cajas.length) { return; }
    function revisar() {
      cajas.forEach(function (c) {
        var desborda = (c.scrollWidth > c.clientWidth + 4) || (c.scrollHeight > c.clientHeight + 4);
        if (desborda) { c.setAttribute("tabindex", "0"); }
        else { c.removeAttribute("tabindex"); }
      });
    }
    revisar();
    window.addEventListener("resize", revisar);
    window.addEventListener("load", revisar);
  })();

  /* ======================================================================
     2. MOVIMIENTO
     ====================================================================== */
  if (!movimiento) { return; }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;

  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.16, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var destino = document.querySelector(a.getAttribute("href"));
        if (!destino) { return; }
        e.preventDefault();
        lenis.scrollTo(destino, { offset: -80 });
      });
    });
  }

  /* Un ScrollTrigger con `once` no dispara si el elemento ya está en pantalla
     al crearse: lo de una sola vez, con IntersectionObserver. */
  function alEntrar(el, hacer) {
    if (!("IntersectionObserver" in window)) { hacer(); return; }
    var io = new IntersectionObserver(function (ent) {
      ent.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); hacer(); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.04 });
    io.observe(el);
  }

  function titulares() {
    $$("[data-revelar]").forEach(function (el) {
      var texto = (el.textContent || "").replace(/\s+/g, " ").trim();
      el.setAttribute("aria-label", texto);
      el.textContent = "";
      var frag = document.createDocumentFragment();
      var partes = [];
      texto.split(" ").forEach(function (palabra) {
        var caja = document.createElement("span");
        caja.className = "palabra";
        caja.setAttribute("aria-hidden", "true");
        var dentro = document.createElement("i");
        dentro.textContent = palabra;
        caja.appendChild(dentro);
        frag.appendChild(caja);
        frag.appendChild(document.createTextNode(" "));
        partes.push(dentro);
      });
      el.appendChild(frag);
      /* y:0 explícito: GSAP lee el translate3d del CSS como `y` en píxeles */
      gsap.set(partes, { y: 0, yPercent: 112 });
      alEntrar(el, function () {
        gsap.to(partes, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.045 });
      });
    });
  }

  function apariciones() {
    $$("[data-aparecer]").forEach(function (el, i) {
      alEntrar(el, function () {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: (i % 4) * 0.07 });
      });
    });
  }

  function franja() {
    var pista = $("#franja-pista");
    if (!pista) { return; }
    var bucle = gsap.to(pista, { xPercent: -50, duration: 24, ease: "none", repeat: -1 });
    var vuelta;
    ScrollTrigger.create({
      onUpdate: function (self) {
        bucle.timeScale(1 + Math.min(Math.abs(self.getVelocity()) / 700, 5));
        clearTimeout(vuelta);
        vuelta = setTimeout(function () { gsap.to(bucle, { timeScale: 1, duration: 0.8 }); }, 140);
      }
    });
  }

  /* El cuadro de la semana se enciende celda a celda, como si se fuese
     llenando la agenda. */
  function encenderCalor() {
    var caja = $("#mapa-calor");
    if (!caja) { return; }
    var celdas = $$(".calor-celda", caja);
    if (!celdas.length) { return; }
    gsap.set(celdas, { opacity: 0, scale: 0.7 });
    alEntrar(caja, function () {
      gsap.to(celdas, {
        opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)",
        stagger: { each: 0.012, from: "start" }
      });
    });
  }

  function contadores() {
    $$(".contador").forEach(function (el) {
      var hasta = parseFloat(el.dataset.hasta || el.textContent) || 0;
      var estado = { v: 0 };
      el.textContent = "0";
      alEntrar(el, function () {
        gsap.to(estado, {
          v: hasta, duration: 1.3, ease: "power2.out",
          onUpdate: function () { el.textContent = Math.round(estado.v); }
        });
      });
    });
  }

  function imanes() {
    if (!window.matchMedia("(hover:hover)").matches) { return; }
    $$("[data-iman]").forEach(function (el) {
      var aX = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      var aY = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
      el.addEventListener("mousemove", function (e) {
        var c = el.getBoundingClientRect();
        aX((e.clientX - (c.left + c.width / 2)) * 0.3);
        aY((e.clientY - (c.top + c.height / 2)) * 0.42);
      });
      el.addEventListener("mouseleave", function () { aX(0); aY(0); });
    });
  }

  function cursor() {
    var caja = $("#cursor"), texto = $("#cursor-texto");
    if (!caja || !window.matchMedia("(hover:hover)").matches) { return; }
    var aX = gsap.quickTo(caja, "x", { duration: 0.2, ease: "power3.out" });
    var aY = gsap.quickTo(caja, "y", { duration: 0.2, ease: "power3.out" });
    window.addEventListener("mousemove", function (e) { aX(e.clientX); aY(e.clientY); }, { passive: true });

    [
      { sel: "#plano", txt: "la planta" },
      { sel: ".calor-fila", txt: "ocupación" },
      { sel: ".plan", txt: "tarifa" },
      { sel: ".espacio", txt: "espacio" }
    ].forEach(function (g) {
      $$(g.sel).forEach(function (el) {
        el.addEventListener("mouseenter", function () { caja.classList.add("es-grande"); texto.textContent = g.txt; });
        el.addEventListener("mouseleave", function () { caja.classList.remove("es-grande"); texto.textContent = ""; });
      });
    });
    $$("a, button").forEach(function (el) {
      el.addEventListener("mouseenter", function () { caja.classList.add("es-grande"); });
      el.addEventListener("mouseleave", function () { caja.classList.remove("es-grande"); });
    });
  }

  function arrancar() {
    titulares();
    apariciones();
    franja();
    encenderCalor();
    contadores();
    imanes();
    cursor();
    ScrollTrigger.refresh();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(arrancar);
  } else {
    window.addEventListener("load", arrancar);
  }

  if (mqReducido.addEventListener) {
    mqReducido.addEventListener("change", function () { window.location.reload(); });
  }
})();

// ===================== FORZAR INICIO ARRIBA DEL TODO =====================
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

// ===================== AOS =====================
AOS.init({
  duration: 900,
  once: true,
  offset: 80,
  easing: "ease-out-cubic",
});

// ===================== SOBRE DE APERTURA =====================
const envelopeScreen = document.getElementById("envelope-screen");
const envelopeBtn = document.getElementById("envelope-btn");
const bgMusic = document.getElementById("bg-music");

document.body.style.overflow = "hidden";

envelopeBtn.addEventListener("click", () => {
  if (envelopeBtn.classList.contains("open")) return;

  envelopeBtn.classList.remove("envelope-pulse");
  envelopeBtn.classList.add("open");

  bgMusic.play().catch(() => {
    // Si el navegador igual bloquea el autoplay, no rompemos el resto de la apertura.
  });

  setTimeout(() => {
    envelopeScreen.classList.add("opened");
    document.body.style.overflow = "";
  }, 1350);
});

// ===================== CÓDIGO DE INVITACIÓN (link con ?codigo=) =====================
// Ejemplo de link para enviar a cada invitado:
//   index.html?codigo=zapato
// "codigo" define la cantidad de espacios reservados, sin exponer el número
// directo en el link (así no es tan fácil de editar a mano en la barra de direcciones).
const CODIGOS_PASES = {
  anillo: 1,
  vestido: 2,
  zapato: 3,
  ramo: 4,
  brindis: 5,
  altar: 6,
};
const DEFAULT_MAX_PASES = 4;

const urlParams = new URLSearchParams(window.location.search);
const guestCodigo = (urlParams.get("codigo") || "").trim().toLowerCase();
const hasPasesParam = Object.prototype.hasOwnProperty.call(
  CODIGOS_PASES,
  guestCodigo
);
const guestPases = hasPasesParam ? CODIGOS_PASES[guestCodigo] : DEFAULT_MAX_PASES;

const passesLabel =
  guestPases === 1 ? "1 persona" : `${guestPases} personas`;

// Badge grande y visible en la portada: "Hemos reservado X espacio(s) para ti"
const guestPassesBadge = document.getElementById("guest-passes-badge");
const guestPassesText = document.getElementById("guest-passes-text");
if (hasPasesParam) {
  const espaciosLabel =
    guestPases === 1 ? "un espacio" : `${guestPases} espacios`;
  guestPassesText.textContent = `Hemos reservado ${espaciosLabel} para ti`;
  guestPassesBadge.classList.remove("hidden");
}

// Recordatorio de pases en la sección de confirmación
const guestPassesInfo = document.getElementById("guest-passes-info");
if (hasPasesParam) {
  guestPassesInfo.textContent = `Tenés ${passesLabel} reservada${guestPases === 1 ? "" : "s"}`;
  guestPassesInfo.classList.remove("hidden");
}

// Genera las opciones del selector "Cantidad de personas que asistirán"
const acompanantesSelect = document.getElementById("acompanantes");
for (let i = 1; i <= guestPases; i++) {
  const option = document.createElement("option");
  option.value = String(i);
  option.textContent = i === 1 ? "1 persona" : `${i} personas`;
  acompanantesSelect.appendChild(option);
}
acompanantesSelect.value = String(guestPases);

// Restricciones alimentarias: se piden por persona, debajo de cada nombre.
const RESTRICCION_OPCIONES = [
  { value: "carnes_rojas", label: "Carnes rojas" },
  { value: "gluten", label: "Gluten" },
  { value: "otras", label: "Otras" },
];

function crearBloqueRestricciones(personaId) {
  const container = document.createElement("div");
  container.className = "mt-3";

  const label = document.createElement("label");
  label.className = "block text-xs uppercase tracking-wide mb-2";
  label.textContent = "Restricciones alimentarias (opcional)";

  const opciones = document.createElement("div");
  opciones.className = "flex flex-wrap gap-x-6 gap-y-2 text-sm";

  RESTRICCION_OPCIONES.forEach(({ value, label: optionLabel }) => {
    const optionWrapper = document.createElement("label");
    optionWrapper.className = "flex items-center gap-2";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = `restricciones_persona_${personaId}`;
    checkbox.value = value;
    checkbox.className = "rounded text-sage-600 focus:ring-sage-400";
    if (value === "otras") {
      checkbox.dataset.otrasToggle = `restricciones-otras-persona-${personaId}`;
    }

    optionWrapper.appendChild(checkbox);
    optionWrapper.appendChild(document.createTextNode(` ${optionLabel}`));
    opciones.appendChild(optionWrapper);
  });

  const otrasInput = document.createElement("input");
  otrasInput.type = "text";
  otrasInput.id = `restricciones-otras-persona-${personaId}`;
  otrasInput.name = `restricciones_otras_persona_${personaId}`;
  otrasInput.placeholder = "Especificá cuáles";
  otrasInput.className =
    "hidden mt-3 w-full border border-sage-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400";

  container.appendChild(label);
  container.appendChild(opciones);
  container.appendChild(otrasInput);
  return container;
}

// Delegación de eventos: al marcar/desmarcar "Otras" en cualquier persona,
// muestra u oculta su campo de texto correspondiente.
document.getElementById("rsvp-form").addEventListener("change", (event) => {
  const toggleId = event.target.dataset?.otrasToggle;
  if (!toggleId) return;
  const otrasInput = document.getElementById(toggleId);
  otrasInput.classList.toggle("hidden", !event.target.checked);
  otrasInput.required = event.target.checked;
  if (!event.target.checked) otrasInput.value = "";
});

// Restricciones de la persona 1 ("Tu nombre completo"), se generan una sola vez.
document
  .getElementById("restricciones-persona-1")
  .appendChild(crearBloqueRestricciones(1));

// Genera un campo de nombre + sus restricciones por cada acompañante adicional.
// Si la invitación permite 3 y se elige 2, solo se piden los 2 nombres correspondientes.
const acompanantesNombres = document.getElementById("acompanantes-nombres");

function renderAcompanantesNombres(cantidad) {
  acompanantesNombres.innerHTML = "";
  for (let i = 2; i <= cantidad; i++) {
    const wrapper = document.createElement("div");

    const label = document.createElement("label");
    label.className = "block text-xs uppercase tracking-wide mb-2";
    label.setAttribute("for", `nombre-acompanante-${i}`);
    label.textContent = `Nombre completo — acompañante ${i - 1}`;

    const input = document.createElement("input");
    input.type = "text";
    input.id = `nombre-acompanante-${i}`;
    input.name = `nombre_acompanante_${i}`;
    input.required = true;
    input.className =
      "w-full border border-sage-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400";

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(crearBloqueRestricciones(i));
    acompanantesNombres.appendChild(wrapper);
  }
}

renderAcompanantesNombres(guestPases);
acompanantesSelect.addEventListener("change", () => {
  renderAcompanantesNombres(parseInt(acompanantesSelect.value, 10));
});

// ===================== CUENTA REGRESIVA =====================
const weddingDate = new Date("2026-11-28T14:30:00");

const cdDays = document.getElementById("cd-days");
const cdHours = document.getElementById("cd-hours");
const cdMinutes = document.getElementById("cd-minutes");
const cdSeconds = document.getElementById("cd-seconds");

function pad(num) {
  return String(num).padStart(2, "0");
}

function updateCountdown() {
  const diff = weddingDate.getTime() - Date.now();

  if (diff <= 0) {
    cdDays.textContent = "00";
    cdHours.textContent = "00";
    cdMinutes.textContent = "00";
    cdSeconds.textContent = "00";
    clearInterval(countdownInterval);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  cdDays.textContent = pad(days);
  cdHours.textContent = pad(hours);
  cdMinutes.textContent = pad(minutes);
  cdSeconds.textContent = pad(seconds);
}

updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);

// ===================== SWIPER: GALERÍA =====================
new Swiper(".gallery-swiper", {
  loop: true,
  initialSlide: 0,
  spaceBetween: 16,
  slidesPerView: 1,
  centeredSlides: true,
  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".gallery-swiper .swiper-pagination",
    type: "fraction",
  },
  navigation: {
    nextEl: ".gallery-swiper .swiper-button-next",
    prevEl: ".gallery-swiper .swiper-button-prev",
  },
  breakpoints: {
    480: { slidesPerView: 1.15, spaceBetween: 20 },
    768: { slidesPerView: 1.6, spaceBetween: 24 },
    1024: { slidesPerView: 2.2, spaceBetween: 28 },
  },
});

// ===================== SWIPER: VESTIMENTA (mujeres / hombres) =====================
new Swiper(".vestimenta-swiper", {
  loop: true,
  initialSlide: 0,
  effect: "fade",
  fadeEffect: { crossFade: true },
  speed: 700,
  autoplay: {
    delay: 3200,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".vestimenta-swiper .swiper-pagination",
    clickable: true,
  },
});

// ===================== FORMULARIO RSVP =====================
// Las respuestas se mandan por detrás a un Google Form (misma hoja de cálculo),
// usando los IDs internos de cada pregunta. Como Google no permite leer la
// respuesta (no-cors), se asume éxito y se muestra el mensaje de gracias igual.
const GOOGLE_FORM_RESPONSE_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfnDT2GrTFNTNuTB8cnLlrzk7HvZnZbTJoQMDb3--YNuV1PUg/formResponse";

const GOOGLE_FORM_ENTRIES = {
  nombre: "entry.1703931489",
  asistencia: "entry.86320245",
  cantidad: "entry.1312762492",
  acompanantes: "entry.820375729",
  restricciones: "entry.1090046721",
  mensaje: "entry.1739073029",
};

const ASISTENCIA_LABELS = {
  si: "Sí, con gusto",
  no: "No podré asistir",
};

const RESTRICCION_LABELS = {
  carnes_rojas: "Carnes rojas",
  gluten: "Gluten",
};

const rsvpForm = document.getElementById("rsvp-form");
const rsvpSubmitBtn = document.getElementById("rsvp-submit-btn");
const rsvpSuccess = document.getElementById("rsvp-success");

// El botón de enviar queda deshabilitado hasta que todos los campos
// obligatorios del formulario estén completos.
function updateRsvpSubmitState() {
  rsvpSubmitBtn.disabled = !rsvpForm.checkValidity();
}
rsvpForm.addEventListener("input", updateRsvpSubmitState);
rsvpForm.addEventListener("change", updateRsvpSubmitState);
updateRsvpSubmitState();
const rsvpSuccessIcon = document.getElementById("rsvp-success-icon");
const rsvpSuccessHeading = document.getElementById("rsvp-success-heading");
const rsvpSuccessMessage = document.getElementById("rsvp-success-message");

const ICON_CHECK =
  '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />';
const ICON_HEART_BROKEN =
  '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75c-1.5-2-4-3-6-1.5-2.25 1.75-2.5 5-.5 7.5L12 20l6.5-7.25c2-2.5 1.75-5.75-.5-7.5-2-1.5-4.5-.5-6 1.5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 9l1.5 2-2 2 2.5 3" />';

function enviarRespuestaAGoogleForm() {
  const nombre = document.getElementById("nombre").value;

  const asistenciaValue = rsvpForm.querySelector(
    'input[name="asistencia"]:checked'
  )?.value;
  const asistencia = ASISTENCIA_LABELS[asistenciaValue] || "";

  const cantidad = acompanantesSelect.value;

  const nombresAcompanantes = Array.from(
    acompanantesNombres.querySelectorAll('input[name^="nombre_acompanante_"]')
  )
    .map((input) => input.value.trim())
    .filter(Boolean)
    .join(", ");

  function restriccionesDe(personaId, nombrePersona) {
    const marcadas = Array.from(
      rsvpForm.querySelectorAll(
        `input[name="restricciones_persona_${personaId}"]:checked`
      )
    ).map((checkbox) => {
      if (checkbox.value === "otras") {
        const detalle = document
          .getElementById(`restricciones-otras-persona-${personaId}`)
          .value.trim();
        return detalle ? `Otras: ${detalle}` : "Otras";
      }
      return RESTRICCION_LABELS[checkbox.value] || checkbox.value;
    });
    const etiquetaPersona = nombrePersona || `Persona ${personaId}`;
    return `${etiquetaPersona}: ${marcadas.join(", ") || "Ninguna"}`;
  }

  const cantidadNum = parseInt(cantidad, 10) || 1;
  const restriccionesPorPersona = [restriccionesDe(1, nombre.trim())];
  for (let i = 2; i <= cantidadNum; i++) {
    const nombreAcompanante = document
      .getElementById(`nombre-acompanante-${i}`)
      ?.value.trim();
    restriccionesPorPersona.push(restriccionesDe(i, nombreAcompanante));
  }
  const restricciones = restriccionesPorPersona.join(" | ");

  const mensaje = document.getElementById("mensaje").value;

  const payload = new URLSearchParams();
  payload.append(GOOGLE_FORM_ENTRIES.nombre, nombre);
  payload.append(GOOGLE_FORM_ENTRIES.asistencia, asistencia);
  payload.append(GOOGLE_FORM_ENTRIES.cantidad, cantidad);
  payload.append(GOOGLE_FORM_ENTRIES.acompanantes, nombresAcompanantes);
  payload.append(GOOGLE_FORM_ENTRIES.restricciones, restricciones);
  payload.append(GOOGLE_FORM_ENTRIES.mensaje, mensaje);

  return fetch(GOOGLE_FORM_RESPONSE_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });
}

rsvpForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const nombreRespondiente = document.getElementById("nombre").value.trim();
  const vaAsistir =
    rsvpForm.querySelector('input[name="asistencia"]:checked')?.value ===
    "si";

  enviarRespuestaAGoogleForm().catch(() => {
    // Si falla la red, igual dejamos ver el mensaje de gracias para no trabar al invitado.
  });

  if (vaAsistir) {
    rsvpSuccessIcon.innerHTML = ICON_CHECK;
    rsvpSuccessIcon.classList.remove("text-sage-500");
    rsvpSuccessIcon.classList.add("text-sage-600");
    rsvpSuccessHeading.textContent = "¡Confirmación exitosa!";
    rsvpSuccessMessage.textContent = `Gracias${
      nombreRespondiente ? `, ${nombreRespondiente}` : ""
    }. ¡Nos vemos el 28 de noviembre de 2026!`;
  } else {
    rsvpSuccessIcon.innerHTML = ICON_HEART_BROKEN;
    rsvpSuccessIcon.classList.remove("text-sage-600");
    rsvpSuccessIcon.classList.add("text-sage-500");
    rsvpSuccessHeading.textContent = "Confirmación registrada";
    rsvpSuccessMessage.textContent = `Gracias por avisarnos${
      nombreRespondiente ? `, ${nombreRespondiente}` : ""
    }. ¡Te vamos a extrañar ese día!`;
  }

  rsvpForm.classList.add("hidden");
  rsvpSuccess.classList.remove("hidden");

  rsvpForm.reset();
  const otrasPersona1 = document.getElementById(
    "restricciones-otras-persona-1"
  );
  otrasPersona1.classList.add("hidden");
  otrasPersona1.required = false;
  acompanantesSelect.value = String(guestPases);
  renderAcompanantesNombres(guestPases);
  updateRsvpSubmitState();
});

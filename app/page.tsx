"use client";

import Image from "next/image";
import { useState } from "react";

type Formato = {
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  estadoCivil: string;
  sexo: string;
  ocupacion: string;
  peso: string;
  estatura: string;
  hijos: string;
  ultimaVisitaMedico: string;
  patologia: string;
  motivoConsulta: string;
  gradoInstruccion: string;
  religion: string;
};

const inicial: Formato = {
  nombre: "",
  email: "",
  telefono: "",
  fechaNacimiento: "",
  estadoCivil: "",
  sexo: "",
  ocupacion: "",
  peso: "",
  estatura: "",
  hijos: "",
  ultimaVisitaMedico: "",
  patologia: "",
  motivoConsulta: "",
  gradoInstruccion: "",
  religion: "",
};

function calcularEdad(fecha: string): number | null {
  if (!fecha) return null;
  const nacimiento = new Date(fecha + "T00:00:00");
  if (Number.isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad >= 0 && edad < 130 ? edad : null;
}

function calcularImc(peso: string, estatura: string): number | null {
  const p = parseFloat(peso);
  const e = parseFloat(estatura);
  if (!p || !e || e <= 0) return null;
  const imc = p / Math.pow(e / 100, 2);
  return imc >= 5 && imc <= 100 ? Math.round(imc * 10) / 10 : null;
}

export default function Home() {
  const [datos, setDatos] = useState<Formato>(inicial);
  const [errores, setErrores] = useState<Partial<Record<keyof Formato, string>>>({});
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(false);

  const edad = calcularEdad(datos.fechaNacimiento);
  const imc = calcularImc(datos.peso, datos.estatura);

  function cambiar<K extends keyof Formato>(campo: K, valor: string) {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setEnviado(false);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    const nuevos: Partial<Record<keyof Formato, string>> = {};
    if (!datos.nombre.trim()) nuevos.nombre = "Escribe tu nombre y apellido.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(datos.email))
      nuevos.email = "Escribe un correo válido, por ejemplo ana@correo.com.";
    if (!datos.telefono.trim()) nuevos.telefono = "Escribe tu número de teléfono.";
    if (!datos.fechaNacimiento) {
      nuevos.fechaNacimiento = "Selecciona tu fecha de nacimiento.";
    } else if (edad === null) {
      nuevos.fechaNacimiento =
        "La fecha no es válida: no puede estar en el futuro.";
    }
    if (!datos.estadoCivil) nuevos.estadoCivil = "Selecciona tu estado civil.";
    if (!datos.sexo) nuevos.sexo = "Selecciona una opción.";
    if (!datos.ocupacion.trim()) nuevos.ocupacion = "Indica tu ocupación u oficio.";
    if (!datos.peso) nuevos.peso = "Indica tu peso en kilogramos.";
    if (!datos.estatura) nuevos.estatura = "Indica tu estatura en centímetros.";
    if (datos.hijos === "") nuevos.hijos = "Indica el número de hijos (0 si no tiene).";
    if (!datos.ultimaVisitaMedico) nuevos.ultimaVisitaMedico = "Selecciona una opción.";
    if (!datos.patologia.trim()) nuevos.patologia = "Indica tu patología o escribe \"ninguna\".";
    if (!datos.motivoConsulta.trim()) nuevos.motivoConsulta = "Describe brevemente el motivo de tu consulta.";
    if (!datos.gradoInstruccion) nuevos.gradoInstruccion = "Selecciona tu grado de instrucción.";
    if (!datos.religion) nuevos.religion = "Selecciona tu religión.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setEnviando(true);
    setErrorEnvio(false);
    try {
      const respuesta = await fetch("/api/registros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...datos,
          edad: edad ?? "",
          imc: imc ?? "",
        }),
      });
      if (!respuesta.ok) throw new Error("Error del servidor");
      const primerNombre = datos.nombre.split(" ")[0];
      setDatos(inicial);
      setErrores({});
      setEnviado(true);
      window.alert(`Datos almacenados correctamente. ¡Gracias, ${primerNombre}!`);
    } catch {
      setErrorEnvio(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main>
      <form className="ficha" onSubmit={enviar} noValidate>
        <header className="cabecera">
          <Image
            src="/terapeuta.jpg"
            alt="Terapeuta"
            width={80}
            height={80}
            className="foto-terapeuta"
            priority
          />
          <div>
            <h1>Historia Clínica</h1>
            <p className="nombre-terapeuta">Stefany Muentes</p>
            <p>
              Completa tus datos personales, antropométricos y sociales. Los campos
              con datos básicos son obligatorios.
            </p>
          </div>
        </header>

        <section className="grupo" aria-labelledby="g-identificacion">
          <h2 id="g-identificacion">Identificación</h2>

          <div className="campo">
            <label htmlFor="nombre">Nombre y apellido</label>
            <input
              id="nombre"
              type="text"
              autoComplete="name"
              value={datos.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
            />
            {errores.nombre && <p className="error">{errores.nombre}</p>}
          </div>

          <div className="fila">
            <div className="campo">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={datos.email}
                onChange={(e) => cambiar("email", e.target.value)}
              />
              {errores.email && <p className="error">{errores.email}</p>}
            </div>
            <div className="campo">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                type="tel"
                autoComplete="tel"
                placeholder="0412-0000000"
                value={datos.telefono}
                onChange={(e) => cambiar("telefono", e.target.value)}
              />
              {errores.telefono && <p className="error">{errores.telefono}</p>}
            </div>
          </div>

          <div className="campo">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
            <input
              id="fechaNacimiento"
              type="date"
              value={datos.fechaNacimiento}
              onChange={(e) => cambiar("fechaNacimiento", e.target.value)}
            />
            {errores.fechaNacimiento && (
              <p className="error">{errores.fechaNacimiento}</p>
            )}
            {edad !== null && (
              <dl className="lectura" aria-live="polite">
                <div>
                  <dt>Edad calculada</dt>
                  <dd>
                    {edad} {edad === 1 ? "año" : "años"}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </section>

        <section className="grupo" aria-labelledby="g-perfil">
          <h2 id="g-perfil">Perfil personal</h2>

          <div className="fila">
            <div className="campo">
              <label htmlFor="estadoCivil">Estado civil</label>
              <select
                id="estadoCivil"
                value={datos.estadoCivil}
                onChange={(e) => cambiar("estadoCivil", e.target.value)}
              >
                <option value="">Selecciona…</option>
                <option>Soltero/a</option>
                <option>Casado/a</option>
                <option>Divorciado/a</option>
                <option>Viudo/a</option>
                <option>Unión libre</option>
              </select>
              {errores.estadoCivil && <p className="error">{errores.estadoCivil}</p>}
            </div>

            <div className="campo">
              <fieldset className="campo" style={{ border: "none", padding: 0, margin: 0 }}>
                <legend style={{ fontWeight: 500, marginBottom: "0.3rem" }}>Sexo</legend>
                <div className="radios">
                  <label>
                    <input
                      type="radio"
                      name="sexo"
                      value="Femenino"
                      checked={datos.sexo === "Femenino"}
                      onChange={(e) => cambiar("sexo", e.target.value)}
                    />
                    Femenino
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="sexo"
                      value="Masculino"
                      checked={datos.sexo === "Masculino"}
                      onChange={(e) => cambiar("sexo", e.target.value)}
                    />
                    Masculino
                  </label>
                </div>
                {errores.sexo && <p className="error">{errores.sexo}</p>}
              </fieldset>
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label htmlFor="ocupacion">Ocupación u oficio</label>
              <input
                id="ocupacion"
                type="text"
                placeholder="Por ejemplo: docente"
                value={datos.ocupacion}
                onChange={(e) => cambiar("ocupacion", e.target.value)}
              />
              {errores.ocupacion && <p className="error">{errores.ocupacion}</p>}
            </div>
            <div className="campo">
              <label htmlFor="hijos">
                Número de hijos <span className="ayuda">(0 si no tiene)</span>
              </label>
              <input
                id="hijos"
                type="number"
                min={0}
                value={datos.hijos}
                onChange={(e) => cambiar("hijos", e.target.value)}
              />
              {errores.hijos && <p className="error">{errores.hijos}</p>}
            </div>
          </div>
        </section>

        <section className="grupo" aria-labelledby="g-salud">
          <h2 id="g-salud">Salud y contexto</h2>

          <div className="fila">
            <div className="campo">
              <label htmlFor="peso">Peso (kg)</label>
              <input
                id="peso"
                type="number"
                min={1}
                step="0.1"
                value={datos.peso}
                onChange={(e) => cambiar("peso", e.target.value)}
              />
              {errores.peso && <p className="error">{errores.peso}</p>}
            </div>
            <div className="campo">
              <label htmlFor="estatura">Estatura (cm)</label>
              <input
                id="estatura"
                type="number"
                min={30}
                value={datos.estatura}
                onChange={(e) => cambiar("estatura", e.target.value)}
              />
              {errores.estatura && <p className="error">{errores.estatura}</p>}
            </div>
          </div>

          {imc !== null && (
            <dl className="lectura" aria-live="polite">
              <div>
                <dt>IMC calculado</dt>
                <dd>{imc.toFixed(1)}</dd>
              </div>
            </dl>
          )}

          <div className="campo">
            <label htmlFor="ultimaVisita">
              Última vez que visitó al médico
            </label>
            <select
              id="ultimaVisita"
              value={datos.ultimaVisitaMedico}
              onChange={(e) => cambiar("ultimaVisitaMedico", e.target.value)}
            >
              <option value="">Selecciona…</option>
              <option>Menos de 6 meses</option>
              <option>Entre 6 meses y 1 año</option>
              <option>Entre 1 y 3 años</option>
              <option>Más de 3 años</option>
              <option>Nunca he visitado al médico</option>
            </select>
            {errores.ultimaVisitaMedico && (
              <p className="error">{errores.ultimaVisitaMedico}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="patologia">
              Patología <span className="ayuda">(escribe "ninguna" si no tiene)</span>
            </label>
            <input
              id="patologia"
              type="text"
              placeholder="Por ejemplo: asma, hipertensión"
              value={datos.patologia}
              onChange={(e) => cambiar("patologia", e.target.value)}
            />
            {errores.patologia && <p className="error">{errores.patologia}</p>}
          </div>

          <div className="campo">
            <label htmlFor="motivoConsulta">Motivo de consulta</label>
            <textarea
              id="motivoConsulta"
              rows={3}
              placeholder="Describe brevemente el motivo de la consulta"
              value={datos.motivoConsulta}
              onChange={(e) => cambiar("motivoConsulta", e.target.value)}
            />
            {errores.motivoConsulta && (
              <p className="error">{errores.motivoConsulta}</p>
            )}
          </div>

          <div className="fila">
            <div className="campo">
              <label htmlFor="gradoInstruccion">Grado de instrucción</label>
              <select
                id="gradoInstruccion"
                value={datos.gradoInstruccion}
                onChange={(e) => cambiar("gradoInstruccion", e.target.value)}
              >
                <option value="">Selecciona…</option>
                <option>Primaria</option>
                <option>Secundaria</option>
                <option>Técnico o tecnológico</option>
                <option>Universitario</option>
                <option>Posgrado</option>
              </select>
              {errores.gradoInstruccion && (
                <p className="error">{errores.gradoInstruccion}</p>
              )}
            </div>
            <div className="campo">
              <label htmlFor="religion">Religión</label>
              <select
                id="religion"
                value={datos.religion}
                onChange={(e) => cambiar("religion", e.target.value)}
              >
                <option value="">Selecciona…</option>
                <option>Católica</option>
                <option>Cristiana evangélica</option>
                <option>Otra</option>
                <option>Ninguna</option>
              </select>
              {errores.religion && <p className="error">{errores.religion}</p>}
            </div>
          </div>
        </section>

        <div className="envio">
          <button type="submit" disabled={enviando}>
            {enviando ? "Registrando…" : "Registrar ficha"}
          </button>
          {enviado && (
            <p className="confirmacion" role="status">
              Ficha registrada. Gracias, {datos.nombre.split(" ")[0]}.
            </p>
          )}
          {errorEnvio && (
            <p className="error" role="alert">
              No se pudo registrar. Revisa tu conexión e inténtalo de nuevo.
            </p>
          )}
        </div>
      </form>
    </main>
  );
}

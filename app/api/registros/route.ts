import { google } from "googleapis";
import { NextResponse } from "next/server";
import path from "path";
import { readFileSync } from "fs";

type Registro = {
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  edad: string | number;
  estadoCivil: string;
  sexo: string;
  ocupacion: string;
  peso: string;
  estatura: string;
  imc: string | number;
  hijos: string;
  ultimaVisitaMedico: string;
  gradoInstruccion: string;
  religion: string;
};

const ENCABEZADOS = [
  "Fecha de registro", "Nombre y apellido", "Email", "Teléfono",
  "Fecha de nacimiento", "Edad", "Estado civil", "Sexo",
  "Ocupación", "Peso (kg)", "Estatura (cm)", "IMC",
  "Número de hijos", "Última visita al médico",
  "Grado de instrucción", "Religión",
];

function leerCredenciales() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64) {
    return JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64, "base64").toString("utf8"),
    );
  }
  return JSON.parse(
    readFileSync(
      path.join(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS!),
      "utf8",
    ),
  );
}

async function obtenerHoja() {
  const credenciales = leerCredenciales();
  const auth = new google.auth.JWT({
    email: credenciales.client_email,
    key: credenciales.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth }).spreadsheets.values;
}

export async function POST(request: Request) {
  try {
    const datos = (await request.json()) as Registro;

    const hoja = await obtenerHoja();
    const sheetId = process.env.SHEET_ID!;

    const rango = await hoja.get({
      spreadsheetId: sheetId,
      range: "A1",
    });

    if (!rango.data.values || rango.data.values.length === 0) {
      await hoja.append({
        spreadsheetId: sheetId,
        range: "A1",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [ENCABEZADOS] },
      });
    }

    await hoja.append({
      spreadsheetId: sheetId,
      range: "A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          new Date().toLocaleString("es-VE"), datos.nombre, datos.email,
          datos.telefono, datos.fechaNacimiento, datos.edad, datos.estadoCivil,
          datos.sexo, datos.ocupacion, datos.peso, datos.estatura, datos.imc,
          datos.hijos, datos.ultimaVisitaMedico, datos.gradoInstruccion,
          datos.religion,
        ]],
      },
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Error al guardar en Google Sheets:", error);
    return NextResponse.json(
      { status: "error", mensaje: "No se pudo guardar el registro." },
      { status: 500 },
    );
  }
}

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sql from 'mssql';
import { OpenAI } from 'openai';
import twilio from 'twilio'; // Si lo usas; si no, puedes eliminarlo

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configuración de OpenAI utilizando la nueva API (Chat completions)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Función auxiliar para insertar datos en SQL Server
async function insertClientData(state) {
  const config = {
    server: 'localhost', // O 'localhost\\SQLEXPRESS'
    database: 'sinergia_clientes',
    user: 'node_user',
    password: 'root',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
    port: 1433,
  };

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO clientes (Nombre, TipoIdentificacion, Identificacion, celular, correo, Servicios)
      VALUES (${state.nombre}, ${state.tipoId}, ${state.identificacion}, ${state.celular}, ${state.correo}, ${state.servicios})
    `;
    console.log("Datos almacenados correctamente en la BD.");
  } catch (error) {
    console.error("Error con SQL Server:", error);
    throw error;
  }
}

// Estado inicial de la conversación (para reiniciarla)
const initialState = {
  stage: "init",
  nombre: "",
  tipoId: "",
  identificacion: "",
  celular: "",
  correo: "",
  servicios: "",
  timestamp: Date.now()
};

/**
 * Endpoint para el chatbot.
 * Maneja el flujo de conversación según el estado recibido.
 */
app.post('/chatbot', async (req, res) => {
  let { message, conversationState } = req.body;
  
  // Inicializa el estado si no se envía o no tiene 'stage'
  if (!conversationState || !conversationState.stage) {
    conversationState = { ...initialState };
  }
  
  let reply = "";

  switch (conversationState.stage) {
    case "init":
      reply = "Hola, bienvenido a SINERGIA CONSULTORÍA. ¿Cuál es tu nombre completo?";
      conversationState.stage = "nombre";
      break;
    case "nombre":
      conversationState.nombre = message;
      reply = `Encantado de conocerte, ${message}. ¿Cuál es tu tipo de identificación? (por ejemplo: CC o Nit)`;
      conversationState.stage = "tipoId";
      break;
    case "tipoId":
      conversationState.tipoId = message;
      reply = "¿Cuál es tu número de identificación?";
      conversationState.stage = "identificacion";
      break;
    case "identificacion":
      conversationState.identificacion = message;
      reply = "¿Cuál es tu número de celular?";
      conversationState.stage = "celular";
      break;
    case "celular":
      conversationState.celular = message;
      reply = "¿Cuál es tu correo electrónico?";
      conversationState.stage = "correo";
      break;
    case "correo":
      conversationState.correo = message;
      reply = "¿En qué servicio de SINERGIA CONSULTORÍA estás interesado? (Opciones: Diagnóstico, Asesoría, Diseño tecnológico)";
      conversationState.stage = "servicio";
      break;
    case "servicio":
      conversationState.servicios = message;
      reply = "Gracias por la información. ¿Deseas recibir una breve asesoría personalizada? (Responde: Sí o No)";
      conversationState.stage = "final";
      break;
    case "final":
      const normalized = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (normalized.includes("si")) {
        const whatsappLink = process.env.EMPLOYEE_WHATSAPP_URL || "https://wa.me/573147204124";
        reply = `Perfecto, por favor haz clic en <a href="${whatsappLink}" target="_blank">este enlace</a> para contactar a un asesor. ¡Gracias por confiar en SINERGIA CONSULTORÍA!`;
        console.log("Insertando datos en la BD:", conversationState);
        try {
          await insertClientData(conversationState);
        } catch (dbError) {
          console.error("No se pudieron guardar los datos en la BD:", dbError);
        }
      } else {
        reply = "Entendido. Si en el futuro necesitas asesoría, no dudes en contactarnos. ¡Que tengas un excelente día!";
      }
      // Reinicia el estado de la conversación para iniciar un nuevo flujo
      conversationState = { ...initialState };
      break;
    default:
      reply = "Lo siento, no entendí tu respuesta. ¿Podrías repetirlo?";
      break;
  }
  
  conversationState.timestamp = Date.now();
  res.json({ reply, conversationState });
});

/**
 * Endpoint para almacenar datos del cliente en SQL Server (alternativo)
 */
app.post('/submit', async (req, res) => {
  const { nombre, tipoId, identificacion, celular, correo, servicios } = req.body;

  const config = {
    server: 'localhost', // O 'localhost\\SQLEXPRESS'
    database: 'sinergia_clientes',
    user: 'node_user',
    password: 'root',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
    port: 1433,
  };

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO clientes (Nombre, TipoIdentificacion, Identificacion, celular, correo, Servicios)
      VALUES (${nombre}, ${tipoId}, ${identificacion}, ${celular}, ${correo}, ${servicios})
    `;
    res.json({ message: 'Datos almacenados correctamente' });
  } catch (error) {
    console.error("Error con SQL Server:", error);
    res.status(500).json({ message: 'Error al almacenar los datos', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

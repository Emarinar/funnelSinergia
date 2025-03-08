import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sql from 'mssql';
import { OpenAI } from 'openai';

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configuración de OpenAI utilizando la nueva API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Endpoint para el chatbot.
 * Maneja el flujo de conversación y reinicia si no hay respuesta en 3 minutos.
 */
app.post('/chatbot', async (req, res) => {
  let { message, conversationState } = req.body;
  
  // Si no se envía estado, inicializarlo con un timestamp
  if (!conversationState || !conversationState.stage) {
    conversationState = {
      stage: "init",
      nombre: "",
      tipoId: "",
      identificacion: "",
      celular: "",
      correo: "",
      servicios: "",
      timestamp: Date.now()  // Marca de tiempo de la última actividad
    };
  } else {
    // Verifica si han pasado más de 3 minutos sin actividad
    if (conversationState.timestamp && (Date.now() - conversationState.timestamp > 180000)) {
      // Reinicia la conversación
      conversationState = {
        stage: "init",
        nombre: "",
        tipoId: "",
        identificacion: "",
        celular: "",
        correo: "",
        servicios: "",
        timestamp: Date.now()
      };
      return res.json({
        reply: "El tiempo de espera ha expirado. Reiniciemos la conversación. ¿Cuál es tu nombre completo?",
        conversationState
      });
    }
  }

  let reply = "";

  // Flujo de conversación
  switch (conversationState.stage) {
    case "init":
      reply = "Hola, bienvenido a Sinergia. ¿Cuál es tu nombre completo?";
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
      reply = "¿En qué servicios de Sinergia estás interesado? (por ejemplo: diagnóstico, asesoría, diseño tecnológico, etc.)";
      conversationState.stage = "servicios";
      break;
    case "servicios":
      conversationState.servicios = message;
      reply = "Gracias por la información. ¿Deseas recibir una breve asesoría personalizada? (Responde: Sí o No)";
      conversationState.stage = "final";
      break;
    case "final":
      // Normalizamos el mensaje para que la comparación sea insensible a tildes y mayúsculas/minúsculas
      const normalized = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (normalized.includes("si")) {
        reply = "Perfecto, un asesor se pondrá en contacto contigo en breve. ¡Gracias por confiar en Sinergia!";
      } else {
        reply = "Entendido. Si en el futuro necesitas asesoría, no dudes en contactarnos. ¡Que tengas un excelente día!";
      }
      break;
    default:
      reply = "Lo siento, no entendí tu respuesta. ¿Podrías repetirlo?";
      break;
  }
  
  // Actualiza el timestamp para reiniciar el tiempo de inactividad
  conversationState.timestamp = Date.now();
  res.json({ reply, conversationState });
});


/**
 * Endpoint para almacenar datos del cliente en SQL Server.
 */
app.post('/submit', async (req, res) => {
  const { nombre, cedula, identificacion, celular, correo } = req.body;

  const config = {
    server: 'localhost', // O 'localhost\\SQLEXPRESS'
    database: 'sinergia_clientes',
    user: 'node_user',
    password: 'root',
    options: {
      encrypt: false,
      trustServerCertificate: true
    },
    port: 1433
  };

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO Clientes (nombre, cedula, identificacion, celular, correo)
      VALUES (${nombre}, ${cedula}, ${identificacion}, ${celular}, ${correo})
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

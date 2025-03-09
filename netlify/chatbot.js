// netlify/functions/chatbot.js
const { Configuration, OpenAIApi } = require('openai');
const sql = require('mssql');

// Configuración de OpenAI usando variables de entorno
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Configura esta variable en Netlify
});
const openai = new OpenAIApi(configuration);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, conversationState } = JSON.parse(event.body);

    // Prepara un prompt para OpenAI que incluya el estado de la conversación
    const prompt = `
      Eres un asistente virtual para Sinergia Consultoría SGI. Tu tarea es recoger la siguiente información del cliente:
      - Nombre completo
      - Cédula
      - Apellido
      - Celular
      - Correo electrónico

      Hasta ahora has recogido: ${JSON.stringify(conversationState)}
      El cliente dice: "${message}"
      Responde de forma profesional y guía la conversación para obtener el siguiente dato faltante.
    `;

    // Llama a OpenAI para generar la respuesta
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiResponse = completion.data.choices[0].text.trim();

    // Opcional: Si la respuesta indica que se ha completado la recolección,
    // podrías almacenar los datos en la base de datos aquí.
    // Por ejemplo, si conversationState ya contiene todos los datos, haz:
    // await sql.connect(configSQL);
    // await pool.request()... (consulta de inserción)

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: aiResponse })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al procesar el mensaje', error: error.message })
    };
  }
};

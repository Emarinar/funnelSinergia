// netlify/functions/submitForm.js
const sql = require('mssql');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);

    // Configura tu conexión usando variables de entorno en Netlify
    const config = {
        server: 'localhost', // O 'localhost\\SQLEXPRESS'
        database: 'sinergia_clientes',
        user: 'node_user', // Usuario de SQL Server
        password: 'root', // Reemplázala con la real
        options: {
            encrypt: false,
            trustServerCertificate: true
        },
        port: 1433
    };

    // Conecta a la base de datos
    let pool = await sql.connect(config);
    // Ajusta la consulta según tu esquema
    let result = await pool.request()
      .input('nombre', sql.VarChar, data.nombre)
      .input('correo', sql.VarChar, data.correo)
      .input('telefono', sql.VarChar, data.telefono)
      .input('empresa', sql.VarChar, data.empresa)
      .input('interes', sql.VarChar, data.interes)
      .input('mensaje', sql.VarChar, data.mensaje)
      .query(`INSERT INTO Clientes (nombre, correo, telefono, empresa, interes, mensaje)
              VALUES (@nombre, @correo, @telefono, @empresa, @interes, @mensaje)`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Formulario enviado correctamente' }),
    };

  } catch (error) {
    console.error('Error: ', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al enviar el formulario' }),
    };
  }
};

fetch('/.netlify/functions/submitForm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});


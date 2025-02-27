const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors'); // Habilitar CORS

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Permitir JSON en las peticiones

// 📌 Configuración de la base de datos
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

// 📌 Conectar a SQL Server
sql.connect(config)
    .then(pool => {
        console.log('✅ Conectado a SQL Server');
        return pool;
    })
    .catch(err => console.error('❌ Error al conectar con SQL Server:', err));

// 📌 RUTA PARA INSERTAR CLIENTES
app.post('/api/clientes', async (req, res) => {
    try {
        console.log('📩 Datos recibidos en la API:', req.body); // 🔹 Verifica si los datos llegan

        const { nombre, correo, telefono, empresa, interes, mensaje } = req.body;

        if (!nombre || !correo || !telefono || !interes || !mensaje) {
            return res.status(400).send('❌ Todos los campos son obligatorios');
        }

        const pool = await sql.connect(config);

        // 📌 Verificar si el correo ya existe en la base de datos
        const checkEmail = await pool.request()
            .input('correo', sql.NVarChar, correo)
            .query('SELECT COUNT(*) AS count FROM clientes WHERE correo = @correo');

        if (checkEmail.recordset[0].count > 0) {
            return res.status(400).send('❌ Este correo ya está registrado.');
        }

        // 📌 Insertar nuevo cliente
        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('correo', sql.NVarChar, correo)
            .input('telefono', sql.NVarChar, telefono)
            .input('empresa', sql.NVarChar, empresa)
            .input('interes', sql.NVarChar, interes)
            .input('mensaje', sql.NVarChar, mensaje)
            .query(`
                INSERT INTO clientes (nombre, correo, telefono, empresa, interes, mensaje)
                VALUES (@nombre, @correo, @telefono, @empresa, @interes, @mensaje)
            `);

        res.status(200).send('✅ Cliente agregado con éxito');
    } catch (err) {
        console.error('❌ Error al insertar cliente:', err);
        res.status(500).send('Error al guardar el cliente');
    }
});

// 📌 Ruta de prueba para saber si el servidor está corriendo
app.get('/', (req, res) => {
    res.send('🚀 API de Sinergia Consultoría SGI está en funcionamiento.');
});

// 📌 Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

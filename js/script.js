document.getElementById('clienteForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evitar recargar la página
  
    const data = {
      nombre: document.getElementById('nombre').value,
      correo: document.getElementById('correo').value,
      telefono: document.getElementById('telefono').value,
      empresa: document.getElementById('empresa').value,
      interes: document.getElementById('interes').value,
      mensaje: document.getElementById('mensaje').value
    };
  
    try {
      const response = await fetch('http://localhost:3000/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      alert('Ocurrió un error. Intenta nuevamente.');
    }
  });
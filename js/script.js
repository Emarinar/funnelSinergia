document.getElementById('clienteForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  // Obtener valores y eliminar espacios extra
  const nombre = document.getElementById('nombre').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const correoConfirm = document.getElementById('correoConfirm').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const telefonoConfirm = document.getElementById('telefonoConfirm').value.trim();
  const empresa = document.getElementById('empresa').value.trim();
  const interes = document.getElementById('interes').value.trim();
  const mensaje = document.getElementById('mensaje').value.trim();

  // Validar que el correo y su confirmación sean iguales
  if (correo !== correoConfirm) {
    alert("Los correos no coinciden. Por favor, verifícalos.");
    return;
  }

  // Validar que el teléfono y su confirmación sean iguales
  if (telefono !== telefonoConfirm) {
    alert("Los números de teléfono no coinciden. Por favor, verifícalos.");
    return;
  }

  // Preparar el objeto de datos (omite los campos de confirmación)
  const data = {
    nombre: nombre,
    correo: correo,
    telefono: telefono,
    empresa: empresa,
    interes: interes,
    mensaje: mensaje
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
    
    // Resetear el formulario después del envío exitoso
    document.getElementById('clienteForm').reset();
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
    alert('Ocurrió un error. Intenta nuevamente.');
  }
});

// Seleccionamos el contenedor del slider y todas las imágenes
const slider = document.querySelector('.slider');
const slides = document.querySelectorAll('.slider img');
let currentIndex = 0;
const totalSlides = slides.length;

function showNextSlide() {
  currentIndex = (currentIndex + 1) % totalSlides;
  slider.style.transform = `translateX(-${currentIndex * 100}%)`;
}

setInterval(showNextSlide, 3000);

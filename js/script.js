// ===== Estado global para el chatbot =====
let conversationState = {};

// ===== Funciones del Chatbot =====

// Función para agregar mensajes al área de chat
function appendMessage(sender, message) {
  const messagesContainer = document.getElementById('chatbot-messages');
  const messageEl = document.createElement('div');
  messageEl.classList.add('chat-message', sender.toLowerCase());
  // Usamos innerHTML para que se interprete el HTML incluido (por ejemplo, el enlace)
  messageEl.innerHTML = `<strong>${sender}:</strong> ${message}`;
  messagesContainer.appendChild(messageEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Función para enviar mensaje al endpoint del chatbot
async function sendMessage() {
  const inputEl = document.getElementById('chatbot-input');
  const message = inputEl.value.trim();
  if (!message) return;

  appendMessage('Usuario', message);
  inputEl.value = '';

  try {
    const response = await fetch('http://localhost:3000/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationState })
    });
    const data = await response.json();
    conversationState = data.conversationState;
    appendMessage('Asistente', data.reply);
  } catch (error) {
    console.error("Error enviando el mensaje:", error);
    appendMessage('Asistente', 'Lo siento, ocurrió un error.');
  }
}

// ===== Eventos del Chatbot =====
document.getElementById('chatbot-send').addEventListener('click', sendMessage);
document.getElementById('chatbot-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

// ===== Eventos para abrir y cerrar el Chatbot =====
document.getElementById('chatbot-toggle').addEventListener('click', () => {
  document.getElementById('chatbot').classList.remove('minimized');
  document.getElementById('chatbot-toggle').style.display = 'none';
});

document.getElementById('chatbot-close').addEventListener('click', () => {
  document.getElementById('chatbot').classList.add('minimized');
  document.getElementById('chatbot-toggle').style.display = 'block';
});

// ===== Lógica del Slider =====
const slider = document.querySelector('.slider');
const slides = document.querySelectorAll('.slider img');
let currentIndex = 0;
const totalSlides = slides.length;

function showNextSlide() {
  currentIndex = (currentIndex + 1) % totalSlides;
  slider.style.transform = `translateX(-${currentIndex * 100}%)`;
}

setInterval(showNextSlide, 3000);

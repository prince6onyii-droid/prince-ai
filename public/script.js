// ============================================
// PRINCE AI - FRONTEND
// RENDER BACKEND: https://prince-ai-n5m0.onrender.com
// ============================================
const API_BASE = 'https://prince-ai-n5m0.onrender.com';

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const chatInterface = document.getElementById('chat-interface');
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const micBtn = document.getElementById('mic-btn');
const themeToggle = document.getElementById('theme-toggle');
const clearChat = document.getElementById('clear-chat');

// State
let chatHistory = [];
let isLoading = false;
let isRecording = false;
let recognition = null;

// ============================================
// WELCOME SCREEN
// ============================================
function startChat() {
  welcomeScreen.classList.add('hidden');
  setTimeout(() => {
    chatInterface.classList.add('active');
    userInput.focus();
  }, 300);
}

// ============================================
// MESSAGE FUNCTIONS
// ============================================
function addMessage(role, content) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${role}-message`;
  
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? '👤' : '🤴';
  
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  
  const formatted = formatContent(content);
  bubble.innerHTML = formatted;
  
  const timestamp = document.createElement('span');
  timestamp.className = 'timestamp';
  timestamp.textContent = getTimeString();
  bubble.appendChild(timestamp);
  
  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  messagesContainer.appendChild(msgDiv);
  
  scrollToBottom();
}








function formatContent(text) {
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  safe = safe.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
  safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\*(.*?)\*/g, '<em>$1</em>');
  safe = safe.replace(/\n/g, '<br>');
  
  return safe;
}

function getTimeString() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function scrollToBottom() {
  const chatContainer = document.getElementById('chat-container');
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: 'smooth'
  });
}



// ============================================
// API COMMUNICATION
// ============================================
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;

  userInput.value = '';
  sendBtn.disabled = true;

  addMessage('user', text);
  chatHistory.push({ role: 'user', content: text });

  showTyping();
  isLoading = true;

  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: chatHistory.slice(-12)
      })
    });

    hideTyping();
    isLoading = false;

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    addMessage('ai', data.reply);
    chatHistory.push({ role: 'assistant', content: data.reply });

  } catch (error) {
    hideTyping();
    isLoading = false;
    console.error('Prince AI Error:', error);
    addMessage('ai', 'My deepest apologies, Your Highness. The royal connection has been disrupted. Please try again shortly. 👑');
  }
}

function showTyping() {
  typingIndicator.classList.remove('hidden');
  scrollToBottom();
}

function hideTyping() {
  typingIndicator.classList.add('hidden');
}


// ============================================
// EVENT LISTENERS
// ============================================
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener('input', () => {
  sendBtn.disabled = !userInput.value.trim();
});

// Clear chat
clearChat.addEventListener('click', () => {
  if (confirm('Clear the royal conversation?')) {
    messagesContainer.innerHTML = `
      <div class="message ai-message welcome-message">
        <div class="avatar">🤴</div>
        <div class="bubble">
          <p>The slate has been wiped clean, Your Highness. How may I serve you now? 👑</p>
          <span class="timestamp">${getTimeString()}</span>
        </div>
      </div>
    `;
    chatHistory = [];
  }
});

// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  themeToggle.textContent = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
});

// Voice input
micBtn.addEventListener('click', toggleVoice);

function toggleVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice input is not supported in this browser, Your Highness.');
    return;
  }

  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isRecording = true;
    micBtn.classList.add('recording');
    micBtn.title = 'Stop Recording';
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendBtn.disabled = false;
    stopRecording();
    sendMessage();
  };

  recognition.onerror = () => {
    stopRecording();
    addMessage('ai', 'I could not hear you clearly, Your Highness. Please speak again. 👑');
  };

  recognition.onend = () => {
    stopRecording();
  };

  recognition.start();
}

function stopRecording() {
  isRecording = false;
  micBtn.classList.remove('recording');
  micBtn.title = 'Voice Input';
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

// Initialize
sendBtn.disabled = true;
console.log('👑 Prince AI loaded. Royal service ready.');


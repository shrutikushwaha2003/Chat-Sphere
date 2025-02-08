const socket = io('http://localhost:8000');  // Connect to the server

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const userNameElement = document.getElementById('user-name');
const userList = document.getElementById('user-list'); // This will display online users

// Store the current user's name and socket ID
let userName = prompt('Enter your name:');
socket.emit('new-user', userName); // Send the name to the server
userNameElement.textContent = userName;  // Display the current user's name

// Function to append messages to the chat box
const appendMessage = (message, className = '') => {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('message', className);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
};

// Listen for when the server sends a message (from another user)
socket.on('receive-message', ({ sender, message }) => {
    appendMessage(`${sender.name}: ${message}`, 'other');
});

// Listen for the user list from the server
socket.on('user-list', (users) => {
    // Clear the user list
    userList.innerHTML = '';

    // Add each user to the list
    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.textContent = user;
        userList.appendChild(userItem);
    });
});

// Listen for when the user is connected to the server
socket.on('connected', (name) => {
    console.log(`Connected as: ${name}`);
});

// Send a message to all users (broadcast)
sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim() !== '') {
        appendMessage(`You: ${message}`, 'self'); // Show your own message
        socket.emit('send-message', message); // Broadcast message to all users
        messageInput.value = ''; // Clear the input field
    }
});

// Optional: Send message on Enter key press
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && messageInput.value.trim() !== '') {
        sendButton.click();
    }
});

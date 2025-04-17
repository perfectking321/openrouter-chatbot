document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const historyList = document.getElementById('history-list');
    const clearHistoryButton = document.getElementById('clear-history');
    const historyButton = document.getElementById('history-button');
    const historyPanel = document.getElementById('history-panel');
    const closeHistoryButton = document.getElementById('close-history');
    const mainChat = document.querySelector('.main-chat');
    
    // Toggle history panel and fade out the history button
    historyButton.addEventListener('click', function() {
        historyPanel.classList.toggle('active');
        mainChat.classList.toggle('shifted');
        
        // Fade out the history button when panel is active
        if (historyPanel.classList.contains('active')) {
            historyButton.classList.add('fade-out');
        } else {
            historyButton.classList.remove('fade-out');
        }
    });

    // When close button is clicked, make history button visible again
    closeHistoryButton.addEventListener('click', function() {
        historyPanel.classList.remove('active');
        mainChat.classList.remove('shifted');
        historyButton.classList.remove('fade-out');
    });

    
    // Auto-resize the textarea as the user types
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.scrollHeight > 150) {
            this.style.height = '150px';
        }
    });
    
    // Handle sending messages when the Send button is clicked
    sendButton.addEventListener('click', sendMessage);
    
    // Handle sending messages when Enter key is pressed (without Shift)
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Clear chat history
    clearHistoryButton.addEventListener('click', clearHistory);
    
    // Load chat history when the page loads
    loadChatHistory();
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        // Add user message to chat
        addMessageToChat('user', message);
        
        // Clear input field and reset height
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send message to server
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            // Remove typing indicator
            hideTypingIndicator();
            
            // Add bot message to chat
            addMessageToChat('bot', data.message);
            
            // Update history panel
            updateHistoryPanel(data.history);
        })
        .catch(error => {
            console.error('Error:', error);
            hideTypingIndicator();
            addMessageToChat('bot', 'Sorry, I encountered an error. Please try again.');
        });
    }
    
    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = message;
        
        messageElement.appendChild(messageContent);
        chatMessages.appendChild(messageElement);
        
        // Scroll to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        typingIndicator.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            typingIndicator.appendChild(dot);
        }
        
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    function updateHistoryPanel(history) {
        // Clear existing history items
        historyList.innerHTML = '';
        
        // Group messages by conversation
        let conversationIndex = 0;
        let currentConversation = [];
        
        history.forEach((msg, index) => {
            currentConversation.push(msg);
            
            // If this is a bot message or the last message, create a history item
            if (msg.role === 'assistant' || index === history.length - 1) {
                const userMessage = currentConversation.find(m => m.role === 'user');
                if (userMessage) {
                    const historyItem = document.createElement('div');
                    historyItem.classList.add('history-item');
                    historyItem.textContent = userMessage.content.substring(0, 30) + (userMessage.content.length > 30 ? '...' : '');
                    historyItem.setAttribute('data-index', conversationIndex);
                    
                    historyList.appendChild(historyItem);
                    conversationIndex++;
                }
                currentConversation = [];
            }
        });
    }
    
    function loadChatHistory() {
        fetch('/history')
            .then(response => response.json())
            .then(data => {
                const history = data.history;
                
                // Add messages to chat
                history.forEach(msg => {
                    addMessageToChat(msg.role === 'user' ? 'user' : 'bot', msg.content);
                });
                
                // Update history panel
                updateHistoryPanel(history);
            })
            .catch(error => {
                console.error('Error loading chat history:', error);
            });
    }
    
    function clearHistory() {
        fetch('/clear', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Clear chat messages (except the welcome message)
                chatMessages.innerHTML = `
                    <div class="message bot-message">
                        <div class="message-content">
                            Hello! I'm your Gemma 3 AI assistant. How can I help you today?
                        </div>
                    </div>
                `;
                
                // Clear history panel
                historyList.innerHTML = '';
            }
        })
        .catch(error => {
            console.error('Error clearing history:', error);
        });
    }
});

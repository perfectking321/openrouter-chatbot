from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Get API key from environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Initialize conversation history
conversation_history = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '') # type: ignore
    
    # Add user message to conversation history
    conversation_history.append({"role": "user", "content": user_message})
    
    # Prepare the messages for the API request
    messages = conversation_history.copy()
    
    # Make request to OpenRouter API
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5000",  # Required for OpenRouter API
            "X-Title": "Gemma 3 Chatbot"  # Optional, but good practice
        },
        json={
            "model": "google/gemma-3-4b-it:free",  # Using the free Gemma 3 4B model
            "messages": messages
        }
    )
    
    if response.status_code == 200:
        response_data = response.json()
        bot_message = response_data['choices'][0]['message']['content']
        
        # Add bot response to conversation history
        conversation_history.append({"role": "assistant", "content": bot_message})
        
        # Return only the last 30 messages to maintain context window
        if len(conversation_history) > 30:
            conversation_history.pop(0)
            conversation_history.pop(0)
        
        return jsonify({
            "message": bot_message,
            "history": conversation_history
        })
    else:
        return jsonify({
            "message": "Sorry, I encountered an error. Please try again.",
            "error": response.text
        }), 500

@app.route('/history', methods=['GET'])
def get_history():
    return jsonify({"history": conversation_history})

@app.route('/clear', methods=['POST'])
def clear_history():
    global conversation_history
    conversation_history = []
    return jsonify({"status": "success", "message": "Conversation history cleared"})

if __name__ == '__main__':
    app.run(debug=True)

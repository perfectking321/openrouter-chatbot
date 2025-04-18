# openrouter-chatbot

## Project Structure

```mermaid
graph TD
    subgraph "openrouter-chatbot"
        subgraph "Frontend"
            HTML[templates/index.html]
            CSS[static/css/style.css]
            JS[static/js/script.js]
        end

        subgraph "Backend"
            PY[app.py]
            ENV[.env]
        end

        subgraph "Documentation"
            MD[README.md]
        end

        HTML --> CSS
        HTML --> JS
        JS -->|API Calls| PY
        PY -->|Config| ENV
        PY -->|OpenRouter API| EXT[External Services]
    end

    subgraph "Flowcharts"
        FLOW[index.html]
    end

    JS -->|Navigation| FLOW
```

The diagram above shows the main components and their relationships:
- Frontend: Contains the web interface (HTML, CSS, JavaScript)
- Backend: Python Flask application with environment configuration
- External integrations with OpenRouter API
- Separate Flowcharts section for additional functionality


# Gemini Hackathon Backend

A FastAPI-based backend service for managing Gemini Live Chat sessions with Daily.co integration.

## Setup

### Environment Variables

Create a copy `.env.example` to a `.env` file and fill in the following variables:

```env
GOOGLE_API_KEY=your_google_api_key
DAILY_API_KEY=your_daily_api_key
```

### Installation

```bash
cd backend
uv sync
```

## Running the Application

### Development Server

```bash
# Using uv
uv run python run.py

# Or with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Development

### Code Style

The project uses:

- Ruff for linting and formatting
- Pyright for type checking

Run checks:

```bash
# Linting
ruff check .

# Type checking
pyright
```

### Adding New Endpoints

1. Create endpoint function in `app/api/endpoints/`
2. Register router in `app/api/routes.py`
3. Add any new services in `app/services/`

"""FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.logger import logger
from app.core.middleware import LoggingMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    logger.info("Starting application...")
    try:
        settings.validate()
        logger.info("Configuration validated successfully")
    except ValueError as e:
        logger.error(f"Configuration validation failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        FastAPI: Configured FastAPI application instance
    """
    app = FastAPI(
        title="Gemini Hackathon Backend",
        description="Backend API for Gemini Live Chat with Daily.co integration",
        version="0.1.0",
        lifespan=lifespan,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=settings.CORS_ALLOW_METHODS,
        allow_headers=settings.CORS_ALLOW_HEADERS,
    )
    
    # Add logging middleware
    app.add_middleware(LoggingMiddleware)

    # Register exception handlers
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        """Handle custom application exceptions."""
        logger.error(f"Application error: {exc.message}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.message},
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle unexpected exceptions."""
        logger.exception(f"Unexpected error: {str(exc)}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"},
        )

    # Include API routes
    app.include_router(api_router)

    return app


app = create_app()


@app.get("/")
async def root():
    """Root endpoint for health checks."""
    return {
        "status": "ok",
        "message": "Gemini Hackathon Backend API",
        "version": "0.1.0",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Backward compatibility endpoint - redirects to new API structure
@app.post("/start")
async def start_session_legacy(request: Request):
    """
    Legacy endpoint for backward compatibility.
    Redirects to /chat/start endpoint.
    
    This endpoint is deprecated and will be removed in a future version.
    Please use /chat/start instead.
    """
    from app.api.endpoints.chat import start_chat_session
    
    logger.warning("Using deprecated /start endpoint. Please migrate to /chat/start")
    return await start_chat_session(request)


if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting server on {settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
    )

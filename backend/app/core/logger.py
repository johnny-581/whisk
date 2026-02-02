"""Logging configuration for the application."""
from loguru import logger
import sys


def setup_logger():
    """Configure loguru logger with custom format and handlers."""
    logger.remove()  # Remove default handler
    
    # Add custom handler with format
    logger.add(
        sys.stderr,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO",
        colorize=True,
    )
    
    return logger


# Initialize logger on import
setup_logger()

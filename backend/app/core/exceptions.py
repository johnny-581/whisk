"""Custom exceptions for the application."""


class AppException(Exception):
    """Base exception for application errors."""
    
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class DailyAPIError(AppException):
    """Exception raised when Daily.co API calls fail."""
    
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(f"Daily API Error: {message}", status_code)


class BotSpawnError(AppException):
    """Exception raised when bot spawning fails."""
    
    def __init__(self, message: str):
        super().__init__(f"Bot Spawn Error: {message}", 500)


class ConfigurationError(AppException):
    """Exception raised for configuration errors."""
    
    def __init__(self, message: str):
        super().__init__(f"Configuration Error: {message}", 500)

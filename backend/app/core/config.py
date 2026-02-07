"""Application configuration and environment variables."""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(override=True)

# Import after load_dotenv to avoid circular import
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.core.exceptions import ConfigurationError


class Settings:
    """Application settings loaded from environment variables."""
    
    # API Keys
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    DAILY_API_KEY: str = os.getenv("DAILY_API_KEY", "")
    
    # Daily.co Configuration
    DAILY_API_URL: str = "https://api.daily.co/v1"
    DAILY_ROOM_DURATION_SECONDS: int = 10 * 60  # 10 minutes
    DAILY_MAX_PARTICIPANTS: int = 2
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    
    # CORS Configuration
    CORS_ORIGINS: list[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list[str] = ["*"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]
    
    # Gemini Configuration
    GEMINI_VOICE_ID: str = "Charon"
    
    # VAD Configuration
    VAD_STOP_SECS: float = 0.2
    
    # Paths
    PROJECT_ROOT: Path = Path(__file__).resolve().parent.parent.parent.parent
    DATABASE_PATH: Path = PROJECT_ROOT / "backend" / "data" / "vocab.db"
    
    @classmethod
    def validate(cls) -> None:
        """
        Validate required environment variables are set.
        
        Raises:
            ValueError: If required environment variables are missing
        """
        missing_vars = []
        
        if not cls.GOOGLE_API_KEY:
            missing_vars.append("GOOGLE_API_KEY")
        if not cls.DAILY_API_KEY:
            missing_vars.append("DAILY_API_KEY")
        
        if missing_vars:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing_vars)}"
            )


settings = Settings()

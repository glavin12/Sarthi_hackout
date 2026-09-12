from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Saarthi Decision Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    PORT: int = 8001
    HOST: str = "0.0.0.0"

    # Member 1 Data Service URL
    DATA_SERVICE_URL: str = "http://localhost:8000"

    # Financial Signal Thresholds
    STRESSED_FOIR_THRESHOLD: float = 0.60  # > 60% income going to debt
    VULNERABLE_FOIR_THRESHOLD: float = 0.45  # 45% - 60%
    HEALTHY_SAVINGS_RATE_MIN: float = 0.15  # 15%+
    VULNERABLE_SAVINGS_RATE_MIN: float = 0.05  # 5% - 15%

    # Fraud Detection Parameters
    FRAUD_CONTAMINATION: float = 0.03

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

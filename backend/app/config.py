from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    gemini_api_key: str = ""
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    cors_origins: str = "https://hadbiaghiles.github.io"

    gemini_chat_model: str = "gemini-2.0-flash"
    gemini_embed_model: str = "models/text-embedding-004"
    embedding_dim: int = 768
    chunk_size: int = 800
    chunk_overlap: int = 120
    top_k: int = 5
    max_upload_bytes: int = 8 * 1024 * 1024  # 8 MB — friendly for Render free

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

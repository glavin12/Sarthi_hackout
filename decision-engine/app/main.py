from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Saarthi Decision Engine — The AI Brain & Ethical Guardrail for Personal Banking.",
)

# Enable CORS for Member 4 (Frontend UI) and Member 3 (Chatbot)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(router, prefix=settings.API_V1_STR)
app.include_router(router)  # Also mount at root for easy access: POST /decide

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )

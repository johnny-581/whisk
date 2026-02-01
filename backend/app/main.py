import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api.routes import api_router
load_dotenv()
app = FastAPI()

port = os.getenv(PORT)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"]
)


#add router
app.include_router(api_router, prefix="/api")  

@app.get("/")
def root():
    return {
        "message": "Gemini 3 Hackathon"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        port=port,  
        reload=True  # for dev
    )
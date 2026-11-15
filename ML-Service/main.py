from fastapi import FastAPI
from demand_model import router as demand_router
from review_summary import router as review_summary_router

app = FastAPI(title="KrishiConnect ML Service")

app.include_router(demand_router, prefix="/api/ml/demand")
app.include_router(review_summary_router, prefix="/api/ml/reviews")

@app.get("/")
def read_root():
    return {"status": "ML Service is running"}

# Run with: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

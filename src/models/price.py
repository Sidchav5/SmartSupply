import os
import pandas as pd
import joblib

# Path to the saved pipeline (adjust if needed)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "best_rf_pipeline.pkl")

# Load the trained pipeline once
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

model_pipeline = joblib.load(MODEL_PATH)


def predict_price(base_price: float,
                  demand: int,
                  stock: int,
                  day_of_week: int,
                  season: str,
                  discount: float,
                  product_name: str,
                  days: int) -> float:
    """
    Predict final price using the saved RF pipeline.

    Returns float rounded to 2 decimals.
    """
    # Build a single-row DataFrame for prediction
    input_df = pd.DataFrame([{
        "base_price": base_price,
        "demand": demand,
        "stock": stock,
        "day_of_week": day_of_week,
        "season": season,
        "discount": discount,
        "product_name": product_name,
        "days": days,
        "product_id": 0  # dummy placeholder if model expects it
    }])

    # Predict
    predicted = model_pipeline.predict(input_df)[0]
    return round(float(predicted), 2)

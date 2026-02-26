import sys
import json
import joblib
import pandas as pd
import warnings
import os

warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

try:
    # Check if arguments are provided
    if len(sys.argv) < 3:
        raise ValueError("Insufficient arguments provided. Need at least Name and Category.")

    name_input = sys.argv[1]
    category_input = sys.argv[2]
    rating_input = float(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3] != 'undefined' else 4.0
    count_input = int(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4] != 'undefined' else 100

    # Load the pre-trained model 
    model_path = os.path.join(os.path.dirname(__file__), 'market_mind_model.pkl')
    if not os.path.exists(model_path):
        raise FileNotFoundError("Model file not found. Run train_model.py first.")
    
    model = joblib.load(model_path)

    # Format input
    input_df = pd.DataFrame({
        'name': [name_input],
        'category': [category_input],
        'rating': [rating_input],
        'rating_count': [count_input]
    })
    
    # Predict
    predicted_price = model.predict(input_df)[0]
    if predicted_price < 50: predicted_price = 50

    print(json.dumps({
        "predicted_price": round(predicted_price, 2),
        "source": "pre_trained_model"
    }))

except Exception as e:
    print(json.dumps({"error": str(e), "predicted_price": 0}))
    sys.exit(1)
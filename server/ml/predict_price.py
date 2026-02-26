import sys
import json
import joblib
import pandas as pd
import warnings
import os
import traceback

warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

try:
    # Check if arguments are provided
    if len(sys.argv) < 3:
        raise ValueError(f"Insufficient arguments provided. Received {len(sys.argv)-1}, but need at least Name and Category.")

    name_input = sys.argv[1]
    category_input = sys.argv[2]
    
    # Safely parse numbers, defaulting if 'undefined' or missing is passed
    try:
        rating_input = float(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3] != 'undefined' else 4.0
    except ValueError:
        rating_input = 4.0
        
    try:
        count_input = int(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4] != 'undefined' else 100
    except ValueError:
        count_input = 100

    # Load the pre-trained model safely
    model_path = os.path.join(os.path.dirname(__file__), 'market_mind_model.pkl')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}. Run train_model.py first.")
    
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
    
    # Ensure minimum price logic
    if predicted_price < 50: 
        predicted_price = 50

    # Print success JSON
    print(json.dumps({
        "predicted_price": round(predicted_price, 2),
        "source": "pre_trained_model"
    }))

except Exception as e:
    error_msg = str(e)
    full_trace = traceback.format_exc()
    print(json.dumps({
        "predicted_price": 0,
        "error": error_msg,
        "traceback": full_trace
    }))
    sys.exit(1)
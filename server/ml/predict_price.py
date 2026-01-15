import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import make_column_transformer
from sklearn.pipeline import make_pipeline
import sys
import json
import os
import warnings
import numpy as np

# --- 1. SETUP ---
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

def get_dummy_data():
    return pd.DataFrame({
        'name': ['Gaming Laptop', 'Cheap Cable', '4K TV', 'USB Hub', 'Headphones'],
        'category': ['Electronics', 'Computers&Accessories', 'Electronics', 'Computers&Accessories', 'Electronics'],
        'price': [50000, 200, 30000, 500, 2000], 
        'rating': [4.5, 3.8, 4.8, 4.0, 3.5],
        'rating_count': [1000, 50, 200, 100, 50]
    })

# --- 2. LOAD DATA ---
df = None
using_dummy = False

try:
    csv_path = os.path.join(os.path.dirname(__file__), '../amazon.csv')
    
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        df.columns = df.columns.str.lower().str.strip()
        
        # Clean Price: Remove ₹ and commas
        if 'price' in df.columns:
            df['price'] = df['price'].astype(str).str.replace('₹', '', regex=False).str.replace(',', '', regex=False)
            df['price'] = pd.to_numeric(df['price'], errors='coerce') # Force to numbers
            
        df = df.dropna(subset=['price']) # Drop rows where price became NaN
        
        required_cols = ['name', 'category', 'price', 'rating', 'rating_count']
        missing_cols = [col for col in required_cols if col not in df.columns]
        
        if missing_cols or df.empty:
            using_dummy = True
            df = get_dummy_data()
            
    else:
        using_dummy = True
        df = get_dummy_data()

except Exception as e:
    using_dummy = True
    df = get_dummy_data()

if df is None or df.empty:
    df = get_dummy_data()

# --- 3. PREPARE DATA ---
try:
    # Feature Engineering
    df['brand'] = df['name'].apply(lambda x: str(x).split(' ')[0] if pd.notna(x) else 'Generic')
    
    # Standardize Categories (Merge similar ones to reduce confusion)
    df['category'] = df['category'].str.lower().str.replace(' ', '').str.replace('&', '')

    features = ['category', 'brand', 'rating', 'rating_count']
    target = 'price'

    for col in ['rating', 'rating_count']:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    df = df.dropna()
    
    X = df[features]
    y = df[target]

    # --- 4. TRAIN MODEL ---
    column_trans = make_column_transformer(
        (OneHotEncoder(handle_unknown='ignore'), ['category', 'brand']), 
        remainder='passthrough'
    )

    model = make_pipeline(column_trans, RandomForestRegressor(n_estimators=20, random_state=42))
    model.fit(X, y)

    # --- 5. PREDICT ---
    if len(sys.argv) < 5:
        print(json.dumps({"predicted_price": 0, "message": "Not enough inputs"}), flush=True)
        sys.exit(0)

    name_input = sys.argv[1]
    category_input = sys.argv[2]
    rating = float(sys.argv[3])
    rating_count = int(sys.argv[4])

    brand_input = name_input.split(' ')[0]
    
    # Preprocess input category exactly like training data
    clean_category = category_input.lower().replace(' ', '').replace('&', '')

    input_data = pd.DataFrame(
        [[clean_category, brand_input, rating, rating_count]], 
        columns=features
    )
    
    predicted_price = model.predict(input_data)[0]

    
    lower_name = name_input.lower()
    is_cheap_item = any(x in lower_name for x in ['cable', 'usb', 'case', 'cover', 'protector', 'mouse', 'adapter'])
    
    if is_cheap_item and predicted_price > 2000:
        predicted_price = min(predicted_price / 10, 999) 

    print(json.dumps({
        "predicted_price": round(predicted_price, 2),
        "debug_dummy": using_dummy
    }), flush=True)

except Exception as e:
    print(json.dumps({"error": f"Prediction Error: {str(e)}"}), flush=True)
    sys.exit(1)
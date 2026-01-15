import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import make_column_transformer
from sklearn.pipeline import make_pipeline
import sys
import json
import os
import warnings
import re

# --- 1. SETUP ---
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

def get_dummy_data():
    return pd.DataFrame({
        'name': ['Gaming Laptop', 'Budget Mouse', '4K Smart TV', 'USB Cable', 'Headphones', 'Flagship Phone', 'Office Chair'],
        'category': ['Electronics', 'Accessories', 'Electronics', 'Accessories', 'Accessories', 'Electronics', 'Furniture'],
        'price': [55000, 400, 32000, 250, 1500, 70000, 5000], 
        'rating': [4.5, 3.8, 4.6, 4.0, 4.1, 4.7, 4.2],
        'rating_count': [1200, 500, 300, 1500, 800, 2000, 100]
    })

# --- 2. LOAD & CLEAN DATA ---
df = None
data_source = "real"

try:
    csv_path = os.path.join(os.path.dirname(__file__), '../amazon.csv')
    
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        
        # 1. Normalize Headers (Handle 'Product Name', 'Name', 'name' etc.)
        df.columns = df.columns.str.lower().str.strip()
        
        # 2. Rename columns to standard names if they differ
        # Map whatever exists to 'name', 'price', 'category'
        col_map = {}
        for col in df.columns:
            if 'name' in col and 'name' not in col_map: col_map[col] = 'name'
            if 'price' in col and 'price' not in col_map: col_map[col] = 'price'
            if 'cat' in col and 'category' not in col_map: col_map[col] = 'category'
            if 'rating' in col and 'count' not in col and 'rating' not in col_map: col_map[col] = 'rating'
            if 'count' in col and 'rating_count' not in col_map: col_map[col] = 'rating_count'
            
        df = df.rename(columns=col_map)

        # 3. Clean Price (Robust Regex)
        # Keeps only digits and dots. "₹12,000.00" -> "12000.00"
        if 'price' in df.columns:
            df['price'] = df['price'].astype(str).apply(lambda x: re.sub(r'[^\d.]', '', x))
            df['price'] = pd.to_numeric(df['price'], errors='coerce')
        
        # 4. Clean Ratings
        for col in ['rating', 'rating_count']:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')

        # Drop rows with no price/name
        df = df.dropna(subset=['price', 'name'])
        
        # If cleaning killed all data, fallback
        if df.empty:
            raise ValueError("All data was cleaned away (bad formatting)")
            
    else:
        raise FileNotFoundError("amazon.csv not found")

except Exception as e:
    data_source = f"dummy_fallback_error_{str(e)}"
    df = get_dummy_data()

# --- 3. TRAIN MODEL ---
try:
    # Feature Engineering
    df['brand'] = df['name'].apply(lambda x: str(x).split(' ')[0] if pd.notna(x) else 'Generic')
    
    # Standardize Category
    if 'category' in df.columns:
        df['category'] = df['category'].fillna('Unknown').astype(str).str.lower().str.replace(r'[^a-z]', '', regex=True)
    else:
        df['category'] = 'unknown'

    features = ['category', 'brand', 'rating', 'rating_count']
    target = 'price'
    
    # Fill missing features with defaults instead of dropping (preserves more data)
    df['brand'] = df['brand'].fillna('Generic')
    df['rating'] = df['rating'].fillna(4.0)
    df['rating_count'] = df['rating_count'].fillna(100)

    X = df[features]
    y = df[target]

    column_trans = make_column_transformer(
        (OneHotEncoder(handle_unknown='ignore'), ['category', 'brand']), 
        remainder='passthrough'
    )

    # Increased n_estimators for better stability
    model = make_pipeline(column_trans, RandomForestRegressor(n_estimators=50, random_state=42))
    model.fit(X, y)

    # --- 4. PREDICT ---
    if len(sys.argv) < 5:
        print(json.dumps({"predicted_price": 0, "message": "Not enough inputs"}), flush=True)
        sys.exit(0)

    name_input = sys.argv[1]
    category_input = sys.argv[2]
    rating = float(sys.argv[3])
    rating_count = int(sys.argv[4])
    brand_input = name_input.split(' ')[0]
    
    clean_cat_input = re.sub(r'[^a-z]', '', category_input.lower())

    input_data = pd.DataFrame(
        [[clean_cat_input, brand_input, rating, rating_count]], 
        columns=features
    )
    
    predicted_price = model.predict(input_data)[0]

    if predicted_price < 0: predicted_price = 100

    print(json.dumps({
        "predicted_price": round(predicted_price, 2),
        "debug_source": data_source 
    }), flush=True)

except Exception as e:
    print(json.dumps({"error": f"Prediction Error: {str(e)}"}), flush=True)
    sys.exit(1)
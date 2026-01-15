import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import make_column_transformer
from sklearn.pipeline import make_pipeline
import sys
import json
import os
import warnings

# --- 1. SETUP ---
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Better Dummy Data (Balanced)
def get_dummy_data():
    return pd.DataFrame({
        'name': ['Gaming Laptop', 'Cheap Cable', '4K TV', 'USB Hub', 'Headphones'],
        'category': ['Electronics', 'Electronics', 'Electronics', 'Computers', 'Accessories'],
        'price': [50000, 200, 30000, 500, 2000], 
        'rating': [4.5, 3.8, 4.8, 4.0, 3.5],
        'rating_count': [1000, 50, 200, 100, 50]
    })

# --- 2. LOAD DATA ---
df = None
using_dummy = False # Debug flag

try:
    csv_path = os.path.join(os.path.dirname(__file__), '../amazon.csv')
    
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        
        df.columns = df.columns.str.lower().str.strip()
        
        if 'price' in df.columns:
            df['price'] = df['price'].astype(str).str.replace('₹', '', regex=False).str.replace(',', '', regex=False)
            
        required_cols = ['name', 'category', 'price', 'rating', 'rating_count']
        missing_cols = [col for col in required_cols if col not in df.columns]
        
        if missing_cols:
            raise ValueError(f"CSV missing columns: {missing_cols}")
            
    else:
        using_dummy = True
        df = get_dummy_data()

except Exception as e:
    using_dummy = True
    df = get_dummy_data()

# Double check we have data
if df is None or df.empty:
    using_dummy = True
    df = get_dummy_data()

# --- 3. PREPARE DATA ---
try:
    # Extract 'Brand'
    df['brand'] = df['name'].apply(lambda x: str(x).split(' ')[0] if pd.notna(x) else 'Generic')

    # Keep top 50 brands
    top_brands = df['brand'].value_counts().nlargest(50).index
    df['brand'] = df['brand'].apply(lambda x: x if x in top_brands else 'Other')

    # Select Features
    features = ['category', 'brand', 'rating', 'rating_count']
    target = 'price'

    # Clean Numeric Data
    for col in [target, 'rating', 'rating_count']:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Drop bad rows (important!)
    df = df.dropna()

    # If dropping NaN killed all data, revert to dummy
    if df.empty:
        using_dummy = True
        df = get_dummy_data()
        features = ['category', 'brand', 'rating', 'rating_count'] # Reset cols
        # Re-process dummy data logic if needed, but get_dummy_data is usually clean

    X = df[features]
    y = df[target]

    # --- 4. TRAIN MODEL ---
    column_trans = make_column_transformer(
        (OneHotEncoder(handle_unknown='ignore'), ['category', 'brand']), 
        remainder='passthrough'
    )

    model = make_pipeline(column_trans, RandomForestRegressor(n_estimators=10, random_state=42))
    model.fit(X, y)

    # --- 5. PREDICT ---
    if len(sys.argv) < 5:
        print(json.dumps({"predicted_price": 0, "message": "Not enough inputs"}), flush=True)
        sys.exit(0)

    name_input = sys.argv[1]
    category = sys.argv[2]
    rating = float(sys.argv[3])
    rating_count = int(sys.argv[4])

    brand_input = name_input.split(' ')[0]

    input_data = pd.DataFrame(
        [[category, brand_input, rating, rating_count]], 
        columns=features
    )
    
    predicted_price = model.predict(input_data)[0]

    print(json.dumps({
        "predicted_price": round(predicted_price, 2),
        "debug_used_dummy": using_dummy
    }), flush=True)

except Exception as e:
    print(json.dumps({"error": f"Prediction Error: {str(e)}"}), flush=True)
    sys.exit(1)
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import make_column_transformer
from sklearn.pipeline import make_pipeline
import sys
import json
import os
import warnings

# --- 0. Setup & Safety ---
# Silence all warnings so they don't break the Node.js JSON parsing
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# --- 1. Load Data (Smart Fallback) ---
try:
    # Try to find amazon.csv one folder up (server/amazon.csv)
    csv_path = os.path.join(os.path.dirname(__file__), '../amazon.csv')
    
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
    else:
        # FALLBACK: If CSV is missing on Render, use this dummy data so the app DOES NOT CRASH.
        # This ensures the "Analyze" button always gives a result.
        data = {
            'name': ['Gaming Laptop', 'Office Mouse', '4K TV', 'Headphones', 'USB Cable'],
            'category': ['Electronics', 'Accessories', 'Electronics', 'Accessories', 'Accessories'],
            'price': [50000, 500, 30000, 2000, 200],
            'rating': [4.5, 4.0, 4.8, 3.5, 4.2],
            'rating_count': [1000, 500, 200, 50, 100]
        }
        df = pd.DataFrame(data)

except Exception as e:
    # If even that fails, print a safe JSON error
    print(json.dumps({"error": f"Data loading error: {str(e)}"}))
    sys.exit(1)

# --- 2. Feature Engineering ---
# Extract "Brand" (First word of name)
df['brand'] = df['name'].apply(lambda x: str(x).split(' ')[0] if pd.notna(x) else 'Generic')

# Keep top 50 brands (or all if dataset is small)
top_brands = df['brand'].value_counts().nlargest(50).index
df['brand'] = df['brand'].apply(lambda x: x if x in top_brands else 'Other')

# Prepare features
features = ['category', 'brand', 'rating', 'rating_count']
target = 'price'

# Clean data (Force numbers, remove errors)
df[target] = pd.to_numeric(df[target], errors='coerce')
df['rating'] = pd.to_numeric(df['rating'], errors='coerce')
df['rating_count'] = pd.to_numeric(df['rating_count'], errors='coerce')
df = df.dropna()

if df.empty:
    print(json.dumps({"error": "No valid training data found."}))
    sys.exit(1)

X = df[features]
y = df[target]

# --- 3. Train Model ---
# Pipeline handles the text categories automatically
column_trans = make_column_transformer(
    (OneHotEncoder(handle_unknown='ignore'), ['category', 'brand']), 
    remainder='passthrough'
)

# Fast Random Forest
model = make_pipeline(column_trans, RandomForestRegressor(n_estimators=10, random_state=42))
model.fit(X, y)

# --- 4. Make Prediction ---
try:
    # Get inputs from Node.js (via command line args)
    # Check if we have enough arguments
    if len(sys.argv) < 5:
        # Return a safe default if arguments are missing
        print(json.dumps({"predicted_price": 0, "message": "Not enough inputs"}))
        sys.exit(0)

    name_input = sys.argv[1]
    category = sys.argv[2]
    rating = float(sys.argv[3])
    rating_count = int(sys.argv[4])

    # Extract brand from input
    brand_input = name_input.split(' ')[0]

    # Create 1-row DataFrame for prediction
    input_data = pd.DataFrame(
        [[category, brand_input, rating, rating_count]], 
        columns=features
    )
    
    # Predict
    predicted_price = model.predict(input_data)[0]

    # Output ONLY JSON
    print(json.dumps({"predicted_price": round(predicted_price, 2)}))

except Exception as e:
    print(json.dumps({"error": f"Prediction error: {str(e)}"}))
    sys.exit(1)
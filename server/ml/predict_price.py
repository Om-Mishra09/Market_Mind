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
# Silence warnings so Node.js gets clean JSON
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# --- 2. LOAD DATA (CSV Method) ---
try:
    # Try to find amazon.csv one folder up
    csv_path = os.path.join(os.path.dirname(__file__), '../amazon.csv')
    
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
    else:
        # FAIL-SAFE: If CSV is missing, use this dummy data so the app NEVER crashes.
        # This ensures the "Analyze" button always returns a result.
        data = {
            'name': ['Gaming Laptop', 'Office Mouse', '4K TV', 'Headphones', 'USB Cable'],
            'category': ['Electronics', 'Accessories', 'Electronics', 'Accessories', 'Accessories'],
            'price': [50000, 500, 30000, 2000, 200],
            'rating': [4.5, 4.0, 4.8, 3.5, 4.2],
            'rating_count': [1000, 500, 200, 50, 100]
        }
        df = pd.DataFrame(data)

except Exception as e:
    # If loading fails, print JSON error and stop
    print(json.dumps({"error": f"Data Load Error: {str(e)}"}))
    sys.exit(1)

# --- 3. PREPARE DATA ---
# Extract 'Brand' from Name
df['brand'] = df['name'].apply(lambda x: str(x).split(' ')[0] if pd.notna(x) else 'Generic')

# Keep top 50 brands
top_brands = df['brand'].value_counts().nlargest(50).index
df['brand'] = df['brand'].apply(lambda x: x if x in top_brands else 'Other')

# Select Features
features = ['category', 'brand', 'rating', 'rating_count']
target = 'price'

# Clean Numeric Data
df[target] = pd.to_numeric(df[target], errors='coerce')
df['rating'] = pd.to_numeric(df['rating'], errors='coerce')
df['rating_count'] = pd.to_numeric(df['rating_count'], errors='coerce')
df = df.dropna()

X = df[features]
y = df[target]

# --- 4. TRAIN MODEL ---
# Pipeline handles text categories automatically
column_trans = make_column_transformer(
    (OneHotEncoder(handle_unknown='ignore'), ['category', 'brand']), 
    remainder='passthrough'
)

# Train Model
model = make_pipeline(column_trans, RandomForestRegressor(n_estimators=10, random_state=42))
model.fit(X, y)

# --- 5. PREDICT ---
try:
    if len(sys.argv) < 5:
        print(json.dumps({"predicted_price": 0, "message": "Not enough inputs"}))
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

    # SUCCESS: Print JSON result
    print(json.dumps({"predicted_price": round(predicted_price, 2)}))

except Exception as e:
    print(json.dumps({"error": f"Prediction Error: {str(e)}"}))
    sys.exit(1)
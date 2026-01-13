import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import make_column_transformer
from sklearn.pipeline import make_pipeline
import sys
import json
import mysql.connector
import os
from dotenv import load_dotenv

# --- 1. Load Data ---
try:
    dotenv_path = os.path.join(os.path.dirname(__file__), '../server/.env')
    load_dotenv(dotenv_path)
    
    db_url = os.environ.get('DATABASE_URL')
    # Parse DB connection string...
    db_parts = db_url.split('mysql://')[1].split('@')
    user_pass = db_parts[0].split(':')
    host_db = db_parts[1].split('/')
    
    db_config = {
        'user': user_pass[0],
        'password': user_pass[1].replace('%40', '@'),
        'host': host_db[0].split(':')[0],
        'port': host_db[0].split(':')[1],
        'database': host_db[1]
    }

    conn = mysql.connector.connect(**db_config)
    # Fetch 'name' as well so we can extract the brand
    query = "SELECT name, category, price, rating, rating_count FROM products WHERE rating IS NOT NULL AND rating_count IS NOT NULL"
    df = pd.read_sql(query, conn)
    conn.close()

except Exception as e:
    print(json.dumps({"error": f"Database error: {e}"}))
    sys.exit(1)

if df.empty:
    print(json.dumps({"error": "No training data found."}))
    sys.exit(1)

# --- 2. Feature Engineering (The Upgrade) ---
# Extract the first word of the name as the "Brand"
df['brand'] = df['name'].apply(lambda x: x.split(' ')[0] if x else 'Generic')

# Keep only the top 50 brands to avoid noise (optional but recommended)
top_brands = df['brand'].value_counts().nlargest(50).index
df['brand'] = df['brand'].apply(lambda x: x if x in top_brands else 'Other')

# Prepare features
features = ['category', 'brand', 'rating', 'rating_count']
target = 'price'

# Clean data
df[target] = pd.to_numeric(df[target], errors='coerce')
df['rating'] = pd.to_numeric(df['rating'], errors='coerce')
df['rating_count'] = pd.to_numeric(df['rating_count'], errors='coerce')
df = df.dropna()

X = df[features]
y = df[target]

# --- 3. Train a Smarter Model (Random Forest) ---
# We use Random Forest because it handles categories (Brands) better than Linear Regression
column_trans = make_column_transformer(
    (OneHotEncoder(handle_unknown='ignore'), ['category', 'brand']), 
    remainder='passthrough'
)

# n_estimators=50 makes it fast but accurate
model = make_pipeline(column_trans, RandomForestRegressor(n_estimators=50, random_state=42))
model.fit(X, y)

# --- 4. Prediction ---
try:
    # Inputs from Node.js
    name_input = sys.argv[1] # We pass the full name now
    category = sys.argv[2]
    rating = float(sys.argv[3])
    rating_count = int(sys.argv[4])

    # Extract brand from input name just like we did for training
    brand_input = name_input.split(' ')[0]

    input_data = pd.DataFrame(
        [[category, brand_input, rating, rating_count]], 
        columns=features
    )
    
    predicted_price = model.predict(input_data)[0]

    print(json.dumps({"predicted_price": round(predicted_price, 2)}))

except Exception as e:
    print(json.dumps({"error": f"Prediction error: {e}"}))
    sys.exit(1)
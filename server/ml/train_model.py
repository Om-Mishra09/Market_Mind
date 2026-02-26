import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import make_column_transformer
from sklearn.pipeline import make_pipeline
import joblib
import os
import re

print("Loading and cleaning data...")
csv_path = os.path.join(os.path.dirname(__file__), '../amazon.csv')

# Load and clean
df = pd.read_csv(csv_path)
df.columns = df.columns.str.lower().str.strip()

col_map = {}
for col in df.columns:
    if 'name' in col and 'name' not in col_map: col_map[col] = 'name'
    if 'price' in col and 'price' not in col_map: col_map[col] = 'price'
    if 'cat' in col and 'category' not in col_map: col_map[col] = 'category'
    if 'rating' in col and 'count' not in col and 'rating' not in col_map: col_map[col] = 'rating'
    if 'count' in col and 'rating_count' not in col_map: col_map[col] = 'rating_count'
    
df = df.rename(columns=col_map)
df = df.loc[:, ~df.columns.duplicated()]

df['price'] = df['price'].astype(str).apply(lambda x: re.sub(r'[^\d.]', '', x))
df['price'] = pd.to_numeric(df['price'], errors='coerce')
df = df.dropna(subset=['price', 'name'])

# Ensure required columns
for col in ['name', 'category', 'rating', 'rating_count']:
    if col not in df.columns:
        df[col] = 4.0 if col == 'rating' else (100 if col == 'rating_count' else 'unknown')

df['name'] = df['name'].astype(str).fillna('')
df['category'] = df['category'].astype(str).fillna('general')
df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(4.0)
df['rating_count'] = pd.to_numeric(df['rating_count'], errors='coerce').fillna(0)

X = df[['name', 'category', 'rating', 'rating_count']]
y = df['price']

print("Training model...")
vectorizer = TfidfVectorizer(stop_words='english', max_features=500)
column_trans = make_column_transformer(
    (vectorizer, 'name'),
    (OneHotEncoder(handle_unknown='ignore'), ['category']),
    remainder='passthrough'
)

model = make_pipeline(column_trans, RandomForestRegressor(n_estimators=50, random_state=42))
model.fit(X, y)

# Save the trained model to a file
joblib.dump(model, 'market_mind_model.pkl')
print("Model trained and saved successfully as 'market_mind_model.pkl'!")
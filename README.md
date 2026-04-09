# Market Mind

Market Mind is a full-stack, AI-powered product analysis platform designed to help users make smarter purchasing decisions in the tech market. It leverages machine learning to predict fair product prices, identify overpriced deals, and generate optimized configurations based on budget constraints.

---

## Overview

Market Mind combines modern web technologies with machine learning to solve a common problem: users often overpay due to lack of pricing insight. This platform provides real-time analysis and intelligent recommendations to ensure value-driven decisions.

---

## Features

### AI Price Analysis

Analyzes product data to estimate the true "fair price" and provides a verdict such as "Great Deal" or "Overpriced".

### Smart Budget Builder

A resource allocation system that takes a user's budget and requirements (e.g., gaming PC, workstation) and generates the most optimal configuration using a curated dataset of over 1,400 products.

### Watchlist Management

Secure user authentication using JWT allows users to save and track products in a personalized watchlist.

### Resilient System Architecture

Node.js backend communicates with a Python-based ML engine using child processes, ensuring modular and scalable design.

---

## Tech Stack

### Frontend

•⁠  ⁠Framework: React.js (Vite)
•⁠  ⁠Styling: Tailwind CSS / Chakra UI
•⁠  ⁠API Communication: Axios
•⁠  ⁠Deployment: Vercel

### Backend

•⁠  ⁠Environment: Node.js with Express.js
•⁠  ⁠Authentication: JSON Web Tokens (JWT)
•⁠  ⁠Database: SQL
•⁠  ⁠Deployment: Render

### Machine Learning

•⁠  ⁠Language: Python 3
•⁠  ⁠Libraries: Pandas, NumPy, Scikit-learn
•⁠  ⁠Model: Random Forest Regressor (n_estimators = 100)
•⁠  ⁠Feature Engineering:

  * TF-IDF Vectorizer (product name analysis)
  * One-Hot Encoding (categorical features)

---

## System Architecture

### Flow

1.⁠ ⁠Client Request
   The user interacts with the React frontend to analyze a product.

2.⁠ ⁠Backend Processing
   The Node.js server validates input and prepares the request.

3.⁠ ⁠Python Execution
   The backend uses ⁠ child_process.spawn() ⁠ to execute the Python ML script.

4.⁠ ⁠Data Processing
   The Python script:

   * Loads dataset (⁠ amazon.csv ⁠)
   * Applies TF-IDF and encoding
   * Predicts price using the trained model

5.⁠ ⁠Response Handling
   The predicted price is returned as JSON and displayed on the frontend.


---

## Machine Learning Approach

Market Mind addresses limitations in traditional e-commerce datasets by focusing on semantic understanding of product names.

### Key Insight

Instead of relying only on structured fields like brand or category, the system uses TF-IDF vectorization to extract meaning from product titles.

This allows the model to:

•⁠  ⁠Recognize value-indicating keywords like "Pro", "Ultra", "Gaming"
•⁠  ⁠Generalize across unseen brands
•⁠  ⁠Improve prediction accuracy even with sparse data

---

## Author

Om Mishra
Full-Stack Developer

GitHub: [https://github.com/yourusername](https://github.com/yourusername)

---

"""
Crop Recommendation Model Training Pipeline
KRISHI AI – Intelligent Agriculture Assistant

Trains and compares multiple classification models:
1. Random Forest Classifier
2. Gradient Boosting Classifier
3. Decision Tree Classifier
4. Gaussian Naive Bayes
5. Support Vector Machine (SVC)
6. K-Nearest Neighbors (KNN)

Evaluates accuracy, precision, recall, and F1-score.
Saves the best-performing model with joblib.
"""
import os
import sys
import json

# Ensure UTF-8 output on Windows terminal
sys.stdout.reconfigure(encoding='utf-8')

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

def main():
    print("=" * 70)
    print("🌾 KRISHI AI – CROP RECOMMENDATION TRAINING PIPELINE")
    print("=" * 70)

    data_path = os.path.join(os.path.dirname(__file__), "Crop_recommendation.csv")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    # 1. Load and Analyze Dataset
    print(f"\n[1/7] Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"Dataset Shape: {df.shape[0]} samples, {df.shape[1]} columns")

    # 2. Check for missing values & basic statistics
    print("\n[2/7] Checking data integrity & missing values:")
    missing = df.isnull().sum().to_dict()
    print("Missing values per column:", missing)
    if df.isnull().sum().sum() > 0:
        print("Handling missing values (forward fill / median imputation)...")
        df = df.fillna(df.median(numeric_only=True))

    features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    target = 'label'
    
    print("\nFeature Statistics Summary:")
    print(df[features].describe().round(2).to_string())

    num_classes = df[target].nunique()
    classes = sorted(df[target].unique().tolist())
    print(f"\nTarget Classes ({num_classes} crops): {', '.join(classes)}")

    # 3. Train-Test Split (80% Train, 20% Test, Stratified)
    X = df[features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"\n[3/7] Stratified Split: {X_train.shape[0]} training samples, {X_test.shape[0]} test samples.")

    # 4. Define Candidate Models
    models = {
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=12, random_state=42),
        "Gaussian Naive Bayes": GaussianNB(),
        "Support Vector Machine": Pipeline([('scaler', StandardScaler()), ('svm', SVC(probability=True, random_state=42))]),
        "K-Nearest Neighbors": Pipeline([('scaler', StandardScaler()), ('knn', KNeighborsClassifier(n_neighbors=5))]),
    }

    # 5. Train & Evaluate Multiple Models
    print("\n[4/7] Training and comparing candidate classification models...")
    comparison_results = []
    trained_models = {}

    for name, model in models.items():
        print(f" -> Training {name}...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

        # 5-fold cross validation score on training set
        cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
        cv_mean = cv_scores.mean()

        comparison_results.append({
            "model_name": name,
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "cv_5fold_accuracy": round(float(cv_mean), 4),
        })
        trained_models[name] = model

    comp_df = pd.DataFrame(comparison_results).sort_values(by="accuracy", ascending=False)
    print("\n[5/7] Model Performance Comparison:")
    print(comp_df.to_string(index=False))

    # 6. Select Best Performing Model
    best_row = comp_df.iloc[0]
    best_name = best_row["model_name"]
    best_model = trained_models[best_name]
    print(f"\n🏆 Best Selected Model: {best_name} with Accuracy = {best_row['accuracy']*100:.2f}% and F1-Score = {best_row['f1_score']:.4f}")

    y_best_pred = best_model.predict(X_test)
    print("\nDetailed Classification Report for Best Model:")
    print(classification_report(y_test, y_best_pred, digits=4, zero_division=0))

    # 7. Save Model Artifact & Metadata
    output_dir = os.path.dirname(__file__)
    model_file = os.path.join(output_dir, "crop_model.joblib")
    meta_file = os.path.join(output_dir, "model_metadata.json")

    artifact = {
        "model": best_model,
        "model_name": best_name,
        "features": features,
        "classes": best_model.classes_.tolist() if hasattr(best_model, "classes_") else classes,
        "metrics": {
            "accuracy": best_row["accuracy"],
            "precision": best_row["precision"],
            "recall": best_row["recall"],
            "f1_score": best_row["f1_score"],
            "cv_accuracy": best_row["cv_5fold_accuracy"]
        }
    }

    joblib.dump(artifact, model_file)
    print(f"\n[6/7] Saved trained model artifact to: {model_file}")

    metadata = {
        "model_name": best_name,
        "features": features,
        "num_classes": num_classes,
        "classes": classes,
        "all_models_compared": comparison_results,
        "best_metrics": artifact["metrics"],
        "dataset_size": len(df),
    }

    with open(meta_file, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"[7/7] Saved model evaluation metrics to: {meta_file}")
    print("\n✅ Crop Recommendation Model Training Pipeline Complete!\n")

if __name__ == "__main__":
    main()

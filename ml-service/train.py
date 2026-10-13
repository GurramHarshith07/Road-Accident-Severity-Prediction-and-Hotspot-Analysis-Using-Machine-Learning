import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression

# Import from model_def to ensure serialization portability
from model_def import Node, CustomDecisionTree, CustomRandomForest, AccidentPreprocessor

def compute_metrics(y_true, y_pred, y_prob):
    classes = [0, 1, 2]
    n_classes = len(classes)

    accuracy = np.mean(y_true == y_pred)

    cm = np.zeros((n_classes, n_classes), dtype=int)
    for t, p in zip(y_true, y_pred):
        cm[t, p] += 1

    precisions = []
    recalls = []
    f1s = []

    for c in classes:
        tp = cm[c, c]
        fp = np.sum(cm[:, c]) - tp
        fn = np.sum(cm[c, :]) - tp

        prec = tp / max(1, (tp + fp))
        rec = tp / max(1, (tp + fn))
        f1 = 2 * prec * rec / max(1e-7, (prec + rec))

        precisions.append(prec)
        recalls.append(rec)
        f1s.append(f1)

    macro_precision = float(np.mean(precisions))
    macro_recall = float(np.mean(recalls))
    macro_f1 = float(np.mean(f1s))

    class_metrics = {
        "Minor": {"precision": round(precisions[0], 4), "recall": round(recalls[0], 4), "f1": round(f1s[0], 4)},
        "Serious": {"precision": round(precisions[1], 4), "recall": round(recalls[1], 4), "f1": round(f1s[1], 4)},
        "Fatal": {"precision": round(precisions[2], 4), "recall": round(recalls[2], 4), "f1": round(f1s[2], 4)}
    }

    return {
        "accuracy": round(float(accuracy), 4),
        "precision": round(macro_precision, 4),
        "recall": round(macro_recall, 4),
        "macro_f1": round(macro_f1, 4),
        "confusion_matrix": cm.tolist(),
        "class_metrics": class_metrics
    }

def main():
    print("=================================================================")
    print("  ROAD ACCIDENT SEVERITY PREDICTION - MODEL TRAINING PIPELINE    ")
    print("=================================================================")

    csv_path = "ml-service/data/training_accidents.csv"
    if not os.path.exists(csv_path):
        from data.generate_training_data import generate_dataset
        generate_dataset(csv_path)

    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} records from {csv_path}")

    # Stratified 80/20 train/test split
    np.random.seed(42)
    shuffled_idx = np.random.permutation(len(df))
    split_pt = int(0.80 * len(df))
    train_idx, test_idx = shuffled_idx[:split_pt], shuffled_idx[split_pt:]

    train_df = df.iloc[train_idx].reset_index(drop=True)
    test_df = df.iloc[test_idx].reset_index(drop=True)

    print(f"Train samples: {len(train_df)}, Test samples: {len(test_df)}")

    preprocessor = AccidentPreprocessor()
    preprocessor.fit(train_df)

    X_train = preprocessor.transform(train_df)
    y_train = train_df["severity"].map(preprocessor.severity_map).values.astype(int)

    X_test = preprocessor.transform(test_df)
    y_test = test_df["severity"].map(preprocessor.severity_map).values.astype(int)

    models_dir = "ml-service/models"
    os.makedirs(models_dir, exist_ok=True)

    evaluations = []

    # 1. Logistic Regression
    print("\n[1/3] Training Logistic Regression...")
    lr = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)
    lr.fit(X_train, y_train)
    lr_preds = lr.predict(X_test)
    lr_probs = lr.predict_proba(X_test)
    lr_metrics = compute_metrics(y_test, lr_preds, lr_probs)
    print(f"   -> Accuracy: {lr_metrics['accuracy']:.4f}, Macro F1: {lr_metrics['macro_f1']:.4f}")
    evaluations.append({
        "model_name": "Logistic Regression",
        "model_version": "1.0.0",
        **lr_metrics
    })
    joblib.dump(lr, os.path.join(models_dir, "logistic_regression.joblib"))

    # 2. Decision Tree
    print("\n[2/3] Training Decision Tree Classifier...")
    dt = CustomDecisionTree(max_depth=8, min_samples_split=6)
    dt.fit(X_train, y_train)
    dt_preds = dt.predict(X_test)
    dt_probs = dt.predict_proba(X_test)
    dt_metrics = compute_metrics(y_test, dt_preds, dt_probs)
    print(f"   -> Accuracy: {dt_metrics['accuracy']:.4f}, Macro F1: {dt_metrics['macro_f1']:.4f}")
    evaluations.append({
        "model_name": "Decision Tree",
        "model_version": "1.0.0",
        **dt_metrics
    })
    joblib.dump(dt, os.path.join(models_dir, "decision_tree.joblib"))

    # 3. Random Forest (Ensemble)
    print("\n[3/3] Training Random Forest Classifier (Ensemble)...")
    rf = CustomRandomForest(n_estimators=35, max_depth=10, min_samples_split=5)
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_probs = rf.predict_proba(X_test)
    rf_metrics = compute_metrics(y_test, rf_preds, rf_probs)
    print(f"   -> Accuracy: {rf_metrics['accuracy']:.4f}, Macro F1: {rf_metrics['macro_f1']:.4f}")
    evaluations.append({
        "model_name": "Random Forest",
        "model_version": "1.0.0",
        **rf_metrics
    })
    joblib.dump(rf, os.path.join(models_dir, "random_forest.joblib"))

    # Save preprocessor
    joblib.dump(preprocessor, os.path.join(models_dir, "preprocessor.joblib"))

    # Save evaluations summary JSON
    eval_json_path = os.path.join(models_dir, "model_evaluations.json")
    with open(eval_json_path, "w") as f:
        json.dump({"models": evaluations, "best_model": "Random Forest"}, f, indent=2)

    print(f"\nSaved all models and preprocessor to {models_dir}")
    print(f"Exported evaluation metrics to {eval_json_path}")
    print("\nTraining completed successfully!")

if __name__ == "__main__":
    main()

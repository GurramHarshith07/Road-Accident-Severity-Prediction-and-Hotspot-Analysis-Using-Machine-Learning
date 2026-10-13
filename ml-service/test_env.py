import os
import sys

print("Python version:", sys.version, flush=True)

for mod in ['numpy', 'pandas', 'joblib', 'fastapi', 'uvicorn', 'scipy']:
    try:
        m = __import__(mod)
        print(f"Loaded {mod}: {getattr(m, '__version__', 'ok')}", flush=True)
    except Exception as e:
        print(f"Error loading {mod}: {e}", flush=True)

try:
    from sklearn.linear_model import LogisticRegression
    print("Loaded LogisticRegression: ok", flush=True)
except Exception as e:
    print(f"Error loading LogisticRegression: {e}", flush=True)

try:
    from sklearn.tree import DecisionTreeClassifier
    print("Loaded DecisionTreeClassifier: ok", flush=True)
except Exception as e:
    print(f"Error loading DecisionTreeClassifier: {e}", flush=True)

try:
    from sklearn.ensemble import RandomForestClassifier
    print("Loaded RandomForestClassifier: ok", flush=True)
except Exception as e:
    print(f"Error loading RandomForestClassifier: {e}", flush=True)

print("Test complete.", flush=True)

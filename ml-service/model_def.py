import numpy as np
import pandas as pd

class Node:
    def __init__(self, feature=None, threshold=None, left=None, right=None, *, value=None, probs=None):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value
        self.probs = probs

    @property
    def is_leaf(self):
        return self.value is not None

class CustomDecisionTree:
    def __init__(self, max_depth=10, min_samples_split=6, max_features=None):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.root = None
        self.n_classes_ = 3
        self.classes_ = np.array([0, 1, 2])

    def fit(self, X, y):
        X = np.asarray(X, dtype=np.float32)
        y = np.asarray(y, dtype=np.int64)
        n_features = X.shape[1]
        if self.max_features is None:
            self.max_features_ = n_features
        elif self.max_features == 'sqrt':
            self.max_features_ = max(1, int(np.sqrt(n_features)))
        else:
            self.max_features_ = n_features
        self.root = self._grow_tree(X, y, depth=0)
        return self

    def _grow_tree(self, X, y, depth):
        n_samples, n_features = X.shape
        counts = np.bincount(y, minlength=self.n_classes_)
        probs = counts / max(1, n_samples)
        pred_class = int(np.argmax(counts))

        if depth >= self.max_depth or n_samples < self.min_samples_split or len(np.unique(y)) == 1:
            return Node(value=pred_class, probs=probs)

        feat_idxs = np.random.choice(n_features, self.max_features_, replace=False)
        best_feat, best_thresh = self._best_split(X, y, feat_idxs)
        if best_feat is None:
            return Node(value=pred_class, probs=probs)

        left_mask = X[:, best_feat] <= best_thresh
        right_mask = ~left_mask

        if np.sum(left_mask) == 0 or np.sum(right_mask) == 0:
            return Node(value=pred_class, probs=probs)

        left_node = self._grow_tree(X[left_mask], y[left_mask], depth + 1)
        right_node = self._grow_tree(X[right_mask], y[right_mask], depth + 1)
        return Node(feature=best_feat, threshold=best_thresh, left=left_node, right=right_node, probs=probs)

    def _best_split(self, X, y, feat_idxs):
        best_gini_gain = -1.0
        split_idx, split_thresh = None, None
        parent_gini = self._gini(y)

        for feat in feat_idxs:
            vals = np.unique(X[:, feat])
            if len(vals) > 10:
                thresholds = np.percentile(vals, np.linspace(10, 90, 8))
            else:
                thresholds = (vals[:-1] + vals[1:]) / 2.0

            for thresh in thresholds:
                mask = X[:, feat] <= thresh
                n_l, n_r = np.sum(mask), len(y) - np.sum(mask)
                if n_l == 0 or n_r == 0:
                    continue
                gini_gain = parent_gini - (n_l / len(y)) * self._gini(y[mask]) - (n_r / len(y)) * self._gini(y[~mask])
                if gini_gain > best_gini_gain:
                    best_gini_gain = gini_gain
                    split_idx = feat
                    split_thresh = thresh

        return split_idx, split_thresh

    def _gini(self, y):
        if len(y) == 0:
            return 0.0
        counts = np.bincount(y, minlength=self.n_classes_)
        p = counts / len(y)
        return 1.0 - np.sum(p ** 2)

    def predict(self, X):
        X = np.asarray(X, dtype=np.float32)
        return np.array([self._traverse(x, self.root).value for x in X])

    def predict_proba(self, X):
        X = np.asarray(X, dtype=np.float32)
        return np.array([self._traverse(x, self.root).probs for x in X])

    def _traverse(self, x, node):
        if node.is_leaf:
            return node
        if x[node.feature] <= node.threshold:
            return self._traverse(x, node.left)
        return self._traverse(x, node.right)

class CustomRandomForest:
    def __init__(self, n_estimators=30, max_depth=10, min_samples_split=5, max_features='sqrt'):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.trees = []
        self.classes_ = np.array([0, 1, 2])
        self.n_classes_ = 3

    def fit(self, X, y):
        X = np.asarray(X, dtype=np.float32)
        y = np.asarray(y, dtype=np.int64)
        n_samples = X.shape[0]

        self.trees = []
        for _ in range(self.n_estimators):
            boot_idx = np.random.choice(n_samples, n_samples, replace=True)
            tree = CustomDecisionTree(
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split,
                max_features=self.max_features
            )
            tree.fit(X[boot_idx], y[boot_idx])
            self.trees.append(tree)
        return self

    def predict_proba(self, X):
        all_probs = np.array([tree.predict_proba(X) for tree in self.trees])
        return np.mean(all_probs, axis=0)

    def predict(self, X):
        probs = self.predict_proba(X)
        return np.argmax(probs, axis=1)

class AccidentPreprocessor:
    def __init__(self):
        self.numeric_features = ["hour", "vehicle_count", "speed_limit"]
        self.categorical_features = [
            "day_of_week", "road_type", "weather_condition",
            "lighting_condition", "road_surface_condition", "area_type"
        ]
        self.categories_ = {}
        self.means_ = {}
        self.stds_ = {}
        self.feature_names_ = []
        self.severity_map = {"Minor": 0, "Serious": 1, "Fatal": 2}
        self.reverse_severity_map = {0: "Minor", 1: "Serious", 2: "Fatal"}

    def fit(self, df):
        for col in self.numeric_features:
            self.means_[col] = float(df[col].mean())
            std = float(df[col].std())
            self.stds_[col] = std if std > 0 else 1.0

        for col in self.categorical_features:
            self.categories_[col] = sorted(df[col].unique().tolist())

        names = list(self.numeric_features)
        for col in self.categorical_features:
            for cat in self.categories_[col]:
                names.append(f"{col}_{cat}")
        self.feature_names_ = names
        return self

    def transform(self, df):
        n_samples = len(df)
        X = np.zeros((n_samples, len(self.feature_names_)), dtype=np.float32)

        for i, col in enumerate(self.numeric_features):
            vals = df[col].astype(float).values
            X[:, i] = (vals - self.means_[col]) / self.stds_[col]

        offset = len(self.numeric_features)
        for col in self.categorical_features:
            col_vals = df[col].astype(str).values
            for cat in self.categories_[col]:
                X[:, offset] = (col_vals == cat).astype(np.float32)
                offset += 1

        return X

    def transform_single(self, row_dict):
        df = pd.DataFrame([row_dict])
        return self.transform(df)

import numpy as np
import joblib

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
    def __init__(self, max_depth=10, min_samples_split=5, max_features=None):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.root = None
        self.n_classes_ = None
        self.classes_ = None

    def fit(self, X, y):
        X = np.asarray(X, dtype=np.float32)
        y = np.asarray(y, dtype=np.int64)
        self.classes_ = np.unique(y)
        self.n_classes_ = len(self.classes_)
        n_features = X.shape[1]
        if self.max_features is None:
            self.max_features_ = n_features
        elif isinstance(self.max_features, (int, np.integer)):
            self.max_features_ = min(self.max_features, n_features)
        elif self.max_features == 'sqrt':
            self.max_features_ = int(np.sqrt(n_features))
        else:
            self.max_features_ = n_features
        self.root = self._grow_tree(X, y, depth=0)
        return self

    def _grow_tree(self, X, y, depth):
        n_samples, n_features = X.shape
        counts = np.bincount(y, minlength=self.n_classes_)
        probs = counts / max(1, n_samples)
        pred_class = np.argmax(counts)

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
    def __init__(self, n_estimators=25, max_depth=10, min_samples_split=5, max_features='sqrt'):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.trees = []
        self.classes_ = None
        self.n_classes_ = None

    def fit(self, X, y):
        X = np.asarray(X, dtype=np.float32)
        y = np.asarray(y, dtype=np.int64)
        self.classes_ = np.unique(y)
        self.n_classes_ = len(self.classes_)
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

# Verification
X_sample = np.random.randn(100, 5)
y_sample = np.random.choice([0, 1, 2], size=100)
rf = CustomRandomForest(n_estimators=5, max_depth=4)
rf.fit(X_sample, y_sample)
preds = rf.predict(X_sample[:5])
probs = rf.predict_proba(X_sample[:5])
print("Custom Random Forest predictions:", preds)
print("Custom Random Forest probabilities shape:", probs.shape)
joblib.dump(rf, "test_rf.joblib")
loaded_rf = joblib.load("test_rf.joblib")
print("Joblib serialization verified successfully!")

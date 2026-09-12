from typing import List, Optional, Tuple
import numpy as np
from sklearn.ensemble import IsolationForest
from app.schemas.models import Transaction


class FraudAnomalyDetector:
    """
    Customer-specific anomaly detection using IsolationForest.
    Fits on customer's transaction history (amount, hour of day, day of week, debit/credit)
    to spot out-of-character, high-risk outliers (e.g., late-night massive transfers).
    
    Adheres strictly to Saarthi Architecture:
    Stress indicators (EMIs, medical expenses, rent) are managed by the Stress Classifier.
    Fraud Detector only inspects suspicious, uncharacteristic transfers/payments.
    """

    def __init__(self, contamination: float = 0.05):
        self.contamination = contamination

    def _extract_features(self, txns: List[Transaction]) -> np.ndarray:
        """Extracts feature vector: [amount, hour_of_day, day_of_week, is_debit]"""
        features = []
        for t in txns:
            hour = t.timestamp.hour
            day_of_week = t.timestamp.weekday()
            is_debit = 1.0 if t.type == "DEBIT" else 0.0
            features.append([float(t.amount), float(hour), float(day_of_week), is_debit])
        return np.array(features, dtype=np.float64)

    def detect_anomalies(
        self, transactions: List[Transaction]
    ) -> Tuple[bool, Optional[str], Optional[float]]:
        """
        Evaluates transactions for fraud anomalies.
        Returns: (is_anomaly_detected, flagged_txn_id, anomaly_score)
        """
        if not transactions:
            return False, None, None

        # Sort chronologically
        txns = sorted(transactions, key=lambda t: t.timestamp)

        if len(txns) < 5:
            latest_txn = txns[-1]
            if latest_txn.type == "DEBIT" and latest_txn.category in ("TRANSFER", "OTHER", "DISCRETIONARY"):
                if latest_txn.amount >= 100000.0 and (1 <= latest_txn.timestamp.hour <= 5):
                    return True, latest_txn.txn_id, -0.90
            return False, None, None

        # Feature matrix
        X = self._extract_features(txns)

        # Fit IsolationForest
        contamination = max(0.01, min(0.1, 2.0 / len(txns)))
        clf = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100,
        )
        clf.fit(X)

        preds = clf.predict(X)
        scores = clf.decision_function(X)

        # Inspect the latest 5 transactions for fraud anomalies
        for idx in range(len(txns) - 1, max(-1, len(txns) - 6), -1):
            t = txns[idx]

            # Legitimate debt/living expenses belong to Stress analysis, NOT fraud
            if t.category in ("EMI", "RENT", "UTILITIES", "SALARY"):
                continue

            if t.type == "DEBIT":
                # Condition 1: IsolationForest flags as outlier and amount is significant
                if preds[idx] == -1:
                    debit_amounts = [txn.amount for txn in txns if txn.type == "DEBIT" and txn.category not in ("EMI", "RENT")]
                    median_amount = float(np.median(debit_amounts)) if debit_amounts else 1000.0
                    if t.amount >= median_amount * 3.0:
                        return True, t.txn_id, round(float(scores[idx]), 4)

                # Condition 2: High-value late night transfer heuristic
                if 1 <= t.timestamp.hour <= 5 and t.amount >= 50000.0:
                    return True, t.txn_id, round(float(scores[idx]), 4)

        return False, None, None


fraud_detector = FraudAnomalyDetector()

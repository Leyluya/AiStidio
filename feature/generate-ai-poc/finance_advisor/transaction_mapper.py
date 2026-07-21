"""
finance_advisor.transaction_mapper

Simple rule-based transaction mapper to categorize bank CSV rows into expense categories.
This is a lightweight heuristic engine; users should review and refine rules.
"""
from typing import Dict, List
import re

# Example default rules (keyword -> category)
DEFAULT_RULES = {
    "grab": "transport",
    "line man": "transport",
    "7-eleven": "food",
    "7 eleven": "food",
    "lotus": "groceries",
    "big c": "groceries",
    "shopee": "shopping",
    "lazada": "shopping",
    "youtube": "entertainment",
    "netflix": "entertainment",
    "true": "utilities",
    "dtac": "utilities",
    "ais": "utilities",
    "starbucks": "coffee",
}


def normalize_text(s: str) -> str:
    return re.sub(r"[^0-9a-zA-Zก-๙\s]", " ", s.lower())


def map_transaction(description: str, amount: float, rules: Dict[str, str] = None) -> str:
    """Map a single transaction description -> category using keyword matching.

    Args:
        description: transaction description text
        amount: transaction amount (unused but available for heuristics)
        rules: optional mapping keyword -> category
    Returns:
        category string (or 'uncategorized')
    """
    if rules is None:
        rules = DEFAULT_RULES
    text = normalize_text(description)
    for kw, cat in rules.items():
        if kw in text:
            return cat
    # fallback heuristics
    if amount < 0:
        return "income"
    if amount > 10000:
        return "large_purchase"
    return "uncategorized"


def map_transactions(rows: List[Dict], rules: Dict[str, str] = None) -> List[Dict]:
    """Map list of transaction rows to include category key.

    Each row is expected to be a dict with at least `description` and `amount` keys.
    """
    mapped = []
    for r in rows:
        desc = r.get("description", "")
        amt = float(r.get("amount", 0))
        cat = map_transaction(desc, amt, rules)
        new = dict(r)
        new["category"] = cat
        mapped.append(new)
    return mapped

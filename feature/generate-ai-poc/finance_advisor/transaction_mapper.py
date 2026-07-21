"""
finance_advisor.transaction_mapper

Enhanced rule-based transaction mapper to categorize bank CSV rows into expense categories.
This file includes an expanded keyword-to-category mapping for Thai merchants and services.
"""
from typing import Dict, List
import re

# Expanded default rules (keyword -> category)
# Includes common Thai merchants, banks, telcos, and services (lowercase, normalized)
DEFAULT_RULES = {
    # Transport / Ride-hailing
    "grab": "transport",
    "grabfood": "food",
    "grabrider": "transport",
    "lineman": "transport",
    "line man": "transport",
    "taxi": "transport",
    "bts": "transport",
    "mrt": "transport",
    # Food & Delivery
    "foodpanda": "food",
    "ubereats": "food",
    "7-eleven": "food",
    "7 eleven": "food",
    "7eleven": "food",
    "family mart": "food",
    "familymart": "food",
    "mcdonald": "food",
    "mcd": "food",
    "kfc": "food",
    "ร้านอาหาร": "food",
    "restaurant": "food",
    # Groceries / Supermarket
    "big c": "groceries",
    "bigc": "groceries",
    "lotus": "groceries",
    "tesco": "groceries",
    "tops": "groceries",
    "makro": "groceries",
    # Shopping / E-commerce
    "shopee": "shopping",
    "lazada": "shopping",
    "jd central": "shopping",
    "amazon": "shopping",
    "shopee pay": "shopping",
    # Utilities / Telecom / Bills
    "true money": "utilities",
    "truemoney": "utilities",
    "true": "utilities",
    "dtac": "utilities",
    "ais": "utilities",
    "true move": "utilities",
    "internet": "utilities",
    "electricity": "utilities",
    "egat": "utilities",
    "ptt": "transport",
    "ptt station": "transport",
    # Coffee & Entertainment
    "starbucks": "coffee",
    "cafe": "coffee",
    "netflix": "entertainment",
    "spotify": "entertainment",
    "youtube": "entertainment",
    "major cineplex": "entertainment",
    "majorcineplex": "entertainment",
    "sf cinema": "entertainment",
    # Banks / Transfers / Salary
    "salary": "income",
    "เงินเดือน": "income",
    "transfer from": "transfer",
    "transfer to": "transfer",
    "promptpay": "transfer",
    "promtpay": "transfer",
    "kbank": "bank",
    "scb": "bank",
    "bbl": "bank",
    "krungsri": "bank",
    "ktc": "bank",
    "tmb": "bank",
    # Healthcare / Pharmacy
    "boots": "health",
    "watsons": "health",
    "pharmacy": "health",
    "hospital": "health",
    # Education / Courses
    "university": "education",
    "course": "education",
    "tuition": "education",
    # Housing / Rent / Mortgage
    "rent": "rent",
    "house rent": "rent",
    "mortgage": "rent",
    # Insurance / Tax / Fees
    "insurance": "insurance",
    "tax": "tax",
    "vat": "tax",
    "fee": "bank_fee",
    "service fee": "bank_fee",
    # Large purchases / Travel
    "airasia": "travel",
    "thai airways": "travel",
    "booking.com": "travel",
    "agoda": "travel",
    "hotel": "travel",
    # Misc / fallback
    "gift": "gifts",
    "donation": "donation",
    "salary": "income",
}


def normalize_text(s: str) -> str:
    return re.sub(r"[^0-9a-zA-Zก-๙\s]", " ", (s or "").lower())


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
    if amount >= 0 and ("salary" in text or "เงินเดือน" in text):
        return "income"
    if amount > 100000:
        return "large_purchase"
    # negative amounts are typically expenses
    if amount < 0:
        return "expense"
    return "uncategorized"


def map_transactions(rows: List[Dict], rules: Dict[str, str] = None) -> List[Dict]:
    """Map list of transaction rows to include category key.

    Each row is expected to be a dict with at least `description` and `amount` keys.
    """
    mapped = []
    for r in rows:
        desc = r.get("description", "")
        try:
            amt = float(r.get("amount", 0))
        except Exception:
            # try to parse strings with commas
            try:
                amt = float(str(r.get("amount", "0")).replace(',', ''))
            except Exception:
                amt = 0.0
        cat = map_transaction(desc, amt, rules)
        new = dict(r)
        new["category"] = cat
        mapped.append(new)
    return mapped

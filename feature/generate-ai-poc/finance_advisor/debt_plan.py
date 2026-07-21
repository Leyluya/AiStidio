"""
finance_advisor.debt_plan

Provides simple schedules for debt repayment using snowball and avalanche methods.
"""
from typing import List, Dict


def snowball_plan(debts: List[Dict], monthly_payment: float) -> List[Dict]:
    """Return a payment schedule using debt snowball (smallest balance first).

    debts: list of dicts with keys: name, balance, rate (annual in %)
    monthly_payment: total monthly amount to allocate to debts

    Returns:
        schedule: list of payment events (month, name, payment, remaining_balance)
    """
    debts = sorted(debts, key=lambda d: d["balance"])  # smallest balance first
    month = 0
    schedule = []
    # make a shallow copy
    debts_state = [{**d} for d in debts]
    while any(d["balance"] > 0.01 for d in debts_state):
        month += 1
        remaining = monthly_payment
        for d in debts_state:
            if d["balance"] <= 0:
                continue
            payment = min(remaining, d["balance"])
            d["balance"] = round(d["balance"] - payment, 2)
            schedule.append({"month": month, "name": d["name"], "payment": payment, "remaining": d["balance"]})
            remaining -= payment
            if remaining <= 0:
                break
        # avoid infinite loop
        if month > 600:
            break
    return schedule


def avalanche_plan(debts: List[Dict], monthly_payment: float) -> List[Dict]:
    """Return payment schedule using avalanche (highest rate first).

    Similar structure to snowball but ordering by rate descending.
    """
    debts = sorted(debts, key=lambda d: d.get("rate", 0), reverse=True)
    # reuse implementation pattern
    month = 0
    schedule = []
    debts_state = [{**d} for d in debts]
    while any(d["balance"] > 0.01 for d in debts_state):
        month += 1
        remaining = monthly_payment
        for d in debts_state:
            if d["balance"] <= 0:
                continue
            payment = min(remaining, d["balance"])
            d["balance"] = round(d["balance"] - payment, 2)
            schedule.append({"month": month, "name": d["name"], "payment": payment, "remaining": d["balance"]})
            remaining -= payment
            if remaining <= 0:
                break
        if month > 600:
            break
    return schedule

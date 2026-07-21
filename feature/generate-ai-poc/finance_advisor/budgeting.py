"""
finance_advisor.budgeting

ฟังก์ชันช่วยคำนวณงบประมาณส่วนบุคคลแบบพื้นฐาน
- 50/30/20
- zero_based_budget (แจกจ่ายตามรายการค่าใช้จ่าย)

Return values are in numeric amounts for given income.
"""

from typing import Dict, List


def budget_50_30_20(monthly_income: float) -> Dict[str, float]:
    """Return suggested allocation for 50/30/20 rule.

    Args:
        monthly_income: รายได้ต่อเดือน (หน่วยเดียวกับผลลัพธ์)

    Returns:
        dict with keys: needs, wants, savings
    """
    needs = monthly_income * 0.5
    wants = monthly_income * 0.3
    savings = monthly_income * 0.2
    return {"needs": round(needs, 2), "wants": round(wants, 2), "savings": round(savings, 2)}


def zero_based_budget(monthly_income: float, expenses: Dict[str, float]) -> Dict[str, float]:
    """Allocate income across provided expense categories so that total equals income.

    If sum(expenses) != monthly_income, proportions are scaled to match income.

    Args:
        monthly_income: รายได้ต่อเดือน
        expenses: dict of category -> planned_amount (relative or absolute)

    Returns:
        dict of category -> allocated_amount
    """
    if monthly_income <= 0:
        raise ValueError("monthly_income must be positive")
    total = sum(expenses.values())
    if total == 0:
        # evenly split
        n = len(expenses)
        return {k: round(monthly_income / n, 2) for k in expenses}
    scale = monthly_income / total
    return {k: round(v * scale, 2) for k, v in expenses.items()}


def savings_rate_from_history(income: List[float], savings: List[float]) -> float:
    """Compute average savings rate across periods.

    Args:
        income: list of incomes
        savings: list of savings amounts per same periods

    Returns:
        average savings rate (0..1)
    """
    if not income or not savings or len(income) != len(savings):
        raise ValueError("income and savings must be non-empty lists of same length")
    rates = [s / i if i else 0 for s, i in zip(savings, income)]
    return round(sum(rates) / len(rates), 4)

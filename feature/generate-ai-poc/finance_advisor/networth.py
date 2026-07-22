"""
finance_advisor.networth

Utilities to compute net worth and basic trendline.
"""
from typing import Dict, List


def compute_net_worth(assets: Dict[str, float], liabilities: Dict[str, float]) -> float:
    """Compute net worth = sum(assets) - sum(liabilities)
    """
    total_assets = sum(assets.values())
    total_liabilities = sum(liabilities.values())
    return round(total_assets - total_liabilities, 2)


def net_worth_trend(history: List[Dict[str, float]]) -> List[Dict]:
    """Given a history list of dicts with 'date', 'assets_total', 'liabilities_total', return list with net_worth.

    Example input: [{'date':'2026-01-01','assets_total':100000,'liabilities_total':50000}, ...]
    """
    out = []
    for row in history:
        nw = round(row.get('assets_total', 0) - row.get('liabilities_total', 0), 2)
        out.append({'date': row.get('date'), 'net_worth': nw})
    return out

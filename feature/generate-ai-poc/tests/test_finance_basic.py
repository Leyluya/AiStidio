import pytest
from finance_advisor.budgeting import budget_50_30_20, zero_based_budget


def test_budget_50_30_20():
    b = budget_50_30_20(20000)
    assert b['needs'] == 10000
    assert b['wants'] == 6000
    assert b['savings'] == 4000


def test_zero_based_budget():
    expenses = {'rent': 5000, 'food': 2000}
    alloc = zero_based_budget(10000, expenses)
    assert round(sum(alloc.values()), 2) == 10000

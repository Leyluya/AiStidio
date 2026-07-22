# Agent integration notes

This document describes how an AI agent can call the finance_advisor package functions.

Examples:

- Budget suggestion (50/30/20):
  from finance_advisor import budget_50_30_20
  budget = budget_50_30_20(30000)

- Transaction mapping:
  from finance_advisor import map_transactions
  mapped = map_transactions(list_of_rows)

- Debt plan:
  from finance_advisor import snowball_plan, avalanche_plan
  plan = snowball_plan(debts, monthly_payment=5000)

Safety / behavior:
- Always include the disclaimer for legal/tax/investment advisory.
- When asked for investment advice, refuse and provide general education only.
- When the user uploads CSV, warn about sensitive data and suggest redaction if needed.

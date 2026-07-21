"""
analysis/finance_analysis_example.py

Simple example script to read transactions CSV, map categories, and produce summary charts.
"""
import pandas as pd
import matplotlib.pyplot as plt
from finance_advisor.transaction_mapper import map_transactions

CSV_PATH = 'feature/generate-ai-poc/sample_data/bank_sample.csv'
OUT_DIR = 'feature/generate-ai-poc/research/analysis'


def run_analysis(csv_path=CSV_PATH):
    df = pd.read_csv(csv_path)
    rows = df.to_dict(orient='records')
    mapped = map_transactions(rows)
    mdf = pd.DataFrame(mapped)
    # basic summary
    summary = mdf.groupby('category')['amount'].sum().sort_values()
    print('Category totals:\n', summary)
    # plot
    try:
        ax = summary.plot(kind='barh', title='Expenses by category')
        fig = ax.get_figure()
        fig.tight_layout()
        fig.savefig(OUT_DIR + '/category_totals.png')
        print('Saved chart to', OUT_DIR + '/category_totals.png')
    except Exception as e:
        print('Could not save chart:', e)


if __name__ == '__main__':
    run_analysis()

"""Utilities to visualize feature importance rankings across multiple methods.

This module provides:
1. `rank_features_by_method` to convert importances to ranked scores.
2. `plot_feature_ranking_histogram` to plot a ranking histogram
   (grouped bar chart) for different importance methods.
"""

from __future__ import annotations

from typing import Mapping, Sequence

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


def rank_features_by_method(
    importances_by_method: Mapping[str, Mapping[str, float] | Sequence[float]],
    feature_names: Sequence[str] | None = None,
    ascending: bool = False,
) -> pd.DataFrame:
    """Build a DataFrame of feature ranks for each method.

    Args:
        importances_by_method: Mapping of method name -> feature importances.
            Importances can be:
            - dict-like: {feature_name: importance}
            - sequence-like: ordered importance values (requires `feature_names`)
        feature_names: Required when any method values are sequence-like.
        ascending: Whether lower value means more important. Defaults to False.

    Returns:
        A DataFrame indexed by feature name with columns as method names.
        Values are integer ranks where 1 is the most important feature.
    """
    ranked_columns: dict[str, pd.Series] = {}

    for method, values in importances_by_method.items():
        if isinstance(values, Mapping):
            series = pd.Series(values, dtype=float)
        else:
            if feature_names is None:
                raise ValueError(
                    "feature_names must be provided when importances are sequences."
                )
            if len(values) != len(feature_names):
                raise ValueError(
                    f"Length mismatch for method '{method}': "
                    f"{len(values)} importances vs {len(feature_names)} feature names."
                )
            series = pd.Series(values, index=feature_names, dtype=float)

        ranked_columns[method] = series.rank(
            ascending=ascending, method="min"
        ).astype(int)

    ranking_df = pd.DataFrame(ranked_columns)
    ranking_df.index.name = "feature"
    return ranking_df


def plot_feature_ranking_histogram(
    importances_by_method: Mapping[str, Mapping[str, float] | Sequence[float]],
    feature_names: Sequence[str] | None = None,
    top_n: int | None = None,
    ascending: bool = False,
    figsize: tuple[float, float] = (12, 6),
    title: str = "Feature Importance Ranking by Method",
) -> tuple[plt.Figure, plt.Axes]:
    """Plot a ranking histogram across multiple feature importance methods.

    The histogram is rendered as grouped bars:
    - x-axis: feature names
    - y-axis: rank position (1 = most important by default)
    - each method contributes one bar per feature
    """
    ranking_df = rank_features_by_method(
        importances_by_method=importances_by_method,
        feature_names=feature_names,
        ascending=ascending,
    )

    if top_n is not None and top_n > 0:
        mean_rank = ranking_df.mean(axis=1)
        ranking_df = ranking_df.loc[mean_rank.nsmallest(top_n).index]

    methods = list(ranking_df.columns)
    features = ranking_df.index.to_list()

    x = np.arange(len(features))
    width = 0.8 / max(len(methods), 1)

    fig, ax = plt.subplots(figsize=figsize)
    for i, method in enumerate(methods):
        offsets = (i - (len(methods) - 1) / 2) * width
        ax.bar(x + offsets, ranking_df[method].values, width=width, label=method)

    ax.set_xticks(x)
    ax.set_xticklabels(features, rotation=45, ha="right")
    ax.set_ylabel("Rank (1 = most important)")
    ax.set_xlabel("Features")
    ax.set_title(title)
    ax.legend(title="Method")
    ax.grid(axis="y", linestyle="--", alpha=0.3)
    ax.invert_yaxis()
    fig.tight_layout()

    return fig, ax


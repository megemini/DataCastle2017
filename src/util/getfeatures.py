# -*- coding: utf-8 -*-

"""
Generate features from pandas dataframe, with columns statistics.
-------------------

Return dataframe, columns=[by, col]

"""

def get_count(df, by):
    return df.groupby(by=by).count().iloc[:,0]


def get_sum(df, col, by):
    return df.groupby(by=by).sum()[col]


def get_mean(df, col, by):
    return df.groupby(by=by).mean()[col]


def get_std(df, col, by):
    return df.groupby(by=by).std()[col]


def get_max(df, col, by):
    return df.groupby(by=by).max()[col]


def get_min(df, col, by):
    return df.groupby(by=by).min()[col]


def get_dum_sum(df, col, prefix, by, drop_first=False):
    return pd.get_dummies(df[by + col], columns=col, prefix=prefix, drop_first=drop_first).groupby(by).sum()


def get_dum_has(df, col, prefix, by, drop_first=False):
    return pd.get_dummies(df[by + col], columns=col, prefix=prefix, drop_first=drop_first).groupby(by).max()


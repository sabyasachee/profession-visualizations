import json
import pandas as pd
import numpy as np

def create_frequency_data():
    expanded_df = pd.read_csv("data/expanded_D_YES_similarity.csv", index_col=None)
    title2sent = json.load(open("data/title2sent.json"))
    fw = open("data/titles.txt", "w")

    expanded_df = expanded_df.loc[expanded_df["similarity"] >= 0.0002]
    titles = expanded_df["title"].unique()

    
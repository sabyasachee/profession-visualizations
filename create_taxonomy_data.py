import json
import pandas as pd

def create_taxonomy_visualization_data():
    data = {
        "name":"Extended SOC",
        "code":"00-0000",
        "children":[]
        }

    structure_df = pd.read_csv("data/structure.csv", index_col=None)
    title_df = pd.read_csv("data/title.csv", index_col=None)
    expanded_df = pd.read_csv("data/expanded_D_YES_similarity.csv", index_col=None)

    expanded_df = expanded_df[expanded_df["max_similarity"] > 0.0002]

    for _, row in structure_df.iterrows():
        name = row["Group Name"]
        code = None

        if pd.notna(row["Major Group"]):
            code = row["Major Group"]
            major_group_code = code
        elif pd.notna(row["Minor Group"]):
            code = row["Minor Group"]
            minor_group_code = code
        elif pd.notna(row["Broad Group"]):
            code = row["Broad Group"]
            broad_group_code = code
        else:
            code = row["Detailed Occupation"]

        group = {
            "name": name,
            "code": code,
            "children": []
        }

        major_group_ixs = [i for i, child in enumerate(data["children"]) if child["code"] == major_group_code]

        if len(major_group_ixs) == 0:
            print(f"adding major group {code}")
            data["children"].append(group)

        else:
            major_group_ix = major_group_ixs[0]
            major_group = data["children"][major_group_ix]

            minor_group_ixs = [i for i, child in enumerate(major_group["children"]) if child["code"] == minor_group_code]

            if len(minor_group_ixs) == 0:
                print(f"\tadding minor group {code}")
                data["children"][major_group_ix]["children"].append(group)

            else:
                minor_group_ix = minor_group_ixs[0]
                minor_group = data["children"][major_group_ix]["children"][minor_group_ix]

                broad_group_ixs = [i for i, child in enumerate(minor_group["children"]) if child["code"] == broad_group_code]

                if len(broad_group_ixs) == 0:
                    print(f"\t\tadding broad group {code}")
                    data["children"][major_group_ix]["children"][minor_group_ix]["children"].append(group)

                else:
                    print(f"\t\t\tadding detailed group {code}")
                    broad_group_ix = broad_group_ixs[0]

                    soc_titles = set([title.lower() for title in title_df.loc[title_df["2018 SOC Code"]==code, "2018 SOC Direct Match Title"]])
                    new_titles = set([title.replace("_"," ") for title in expanded_df.loc[expanded_df["code"]==code, "original"]])
                    new_titles = new_titles.difference(soc_titles)

                    for title in sorted(soc_titles):
                        group["children"].append({"name":title, "type":"soc"})

                    for title in sorted(new_titles):
                        group["children"].append({"name":title, "type":"exp"})

                    data["children"][major_group_ix]["children"][minor_group_ix]["children"][broad_group_ix]["children"].append(group)

    json.dump(data, open("data/taxonomy.json","w"), indent=2)

if __name__ == "__main__":
    create_taxonomy_visualization_data()
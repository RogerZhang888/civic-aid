new_file = ""
with open ("/root/NAISC25/govsg_crawler_2/gov_text_output.jl") as f:
    for line in f.readlines():
        if '"content": ""' not in line:
            new_file = new_file + line

with open ("/root/NAISC25/govsg_crawler_2/gov_text_output_cleaned.jl", 'w+') as f:
    f.write(new_file)


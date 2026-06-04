import os
import re

ebooks_dir = "/home/ubuntu/MMN_AI-to-AI/docs/ebooks_markdown"
covers_dir = "/home/ubuntu/MMN_AI-to-AI/assets/ebook_covers"

for filename in os.listdir(ebooks_dir):
    if filename.endswith(".md"):
        ebook_path = os.path.join(ebooks_dir, filename)
        ebook_num = filename.split("_")[0]
        
        # Encontrar a capa correspondente
        cover_file = None
        for cover_name in os.listdir(covers_dir):
            if cover_name.startswith(ebook_num) and cover_name.endswith(".png"):
                cover_file = cover_name
                break
        
        if cover_file:
            with open(ebook_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remover qualquer linha de imagem existente no topo
            content = re.sub(r'^!\[.*?\]\(.*?\)\n*', '', content)
            
            # Adicionar a nova capa
            new_content = f"![Capa](../../assets/ebook_covers/{cover_file})\n\n" + content
            
            with open(ebook_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename} with cover {cover_file}")
        else:
            print(f"No cover found for {filename}")

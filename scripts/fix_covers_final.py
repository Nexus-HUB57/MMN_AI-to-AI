import os
import re
import shutil

repo_root = "/home/ubuntu/MMN_AI-to-AI"
ebooks_md_dir = os.path.join(repo_root, "docs/ebooks_markdown")
ebooks_docx_dir = os.path.join(repo_root, "docs/ebooks")
covers_src = os.path.join(repo_root, "assets/ebook_covers")

def clean_and_fix():
    # 1. Limpar arquivos de imagem das pastas de destino para evitar confusão
    for d in [ebooks_md_dir, ebooks_docx_dir]:
        for f in os.listdir(d):
            if f.endswith(('.png', '.webp', '.jpg', '.jpeg')):
                os.remove(os.path.join(d, f))
                print(f"Removido: {os.path.join(d, f)}")

    # 2. Obter mapeamento correto de capas
    available_covers = os.listdir(covers_src)
    cover_map = {}
    for cover in available_covers:
        prefix = cover.split('_')[0]
        if prefix not in cover_map:
            cover_map[prefix] = []
        cover_map[prefix].append(cover)

    # 3. Corrigir Markdowns e copiar capas
    for filename in os.listdir(ebooks_md_dir):
        if filename.endswith(".md"):
            path = os.path.join(ebooks_md_dir, filename)
            prefix = filename.split('_')[0]
            
            if prefix in cover_map:
                # Prioridade .png > .webp
                covers = cover_map[prefix]
                pngs = [c for c in covers if c.endswith('.png')]
                selected = pngs[0] if pngs else covers[0]
                
                # Copiar para a pasta (opcional, mas o usuário pediu sincronização)
                shutil.copy2(os.path.join(covers_src, selected), os.path.join(ebooks_md_dir, selected))
                
                # Ler e limpar conteúdo
                with open(path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                # Remover TODAS as linhas iniciais que pareçam referências a imagens Markdown
                new_lines = []
                found_content = False
                for line in lines:
                    if not found_content and (line.strip().startswith('![') or line.strip() == ''):
                        continue
                    else:
                        found_content = True
                        new_lines.append(line)
                
                # Adicionar a referência correta no topo
                # Usando caminho relativo para assets para ser portátil
                final_content = f"![Capa](../../assets/ebook_covers/{selected})\n\n" + "".join(new_lines)
                
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(final_content)
                print(f"Corrigido: {filename} -> {selected}")

    # 4. Sincronizar capas para a pasta de docx também
    for filename in os.listdir(ebooks_docx_dir):
        if filename.endswith(".docx"):
            prefix = filename.split('_')[0]
            if prefix in cover_map:
                covers = cover_map[prefix]
                pngs = [c for c in covers if c.endswith('.png')]
                selected = pngs[0] if pngs else covers[0]
                shutil.copy2(os.path.join(covers_src, selected), os.path.join(ebooks_docx_dir, selected))
                print(f"Sincronizado docx: {filename} -> {selected}")

if __name__ == "__main__":
    clean_and_fix()

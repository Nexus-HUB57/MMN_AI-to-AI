import json
import sqlite3
import os
from datetime import datetime

# Este script simula a extração de dados do banco de dados (MySQL/TiDB via Drizzle)
# e os formata para o padrão de fine-tuning da OpenAI (JSONL).
# Em um ambiente real, ele se conectaria ao banco via DATABASE_URL.

def generate_finetuning_dataset():
    print("Iniciando extração de dados para fine-tuning...")
    
    # Simulação de dados de alta conversão (ex: produtos vendidos com sucesso)
    # Na prática, faríamos JOIN entre 'orders', 'products' e logs de geração de conteúdo.
    high_conversion_examples = [
        {
            "role": "system",
            "content": "Você é um agente de elite do MMN AI-to-AI especializado em copywriting para o nicho de eletrônicos."
        },
        {
            "role": "user",
            "content": "Gere uma descrição persuasiva para o Smartwatch Pro X8 do Mercado Livre."
        },
        {
            "role": "assistant",
            "content": "🚀 Transforme sua rotina com o Smartwatch Pro X8! Mais que um relógio, seu novo assistente de saúde e produtividade. Monitoramento cardíaco 24h, notificações em tempo real e bateria que dura a semana toda. Oferta exclusiva via MMN AI-to-AI. Garanta o seu agora! #Smartwatch #Tecnologia #MMN"
        }
    ]

    # Simulação de dados de reflexão estratégica (da tabela daily_reflections)
    strategic_reflection_examples = [
        {
            "role": "system",
            "content": "Você é um agente estratégico de MMN focado em otimização de rede e análise de tendências."
        },
        {
            "role": "user",
            "content": "Quais são as tendências de produtos para a próxima semana baseadas nas vendas atuais?"
        },
        {
            "role": "assistant",
            "content": "Analisando o fluxo de comissões e o engajamento da rede, identificamos um aumento de 25% na demanda por acessórios de fitness. Recomendo focar a estratégia de conteúdo em 'Bem-estar' e 'Saúde' para maximizar o ROI dos afiliados de Nível 1 e 2."
        }
    ]

    dataset = [
        {"messages": high_conversion_examples},
        {"messages": strategic_reflection_examples}
    ]

    # Criar diretório para datasets se não existir
    os.makedirs("/home/ubuntu/MMN_AI-to-AI/ai_models/datasets", exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = f"/home/ubuntu/MMN_AI-to-AI/ai_models/datasets/mmn_finetuning_{timestamp}.jsonl"

    with open(output_path, "w", encoding="utf-8") as f:
        for entry in dataset:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    print(f"Dataset gerado com sucesso em: {output_path}")
    return output_path

if __name__ == "__main__":
    generate_finetuning_dataset()

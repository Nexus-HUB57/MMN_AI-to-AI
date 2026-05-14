#!/usr/bin/env python3
"""
Script de treinamento para fine-tuning de modelos de IA proprietários.
Suporta fine-tuning via OpenAI API e modelos open-source locais.
"""

import os
import json
import argparse
from datetime import datetime
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print("OpenAI SDK não instalado. Execute: pip install openai")
    exit(1)


class MMNModelTrainer:
    def __init__(self, config_path: str = None):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.config_path = config_path or "/home/ubuntu/MMN_AI-to-AI/ai_models/configs/models-config.json"
        self.load_config()

    def load_config(self):
        """Carrega a configuração de modelos."""
        with open(self.config_path, "r", encoding="utf-8") as f:
            self.config = json.load(f)

    def validate_dataset(self, dataset_path: str) -> bool:
        """Valida o formato do dataset JSONL."""
        print(f"Validando dataset: {dataset_path}")
        
        if not os.path.exists(dataset_path):
            print(f"❌ Arquivo não encontrado: {dataset_path}")
            return False

        valid_count = 0
        error_count = 0

        with open(dataset_path, "r", encoding="utf-8") as f:
            for line_num, line in enumerate(f, 1):
                try:
                    entry = json.loads(line)
                    if "messages" not in entry:
                        print(f"⚠️  Linha {line_num}: Campo 'messages' ausente")
                        error_count += 1
                    else:
                        valid_count += 1
                except json.JSONDecodeError as e:
                    print(f"❌ Linha {line_num}: JSON inválido - {e}")
                    error_count += 1

        print(f"✅ Validação concluída: {valid_count} entradas válidas, {error_count} erros")
        return error_count == 0

    def upload_dataset(self, dataset_path: str) -> str:
        """Faz upload do dataset para a OpenAI."""
        print(f"Fazendo upload do dataset: {dataset_path}")
        
        with open(dataset_path, "rb") as f:
            response = self.client.files.create(
                file=f,
                purpose="fine-tune"
            )
        
        file_id = response.id
        print(f"✅ Dataset enviado com sucesso. File ID: {file_id}")
        return file_id

    def start_finetuning_job(self, model_name: str, file_id: str) -> str:
        """Inicia um job de fine-tuning na OpenAI."""
        model_config = self.config["models"].get(model_name)
        
        if not model_config:
            print(f"❌ Modelo não encontrado: {model_name}")
            return None

        hyperparams = model_config.get("hyperparameters", {})
        
        print(f"Iniciando fine-tuning para: {model_name}")
        print(f"  - Base Model: {model_config['baseModel']}")
        print(f"  - Epochs: {hyperparams.get('epochs', 3)}")
        print(f"  - Batch Size: {hyperparams.get('batchSize', 32)}")

        try:
            response = self.client.fine_tuning.jobs.create(
                training_file=file_id,
                model=model_config["baseModel"],
                hyperparameters={
                    "n_epochs": hyperparams.get("epochs", 3),
                    "batch_size": hyperparams.get("batchSize", 32),
                }
            )
            
            job_id = response.id
            print(f"✅ Job de fine-tuning criado: {job_id}")
            print(f"   Status: {response.status}")
            
            return job_id
        except Exception as e:
            print(f"❌ Erro ao iniciar fine-tuning: {e}")
            return None

    def check_job_status(self, job_id: str) -> dict:
        """Verifica o status de um job de fine-tuning."""
        try:
            job = self.client.fine_tuning.jobs.retrieve(job_id)
            return {
                "id": job.id,
                "status": job.status,
                "model": job.model,
                "fine_tuned_model": job.fine_tuned_model,
                "created_at": job.created_at,
                "updated_at": job.updated_at,
            }
        except Exception as e:
            print(f"❌ Erro ao verificar status: {e}")
            return None

    def list_finetuning_jobs(self, limit: int = 10):
        """Lista os jobs de fine-tuning recentes."""
        try:
            jobs = self.client.fine_tuning.jobs.list(limit=limit)
            print(f"📋 Últimos {limit} jobs de fine-tuning:")
            for job in jobs.data:
                print(f"  - {job.id}: {job.status} (modelo: {job.fine_tuned_model or 'em treinamento'})")
            return jobs.data
        except Exception as e:
            print(f"❌ Erro ao listar jobs: {e}")
            return []

    def generate_report(self, model_name: str, job_id: str = None):
        """Gera um relatório de treinamento."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = f"/home/ubuntu/MMN_AI-to-AI/ai_models/reports/training_report_{model_name}_{timestamp}.md"
        
        os.makedirs(os.path.dirname(report_path), exist_ok=True)
        
        report = f"""# Relatório de Treinamento - {model_name}

## Informações Gerais
- **Data**: {datetime.now().isoformat()}
- **Modelo**: {model_name}
- **Job ID**: {job_id or 'N/A'}

## Configuração
"""
        
        model_config = self.config["models"].get(model_name, {})
        report += f"""
- **Base Model**: {model_config.get('baseModel', 'N/A')}
- **Datasets**: {', '.join(model_config.get('trainingDatasets', []))}
- **Hyperparâmetros**: {json.dumps(model_config.get('hyperparameters', {}), indent=2)}

## Status
- **Status**: {model_config.get('status', 'N/A')}
- **Data Esperada de Conclusão**: {model_config.get('expectedCompletionDate', 'N/A')}

## Próximos Passos
1. Monitorar o progresso do job de fine-tuning
2. Validar o modelo em um ambiente de staging
3. Implementar testes A/B com o modelo genérico
4. Ativar o modelo em produção após validação
"""
        
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(report)
        
        print(f"✅ Relatório gerado: {report_path}")
        return report_path


def main():
    parser = argparse.ArgumentParser(description="Treinador de Modelos IA Proprietários MMN")
    parser.add_argument("--action", choices=["validate", "upload", "train", "status", "list", "report"],
                       required=True, help="Ação a executar")
    parser.add_argument("--model", help="Nome do modelo (ex: mmn-copywriting-v1)")
    parser.add_argument("--dataset", help="Caminho do arquivo JSONL do dataset")
    parser.add_argument("--job-id", help="ID do job de fine-tuning")
    parser.add_argument("--config", help="Caminho do arquivo de configuração")

    args = parser.parse_args()

    trainer = MMNModelTrainer(config_path=args.config)

    if args.action == "validate":
        if not args.dataset:
            print("❌ --dataset é obrigatório para validação")
            return
        trainer.validate_dataset(args.dataset)

    elif args.action == "upload":
        if not args.dataset:
            print("❌ --dataset é obrigatório para upload")
            return
        file_id = trainer.upload_dataset(args.dataset)
        print(f"File ID para usar no treinamento: {file_id}")

    elif args.action == "train":
        if not args.model or not args.dataset:
            print("❌ --model e --dataset são obrigatórios para treinamento")
            return
        
        # Validar dataset
        if not trainer.validate_dataset(args.dataset):
            print("❌ Dataset inválido. Abortando treinamento.")
            return
        
        # Upload dataset
        file_id = trainer.upload_dataset(args.dataset)
        
        # Iniciar fine-tuning
        job_id = trainer.start_finetuning_job(args.model, file_id)
        
        if job_id:
            trainer.generate_report(args.model, job_id)

    elif args.action == "status":
        if not args.job_id:
            print("❌ --job-id é obrigatório para verificar status")
            return
        status = trainer.check_job_status(args.job_id)
        if status:
            print(json.dumps(status, indent=2, default=str))

    elif args.action == "list":
        trainer.list_finetuning_jobs()

    elif args.action == "report":
        if not args.model:
            print("❌ --model é obrigatório para gerar relatório")
            return
        trainer.generate_report(args.model, args.job_id)


if __name__ == "__main__":
    main()

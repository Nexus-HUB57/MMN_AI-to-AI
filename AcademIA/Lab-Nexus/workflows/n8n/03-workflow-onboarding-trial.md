{
  "name": "Workflow: Onboarding Trial → Pago",
  "platform": "n8n",
  "version": "1.0.0",
  "description": "Converte trial de 14 dias em assinatura paga via sequência personalizada",
  "trigger": {
    "type": "schedule",
    "cron": "0 10 * * *",
    "description": "Roda diariamente às 10h, processa trials do dia"
  },
  "nodes": [
    {
      "id": "schedule_trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [
            {
              "hours": [10]
            }
          ]
        }
      }
    },
    {
      "id": "postgres_query",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "select",
        "query": "SELECT id, email, name, plan, trial_started_at, engagement_score FROM users WHERE trial_started_at > NOW() - INTERVAL '14 days' AND converted_to_paid = false AND trial_expired = false"
      }
    },
    {
      "id": "filter_engaged",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.engagement_score}}",
              "operation": "greaterThan",
              "value2": 50
            }
          ]
        }
      }
    },
    {
      "id": "ai_personalize",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://api.nexus-academy.io/ai/personalize-offer",
        "body": {
          "user_id": "={{$json.id}}",
          "engagement_data": "={{$json.engagement_score}}",
          "context": "trial_to_paid_conversion"
        }
      }
    },
    {
      "id": "send_personalized_email",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "from": "time@nexus-academy.io",
        "to": "={{$json.email}}",
        "subject": "={{$json.ai_subject}}",
        "html": "={{$json.ai_body_html}}",
        "attachments": []
      }
    },
    {
      "id": "schedule_followup",
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "amount": 3,
        "unit": "days"
      }
    },
    {
      "id": "check_converted",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "select",
        "query": "SELECT converted_to_paid FROM users WHERE id = {{$json.id}}"
      }
    },
    {
      "id": "send_reminder_if_not_converted",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.converted_to_paid}}",
              "value2": false
            }
          ]
        }
      }
    },
    {
      "id": "send_reminder_email",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "from": "time@nexus-academy.io",
        "to": "={{$node[ai_personalize].json.email}}",
        "subject": "⏰ {{$node[ai_personalize].json.name}}, trial acaba em 24h",
        "html": "<h1>Última chance</h1><p>Seu trial expira amanhã. Garanta 30% off se converter agora.</p>"
      }
    },
    {
      "id": "log_to_sheets",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "operation": "append",
        "sheet_id": "{{env.GS_TRIAL_METRICS}}",
        "data": {
          "user_id": "={{$json.id}}",
          "engagement_score": "={{$json.engagement_score}}",
          "personalized_offer_sent": true,
          "converted": "={{$json.converted_to_paid}}",
          "date": "={{$now.format('YYYY-MM-DD')}}"
        }
      }
    }
  ],
  "expected_metrics": {
    "trial_to_paid_conversion_rate": "20-35%",
    "incremental_revenue_per_trial": "R$ 47-89",
    "personalization_lift_vs_control": "+45%"
  },
  "fallback_behavior": {
    "if_personalize_api_fails": "Enviar email genérico de trial expiration",
    "if_postgres_fails": "Alert CS team via Slack"
  }
}
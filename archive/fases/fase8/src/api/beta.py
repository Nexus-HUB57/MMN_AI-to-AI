"""
Fase 8 - Beta Launch Program
API Router - Endpoints REST para Beta Program
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime

from ..models.beta import (
    BetaProgram, BetaTester, FeedbackSubmission, BugReport,
    BetaInvite, BetaSurvey, BetaStatus, TesterStatus,
    FeedbackSeverity, FeedbackStatus, BugReportStatus
)
from ..services.beta_service import beta_service

router = APIRouter(prefix="/beta", tags=["Beta Program"])


# ==================== PROGRAMAS ====================

@router.post("/programs", response_model=dict, status_code=201)
def create_program(
    name: str,
    version: str,
    description: str,
    max_testers: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    target_features: Optional[List[str]] = None,
    inclusion_criteria: Optional[List[str]] = None,
    exclusion_criteria: Optional[List[str]] = None,
    rewards_enabled: bool = False,
    reward_description: Optional[str] = None
) -> dict:
    """Criar novo programa beta"""
    program = beta_service.create_program(
        name=name,
        version=version,
        description=description,
        max_testers=max_testers,
        start_date=start_date,
        end_date=end_date,
        target_features=target_features,
        inclusion_criteria=inclusion_criteria,
        exclusion_criteria=exclusion_criteria,
        rewards_enabled=rewards_enabled,
        reward_description=reward_description
    )
    return {"program": program.model_dump()}


@router.get("/programs", response_model=dict)
def list_programs(status: Optional[str] = None) -> dict:
    """Listar programas beta"""
    status_enum = BetaStatus(status) if status else None
    programs = beta_service.list_programs(status=status_enum)
    return {
        "programs": [p.model_dump() for p in programs],
        "count": len(programs)
    }


@router.get("/programs/{program_id}", response_model=dict)
def get_program(program_id: str) -> dict:
    """Obter detalhes do programa"""
    program = beta_service.get_program(program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Programa não encontrado")
    return {"program": program.model_dump()}


@router.patch("/programs/{program_id}", response_model=dict)
def update_program(
    program_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[str] = None,
    max_testers: Optional[int] = None
) -> dict:
    """Atualizar programa"""
    status_enum = BetaStatus(status) if status else None
    program = beta_service.update_program(
        program_id,
        name=name,
        description=description,
        status=status_enum,
        max_testers=max_testers
    )
    if not program:
        raise HTTPException(status_code=404, detail="Programa não encontrado")
    return {"program": program.model_dump()}


@router.post("/programs/{program_id}/open", response_model=dict)
def open_program(program_id: str) -> dict:
    """Abrir programa beta para inscrições"""
    program = beta_service.update_program_status(program_id, BetaStatus.OPEN)
    if not program:
        raise HTTPException(status_code=404, detail="Programa não encontrado")
    return {"program": program.model_dump(), "message": "Programa aberto com sucesso"}


@router.post("/programs/{program_id}/close", response_model=dict)
def close_program(program_id: str) -> dict:
    """Encerrar programa beta"""
    program = beta_service.update_program_status(program_id, BetaStatus.CLOSED)
    if not program:
        raise HTTPException(status_code=404, detail="Programa não encontrado")
    return {"program": program.model_dump(), "message": "Programa encerrado com sucesso"}


@router.get("/programs/{program_id}/metrics", response_model=dict)
def get_program_metrics(program_id: str) -> dict:
    """Obter métricas do programa"""
    metrics = beta_service.get_program_metrics(program_id)
    if not metrics:
        raise HTTPException(status_code=404, detail="Programa não encontrado")
    return metrics


# ==================== TESTADORES ====================

@router.post("/testers", response_model=dict, status_code=201)
def add_tester(
    user_id: str,
    program_id: str,
    email: str,
    name: str,
    company: Optional[str] = None,
    use_case: Optional[str] = None,
    experience_level: str = "intermediate"
) -> dict:
    """Adicionar testador ao programa"""
    program = beta_service.get_program(program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Programa não encontrado")

    if program.current_testers >= program.max_testers:
        raise HTTPException(status_code=400, detail="Limite de testadores atingido")

    tester = beta_service.add_tester(
        user_id=user_id,
        program_id=program_id,
        email=email,
        name=name,
        company=company,
        use_case=use_case,
        experience_level=experience_level
    )
    return {"tester": tester.model_dump()}


@router.get("/testers", response_model=dict)
def list_testers(
    program_id: Optional[str] = None,
    status: Optional[str] = None
) -> dict:
    """Listar testadores"""
    status_enum = TesterStatus(status) if status else None
    testers = beta_service.list_testers(program_id=program_id, status=status_enum)
    return {
        "testers": [t.model_dump() for t in testers],
        "count": len(testers)
    }


@router.get("/testers/{tester_id}", response_model=dict)
def get_tester(tester_id: str) -> dict:
    """Obter detalhes do testador"""
    tester = beta_service.get_tester(tester_id)
    if not tester:
        raise HTTPException(status_code=404, detail="Testador não encontrado")
    return {"tester": tester.model_dump()}


@router.patch("/testers/{tester_id}/status", response_model=dict)
def update_tester_status(tester_id: str, status: str) -> dict:
    """Atualizar status do testador"""
    status_enum = TesterStatus(status)
    tester = beta_service.update_tester_status(tester_id, status_enum)
    if not tester:
        raise HTTPException(status_code=404, detail="Testador não encontrado")
    return {"tester": tester.model_dump()}


@router.delete("/testers/{tester_id}", response_model=dict)
def remove_tester(tester_id: str) -> dict:
    """Remover testador"""
    success = beta_service.remove_tester(tester_id)
    if not success:
        raise HTTPException(status_code=404, detail="Testador não encontrado")
    return {"message": "Testador removido com sucesso"}


@router.get("/testers/{tester_id}/metrics", response_model=dict)
def get_tester_metrics(tester_id: str) -> dict:
    """Obter métricas do testador"""
    metrics = beta_service.get_tester_metrics(tester_id)
    if not metrics:
        raise HTTPException(status_code=404, detail="Testador não encontrado")
    return metrics


# ==================== FEEDBACK ====================

@router.post("/feedback", response_model=dict, status_code=201)
def submit_feedback(
    tester_id: str,
    program_id: str,
    title: str,
    content: str,
    feature_id: Optional[str] = None,
    severity: str = "medium",
    rating: Optional[int] = None,
    attachments: Optional[List[str]] = None
) -> dict:
    """Submeter feedback"""
    tester = beta_service.get_tester(tester_id)
    if not tester:
        raise HTTPException(status_code=404, detail="Testador não encontrado")

    severity_enum = FeedbackSeverity(severity)
    feedback = beta_service.submit_feedback(
        tester_id=tester_id,
        program_id=program_id,
        title=title,
        content=content,
        feature_id=feature_id,
        severity=severity_enum,
        rating=rating,
        attachments=attachments
    )
    return {"feedback": feedback.model_dump()}


@router.get("/feedback", response_model=dict)
def list_feedback(
    program_id: Optional[str] = None,
    tester_id: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None
) -> dict:
    """Listar feedbacks"""
    status_enum = FeedbackStatus(status) if status else None
    severity_enum = FeedbackSeverity(severity) if severity else None

    feedbacks = beta_service.list_feedback(
        program_id=program_id,
        tester_id=tester_id,
        status=status_enum,
        severity=severity_enum
    )
    return {
        "feedbacks": [f.model_dump() for f in feedbacks],
        "count": len(feedbacks)
    }


@router.get("/feedback/{feedback_id}", response_model=dict)
def get_feedback(feedback_id: str) -> dict:
    """Obter detalhes do feedback"""
    feedback = beta_service.get_feedback(feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback não encontrado")
    return {"feedback": feedback.model_dump()}


@router.patch("/feedback/{feedback_id}/status", response_model=dict)
def update_feedback_status(
    feedback_id: str,
    status: str,
    response: Optional[str] = None
) -> dict:
    """Atualizar status do feedback"""
    status_enum = FeedbackStatus(status)
    feedback = beta_service.update_feedback_status(feedback_id, status_enum, response)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback não encontrado")
    return {"feedback": feedback.model_dump()}


# ==================== BUG REPORTS ====================

@router.post("/bugs", response_model=dict, status_code=201)
def report_bug(
    tester_id: str,
    program_id: str,
    title: str,
    description: str,
    steps_to_reproduce: List[str],
    expected_behavior: str,
    actual_behavior: str,
    severity: str = "medium",
    category: str = "general",
    tags: Optional[List[str]] = None,
    screenshots: Optional[List[str]] = None
) -> dict:
    """Reportar bug"""
    tester = beta_service.get_tester(tester_id)
    if not tester:
        raise HTTPException(status_code=404, detail="Testador não encontrado")

    severity_enum = FeedbackSeverity(severity)
    bug = beta_service.report_bug(
        tester_id=tester_id,
        program_id=program_id,
        title=title,
        description=description,
        steps_to_reproduce=steps_to_reproduce,
        expected_behavior=expected_behavior,
        actual_behavior=actual_behavior,
        severity=severity_enum,
        category=category,
        tags=tags,
        screenshots=screenshots
    )
    return {"bug": bug.model_dump()}


@router.get("/bugs", response_model=dict)
def list_bugs(
    program_id: Optional[str] = None,
    tester_id: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    category: Optional[str] = None
) -> dict:
    """Listar reportes de bug"""
    status_enum = BugReportStatus(status) if status else None
    severity_enum = FeedbackSeverity(severity) if severity else None

    bugs = beta_service.list_bug_reports(
        program_id=program_id,
        tester_id=tester_id,
        status=status_enum,
        severity=severity_enum,
        category=category
    )
    return {
        "bugs": [b.model_dump() for b in bugs],
        "count": len(bugs)
    }


@router.get("/bugs/{bug_id}", response_model=dict)
def get_bug_report(bug_id: str) -> dict:
    """Obter detalhes do bug"""
    bug = beta_service.get_bug_report(bug_id)
    if not bug:
        raise HTTPException(status_code=404, detail="Bug não encontrado")
    return {"bug": bug.model_dump()}


@router.patch("/bugs/{bug_id}/status", response_model=dict)
def update_bug_status(
    bug_id: str,
    status: str,
    assignee: Optional[str] = None,
    fixed_in_version: Optional[str] = None
) -> dict:
    """Atualizar status do bug"""
    status_enum = BugReportStatus(status)
    bug = beta_service.update_bug_status(
        bug_id,
        status_enum,
        assignee=assignee,
        fixed_in_version=fixed_in_version
    )
    if not bug:
        raise HTTPException(status_code=404, detail="Bug não encontrado")
    return {"bug": bug.model_dump()}


# ==================== CONVITES ====================

@router.post("/invites", response_model=dict, status_code=201)
def create_invite(
    program_id: str,
    email: str,
    invited_by: str,
    expires_days: int = 7
) -> dict:
    """Criar convite para beta"""
    program = beta_service.get_program(program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Programa não encontrado")

    invite = beta_service.create_invite(
        program_id=program_id,
        email=email,
        invited_by=invited_by,
        expires_days=expires_days
    )
    return {"invite": invite.model_dump()}


@router.get("/invites/validate/{token}", response_model=dict)
def validate_invite(token: str) -> dict:
    """Validar token de convite"""
    invite = beta_service.validate_invite_token(token)
    if not invite:
        raise HTTPException(status_code=404, detail="Convite inválido ou expirado")
    return {"invite": invite.model_dump()}


@router.post("/invites/accept/{token}", response_model=dict)
def accept_invite(
    token: str,
    user_id: str,
    name: str
) -> dict:
    """Aceitar convite"""
    tester = beta_service.accept_invite(token, user_id, name)
    if not tester:
        raise HTTPException(status_code=400, detail="Convite inválido ou expirado")
    return {"tester": tester.model_dump(), "message": "Convite aceito com sucesso"}


# ==================== ENQUETES ====================

@router.post("/surveys", response_model=dict, status_code=201)
def submit_survey(
    tester_id: str,
    program_id: str,
    satisfaction: int,
    likelihood_recommend: int,
    likelihood_continue: int,
    ease_of_use: int,
    feature_quality: int,
    support_quality: int,
    comments: Optional[str] = None
) -> dict:
    """Submeter pesquisa de feedback"""
    if not (1 <= satisfaction <= 5):
        raise HTTPException(status_code=400, detail="Satisfaction must be 1-5")
    if not (1 <= likelihood_recommend <= 10):
        raise HTTPException(status_code=400, detail="Likelihood recommend must be 1-10")
    if not (1 <= ease_of_use <= 5):
        raise HTTPException(status_code=400, detail="Ease of use must be 1-5")
    if not (1 <= feature_quality <= 5):
        raise HTTPException(status_code=400, detail="Feature quality must be 1-5")
    if not (1 <= support_quality <= 5):
        raise HTTPException(status_code=400, detail="Support quality must be 1-5")

    survey = beta_service.submit_survey(
        tester_id=tester_id,
        program_id=program_id,
        satisfaction=satisfaction,
        likelihood_recommend=likelihood_recommend,
        likelihood_continue=likelihood_continue,
        ease_of_use=ease_of_use,
        feature_quality=feature_quality,
        support_quality=support_quality,
        comments=comments
    )
    return {"survey": survey.model_dump()}


@router.get("/surveys/program/{program_id}", response_model=dict)
def get_program_surveys(program_id: str) -> dict:
    """Obter pesquisas de um programa"""
    surveys = beta_service.get_surveys(program_id)
    return {
        "surveys": [s.model_dump() for s in surveys],
        "count": len(surveys)
    }
"""
Fase 8 - Beta Launch Program
Beta Service - Lógica de negócio do programa beta
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from enum import Enum
import hashlib
import secrets

from .models.beta import (
    BetaProgram, BetaTester, FeedbackSubmission, BugReport,
    BetaInvite, BetaMetrics, FeatureAdoption, ReleaseNote, BetaSurvey,
    BetaStatus, TesterStatus, FeedbackSeverity, FeedbackStatus, BugReportStatus
)


class BetaService:
    """Serviço de gerenciamento do programa beta"""

    def __init__(self):
        # Storage em memória (simula banco de dados)
        self.programs: Dict[str, BetaProgram] = {}
        self.testers: Dict[str, BetaTester] = {}
        self.feedbacks: Dict[str, FeedbackSubmission] = {}
        self.bug_reports: Dict[str, BugReport] = {}
        self.invites: Dict[str, BetaInvite] = {}
        self.surveys: Dict[str, BetaSurvey] = {}

    # ==================== PROGRAMA BETA ====================

    def create_program(
        self,
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
    ) -> BetaProgram:
        """Criar novo programa beta"""
        program = BetaProgram(
            name=name,
            version=version,
            description=description,
            max_testers=max_testers,
            start_date=start_date,
            end_date=end_date,
            target_features=target_features or [],
            inclusion_criteria=inclusion_criteria or [],
            exclusion_criteria=exclusion_criteria or [],
            rewards_enabled=rewards_enabled,
            reward_description=reward_description
        )
        self.programs[program.id] = program
        return program

    def get_program(self, program_id: str) -> Optional[BetaProgram]:
        """Obter programa por ID"""
        return self.programs.get(program_id)

    def list_programs(self, status: Optional[BetaStatus] = None) -> List[BetaProgram]:
        """Listar programas"""
        programs = list(self.programs.values())
        if status:
            programs = [p for p in programs if p.status == status]
        return sorted(programs, key=lambda x: x.created_at, reverse=True)

    def update_program(
        self,
        program_id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        status: Optional[BetaStatus] = None,
        max_testers: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        target_features: Optional[List[str]] = None,
        rewards_enabled: Optional[bool] = None
    ) -> Optional[BetaProgram]:
        """Atualizar programa"""
        program = self.programs.get(program_id)
        if not program:
            return None

        if name is not None:
            program.name = name
        if description is not None:
            program.description = description
        if status is not None:
            program.status = status
        if max_testers is not None:
            program.max_testers = max_testers
        if start_date is not None:
            program.start_date = start_date
        if end_date is not None:
            program.end_date = end_date
        if target_features is not None:
            program.target_features = target_features
        if rewards_enabled is not None:
            program.rewards_enabled = rewards_enabled

        program.updated_at = datetime.utcnow()
        return program

    def update_program_status(self, program_id: str, status: BetaStatus) -> Optional[BetaProgram]:
        """Atualizar status do programa"""
        return self.update_program(program_id, status=status)

    # ==================== TESTADORES ====================

    def add_tester(
        self,
        user_id: str,
        program_id: str,
        email: str,
        name: str,
        company: Optional[str] = None,
        use_case: Optional[str] = None,
        experience_level: str = "intermediate"
    ) -> BetaTester:
        """Adicionar testador ao programa"""
        tester = BetaTester(
            user_id=user_id,
            program_id=program_id,
            email=email,
            name=name,
            company=company,
            use_case=use_case,
            experience_level=experience_level,
            invited_at=datetime.utcnow(),
            approved_at=datetime.utcnow(),
            status=TesterStatus.APPROVED
        )
        self.testers[tester.id] = tester

        # Atualizar contagem do programa
        program = self.programs.get(program_id)
        if program:
            program.current_testers += 1
            program.updated_at = datetime.utcnow()

        return tester

    def get_tester(self, tester_id: str) -> Optional[BetaTester]:
        """Obter testador por ID"""
        return self.testers.get(tester_id)

    def get_tester_by_email(self, program_id: str, email: str) -> Optional[BetaTester]:
        """Obter testador por email no programa"""
        for tester in self.testers.values():
            if tester.program_id == program_id and tester.email == email:
                return tester
        return None

    def list_testers(
        self,
        program_id: Optional[str] = None,
        status: Optional[TesterStatus] = None
    ) -> List[BetaTester]:
        """Listar testadores"""
        testers = list(self.testers.values())
        if program_id:
            testers = [t for t in testers if t.program_id == program_id]
        if status:
            testers = [t for t in testers if t.status == status]
        return sorted(testers, key=lambda x: x.created_at, reverse=True)

    def update_tester_status(
        self,
        tester_id: str,
        status: TesterStatus
    ) -> Optional[BetaTester]:
        """Atualizar status do testador"""
        tester = self.testers.get(tester_id)
        if not tester:
            return None

        tester.status = status
        if status == TesterStatus.ACTIVE:
            tester.approved_at = datetime.utcnow()
        tester.updated_at = datetime.utcnow()
        return tester

    def remove_tester(self, tester_id: str) -> bool:
        """Remover testador"""
        tester = self.testers.get(tester_id)
        if not tester:
            return False

        # Atualizar contagem do programa
        program = self.programs.get(tester.program_id)
        if program and program.current_testers > 0:
            program.current_testers -= 1

        tester.status = TesterStatus.REMOVED
        tester.updated_at = datetime.utcnow()
        return True

    # ==================== FEEDBACK ====================

    def submit_feedback(
        self,
        tester_id: str,
        program_id: str,
        title: str,
        content: str,
        feature_id: Optional[str] = None,
        severity: FeedbackSeverity = FeedbackSeverity.MEDIUM,
        rating: Optional[int] = None,
        attachments: Optional[List[str]] = None
    ) -> FeedbackSubmission:
        """Submeter feedback"""
        feedback = FeedbackSubmission(
            tester_id=tester_id,
            program_id=program_id,
            feature_id=feature_id,
            title=title,
            content=content,
            severity=severity,
            rating=rating,
            attachments=attachments or []
        )
        self.feedbacks[feedback.id] = feedback

        # Atualizar contador do testador
        tester = self.testers.get(tester_id)
        if tester:
            tester.feedback_count += 1
            tester.updated_at = datetime.utcnow()

        return feedback

    def get_feedback(self, feedback_id: str) -> Optional[FeedbackSubmission]:
        """Obter feedback por ID"""
        return self.feedbacks.get(feedback_id)

    def list_feedback(
        self,
        program_id: Optional[str] = None,
        tester_id: Optional[str] = None,
        status: Optional[FeedbackStatus] = None,
        severity: Optional[FeedbackSeverity] = None
    ) -> List[FeedbackSubmission]:
        """Listar feedbacks"""
        feedbacks = list(self.feedbacks.values())
        if program_id:
            feedbacks = [f for f in feedbacks if f.program_id == program_id]
        if tester_id:
            feedbacks = [f for f in feedbacks if f.tester_id == tester_id]
        if status:
            feedbacks = [f for f in feedbacks if f.status == status]
        if severity:
            feedbacks = [f for f in feedbacks if f.severity == severity]
        return sorted(feedbacks, key=lambda x: x.created_at, reverse=True)

    def update_feedback_status(
        self,
        feedback_id: str,
        status: FeedbackStatus,
        response: Optional[str] = None
    ) -> Optional[FeedbackSubmission]:
        """Atualizar status do feedback"""
        feedback = self.feedbacks.get(feedback_id)
        if not feedback:
            return None

        feedback.status = status
        if response:
            feedback.response = response
            feedback.responded_at = datetime.utcnow()
        feedback.updated_at = datetime.utcnow()
        return feedback

    # ==================== BUG REPORTS ====================

    def report_bug(
        self,
        tester_id: str,
        program_id: str,
        title: str,
        description: str,
        steps_to_reproduce: List[str],
        expected_behavior: str,
        actual_behavior: str,
        severity: FeedbackSeverity = FeedbackSeverity.MEDIUM,
        category: str = "general",
        tags: Optional[List[str]] = None,
        screenshots: Optional[List[str]] = None
    ) -> BugReport:
        """Reportar bug"""
        bug = BugReport(
            tester_id=tester_id,
            program_id=program_id,
            title=title,
            description=description,
            steps_to_reproduce=steps_to_reproduce,
            expected_behavior=expected_behavior,
            actual_behavior=actual_behavior,
            severity=severity,
            category=category,
            tags=tags or [],
            screenshots=screenshots or []
        )
        self.bug_reports[bug.id] = bug

        # Atualizar contador do testador
        tester = self.testers.get(tester_id)
        if tester:
            tester.bug_reports_count += 1
            tester.updated_at = datetime.utcnow()

        return bug

    def get_bug_report(self, bug_id: str) -> Optional[BugReport]:
        """Obter reporte de bug"""
        return self.bug_reports.get(bug_id)

    def list_bug_reports(
        self,
        program_id: Optional[str] = None,
        tester_id: Optional[str] = None,
        status: Optional[BugReportStatus] = None,
        severity: Optional[FeedbackSeverity] = None,
        category: Optional[str] = None
    ) -> List[BugReport]:
        """Listar reportes de bug"""
        bugs = list(self.bug_reports.values())
        if program_id:
            bugs = [b for b in bugs if b.program_id == program_id]
        if tester_id:
            bugs = [b for b in bugs if b.tester_id == tester_id]
        if status:
            bugs = [b for b in bugs if b.status == status]
        if severity:
            bugs = [b for b in bugs if b.severity == severity]
        if category:
            bugs = [b for b in bugs if b.category == category]
        return sorted(bugs, key=lambda x: x.created_at, reverse=True)

    def update_bug_status(
        self,
        bug_id: str,
        status: BugReportStatus,
        assignee: Optional[str] = None,
        fixed_in_version: Optional[str] = None
    ) -> Optional[BugReport]:
        """Atualizar status do bug"""
        bug = self.bug_reports.get(bug_id)
        if not bug:
            return None

        bug.status = status
        if assignee:
            bug.assignee = assignee
        if fixed_in_version:
            bug.fixed_in_version = fixed_in_version
        bug.updated_at = datetime.utcnow()
        return bug

    # ==================== CONVITES ====================

    def create_invite(
        self,
        program_id: str,
        email: str,
        invited_by: str,
        expires_days: int = 7
    ) -> BetaInvite:
        """Criar convite para beta"""
        invite = BetaInvite(
            program_id=program_id,
            email=email,
            invited_by=invited_by,
            expires_at=datetime.utcnow() + timedelta(days=expires_days)
        )
        self.invites[invite.id] = invite
        return invite

    def validate_invite_token(self, token: str) -> Optional[BetaInvite]:
        """Validar token de convite"""
        for invite in self.invites.values():
            if invite.token == token:
                if invite.status == "pending" and invite.expires_at > datetime.utcnow():
                    return invite
        return None

    def accept_invite(self, token: str, user_id: str, name: str) -> Optional[BetaTester]:
        """Aceitar convite"""
        invite = self.validate_invite_token(token)
        if not invite:
            return None

        invite.status = "accepted"
        invite.accepted_at = datetime.utcnow()

        # Criar testador
        tester = self.add_tester(
            user_id=user_id,
            program_id=invite.program_id,
            email=invite.email,
            name=name
        )
        return tester

    # ==================== ENQUETES ====================

    def submit_survey(
        self,
        tester_id: str,
        program_id: str,
        satisfaction: int,
        likelihood_recommend: int,
        likelihood_continue: int,
        ease_of_use: int,
        feature_quality: int,
        support_quality: int,
        comments: Optional[str] = None
    ) -> BetaSurvey:
        """Submeter pesquisa de feedback"""
        survey = BetaSurvey(
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
        self.surveys[survey.id] = survey
        return survey

    def get_surveys(self, program_id: str) -> List[BetaSurvey]:
        """Obter pesquisas de um programa"""
        return [s for s in self.surveys.values() if s.program_id == program_id]

    # ==================== MÉTRICAS ====================

    def get_program_metrics(self, program_id: str) -> Dict[str, Any]:
        """Obter métricas do programa"""
        program = self.programs.get(program_id)
        if not program:
            return {}

        testers = self.list_testers(program_id=program_id)
        feedbacks = self.list_feedback(program_id=program_id)
        bugs = self.list_bug_reports(program_id=program_id)
        surveys = self.get_surveys(program_id)

        active_testers = [t for t in testers if t.status == TesterStatus.ACTIVE]
        critical_bugs = [b for b in bugs if b.severity == FeedbackSeverity.CRITICAL]
        resolved_bugs = [b for b in bugs if b.status == BugReportStatus.CLOSED]

        avg_satisfaction = 0.0
        if surveys:
            avg_satisfaction = sum(s.satisfaction for s in surveys) / len(surveys)

        return {
            "program_id": program_id,
            "program_name": program.name,
            "program_version": program.version,
            "program_status": program.status,
            "total_testers": len(testers),
            "active_testers": len(active_testers),
            "max_testers": program.max_testers,
            "total_feedback": len(feedbacks),
            "total_bugs": len(bugs),
            "critical_bugs": len(critical_bugs),
            "resolved_bugs": len(resolved_bugs),
            "resolution_rate": len(resolved_bugs) / len(bugs) * 100 if bugs else 0,
            "average_satisfaction": avg_satisfaction,
            "period_start": program.start_date,
            "period_end": program.end_date
        }

    def get_tester_metrics(self, tester_id: str) -> Dict[str, Any]:
        """Obter métricas do testador"""
        tester = self.testers.get(tester_id)
        if not tester:
            return {}

        feedbacks = self.list_feedback(tester_id=tester_id)
        bugs = self.list_bug_reports(tester_id=tester_id)

        accepted_feedbacks = [f for f in feedbacks if f.status in [FeedbackStatus.RESOLVED, FeedbackStatus.CLOSED]]

        return {
            "tester_id": tester_id,
            "tester_name": tester.name,
            "email": tester.email,
            "status": tester.status,
            "total_feedback": len(feedbacks),
            "accepted_feedback": len(accepted_feedbacks),
            "total_bugs": len(bugs),
            "feedback_rate": len(feedbacks) / max(tester.feedback_count, 1),
            "acceptance_rate": tester.acceptance_rate,
            "last_active": tester.last_active_at
        }

    # ==================== RELEASE NOTES ====================

    def create_release_note(
        self,
        program_id: str,
        version: str,
        title: str,
        content: str,
        improvements: Optional[List[str]] = None,
        bug_fixes: Optional[List[str]] = None,
        known_issues: Optional[List[str]] = None
    ) -> ReleaseNote:
        """Criar nota de release"""
        note = ReleaseNote(
            program_id=program_id,
            version=version,
            title=title,
            content=content,
            improvements=improvements or [],
            bug_fixes=bug_fixes or [],
            known_issues=known_issues or []
        )
        return note

    def publish_release_note(self, note: ReleaseNote) -> ReleaseNote:
        """Publicar nota de release"""
        note.published_at = datetime.utcnow()
        return note


# Instância global do serviço
beta_service = BetaService()
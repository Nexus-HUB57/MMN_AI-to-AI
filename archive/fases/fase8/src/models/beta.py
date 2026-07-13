"""
Fase 8 - Beta Launch Program
Models for Beta Program Management
"""

from enum import Enum
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
import uuid


class BetaStatus(str, Enum):
    """Status do programa beta"""
    PLANNING = "planning"
    OPEN = "open"
    CLOSED = "closed"
    EVALUATING = "evaluating"
    COMPLETED = "completed"


class TesterStatus(str, Enum):
    """Status do testador beta"""
    PENDING = "pending"
    APPROVED = "approved"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    REMOVED = "removed"


class FeedbackSeverity(str, Enum):
    """Severidade do feedback"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    SUGGESTION = "suggestion"


class FeedbackStatus(str, Enum):
    """Status do feedback"""
    SUBMITTED = "submitted"
    ACKNOWLEDGED = "acknowledged"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class BugReportStatus(str, Enum):
    """Status do reporte de bug"""
    REPORTED = "reported"
    TRIAGED = "triaged"
    ASSIGNED = "assigned"
    IN_REVIEW = "in_review"
    FIXED = "fixed"
    VERIFIED = "verified"
    CLOSED = "closed"
    WONT_FIX = "wont_fix"


class BetaProgram(BaseModel):
    """Programa Beta"""
    id: str = Field(default_factory=lambda: f"beta_{uuid.uuid4().hex[:16]}")
    name: str
    version: str
    description: str
    status: BetaStatus = BetaStatus.PLANNING
    max_testers: int = 100
    current_testers: int = 0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    target_features: List[str] = []
    inclusion_criteria: List[str] = []
    exclusion_criteria: List[str] = []
    rewards_enabled: bool = False
    reward_description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BetaTester(BaseModel):
    """Testador Beta"""
    id: str = Field(default_factory=lambda: f"tester_{uuid.uuid4().hex[:16]}")
    user_id: str
    program_id: str
    status: TesterStatus = TesterStatus.PENDING
    email: str
    name: str
    company: Optional[str] = None
    use_case: Optional[str] = None
    experience_level: str = "intermediate"  # beginner, intermediate, advanced
    invited_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    last_active_at: Optional[datetime] = None
    feedback_count: int = 0
    bug_reports_count: int = 0
    acceptance_rate: float = 0.0
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class FeedbackSubmission(BaseModel):
    """Submissão de Feedback"""
    id: str = Field(default_factory=lambda: f"fb_{uuid.uuid4().hex[:16]}")
    tester_id: str
    program_id: str
    feature_id: Optional[str] = None
    title: str
    content: str
    severity: FeedbackSeverity = FeedbackSeverity.MEDIUM
    status: FeedbackStatus = FeedbackStatus.SUBMITTED
    rating: Optional[int] = Field(default=None, ge=1, le=5)  # 1-5 rating
    attachments: List[str] = []
    response: Optional[str] = None
    responded_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BugReport(BaseModel):
    """Reporte de Bug"""
    id: str = Field(default_factory=lambda: f"bug_{uuid.uuid4().hex[:16]}")
    tester_id: str
    program_id: str
    title: str
    description: str
    steps_to_reproduce: List[str] = []
    expected_behavior: str
    actual_behavior: str
    severity: FeedbackSeverity = FeedbackSeverity.MEDIUM
    status: BugReportStatus = BugReportStatus.REPORTED
    category: str = "general"  # ui, api, performance, security, other
    tags: List[str] = []
    screenshots: List[str] = []
    assignee: Optional[str] = None
    fixed_in_version: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BetaInvite(BaseModel):
    """Convite para Beta"""
    id: str = Field(default_factory=lambda: f"invite_{uuid.uuid4().hex[:16]}")
    program_id: str
    email: str
    token: str = Field(default_factory=lambda: uuid.uuid4().hex)
    invited_by: str
    status: str = "pending"  # pending, accepted, expired
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    accepted_at: Optional[datetime] = None


class BetaMetrics(BaseModel):
    """Métricas do Programa Beta"""
    program_id: str
    total_testers: int = 0
    active_testers: int = 0
    total_feedback: int = 0
    total_bugs: int = 0
    critical_bugs: int = 0
    resolved_issues: int = 0
    average_satisfaction: float = 0.0
    completion_rate: float = 0.0
    retention_rate: float = 0.0
    period_start: datetime
    period_end: datetime


class FeatureAdoption(BaseModel):
    """Adoção de Feature"""
    id: str = Field(default_factory=lambda: f"feat_{uuid.uuid4().hex[:16]}")
    program_id: str
    feature_name: str
    tester_id: str
    used: bool = False
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ReleaseNote(BaseModel):
    """Nota de Release"""
    id: str = Field(default_factory=lambda: f"rel_{uuid.uuid4().hex[:16]}")
    program_id: str
    version: str
    title: str
    content: str
    improvements: List[str] = []
    bug_fixes: List[str] = []
    known_issues: List[str] = []
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class BetaSurvey(BaseModel):
    """Pesquisa de Feedback"""
    id: str = Field(default_factory=lambda: f"survey_{uuid.uuid4().hex[:16]}")
    tester_id: str
    program_id: str
    satisfaction: int = Field(ge=1, le=5)
    likelihood_recommend: int = Field(ge=1, le=10)
    likelihood_continue: int = Field(ge=1, le=10)
    ease_of_use: int = Field(ge=1, le=5)
    feature_quality: int = Field(ge=1, le=5)
    support_quality: int = Field(ge=1, le=5)
    comments: Optional[str] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
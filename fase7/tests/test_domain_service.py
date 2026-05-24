"""
Testes para Domain Service

Autor: Nexus-HUB57
Versão: 1.1.0 - Sprint 3 Domain Management
"""

import pytest
import uuid
from fase7.src.services.domain_service import DomainService
from fase7.src.models.domain import (
    DomainCreateRequest, DomainType, VerificationStatus
)


class TestDomainService:
    """Suite de testes para DomainService"""

    @pytest.fixture
    def service(self):
        """Fixture que cria uma instância do serviço"""
        return DomainService()

    @pytest.fixture
    def instance_id(self):
        """Fixture com ID de instância mock"""
        return "inst_test_123"

    def test_add_domain_success(self, service, instance_id):
        """Testa adição bem-sucedida de domínio"""
        data = DomainCreateRequest(
            domain="plataforma.empresa.com",
            type="alias",
            ssl_enabled=True
        )

        domain = service.add_domain(instance_id, data)

        assert domain is not None
        assert domain.domain == "plataforma.empresa.com"
        assert domain.instance_id == instance_id
        assert domain.domain_type == DomainType.ALIAS
        assert domain.ssl_enabled is True
        assert domain.verification_status == VerificationStatus.PENDING

    def test_add_domain_duplicate_raises(self, service, instance_id):
        """Testa que adicionar domínio duplicado levanta exceção"""
        data = DomainCreateRequest(
            domain="duplicado.com",
            type="alias"
        )

        service.add_domain(instance_id, data)

        with pytest.raises(ValueError, match="já está cadastrado"):
            service.add_domain(instance_id, data)

    def test_add_domain_case_insensitive(self, service, instance_id):
        """Testa que domínios são case-insensitive"""
        data1 = DomainCreateRequest(domain="CaSeTeSt.com", type="alias")
        data2 = DomainCreateRequest(domain="casetest.com", type="alias")

        service.add_domain(instance_id, data1)

        with pytest.raises(ValueError, match="já está cadastrado"):
            service.add_domain(instance_id, data2)

    def test_get_domains_by_instance(self, service, instance_id):
        """Testa listagem de domínios por instância"""
        data1 = DomainCreateRequest(domain="dominio1.com", type="primary")
        data2 = DomainCreateRequest(domain="dominio2.com", type="alias")

        service.add_domain(instance_id, data1)
        service.add_domain(instance_id, data2)

        domains = service.get_domains(instance_id)

        assert len(domains) == 2
        assert any(d.domain == "dominio1.com" for d in domains)
        assert any(d.domain == "dominio2.com" for d in domains)

    def test_get_domains_wrong_instance(self, service, instance_id):
        """Testa que não retorna domínios de outras instâncias"""
        data = DomainCreateRequest(domain="test.com", type="alias")
        service.add_domain(instance_id, data)

        other_domains = service.get_domains("outra_instancia")
        assert len(other_domains) == 0

    def test_remove_domain_success(self, service, instance_id):
        """Testa remoção bem-sucedida de domínio"""
        data = DomainCreateRequest(domain="remover.com", type="alias")
        domain = service.add_domain(instance_id, data)

        result = service.remove_domain(instance_id, domain.id)

        assert result is True
        assert len(service.get_domains(instance_id)) == 0

    def test_remove_domain_not_found(self, service, instance_id):
        """Testa remoção de domínio inexistente"""
        result = service.remove_domain(instance_id, "id_inexistente")
        assert result is False

    def test_verify_domain_success(self, service, instance_id):
        """Testa verificação de domínio"""
        data = DomainCreateRequest(domain="verificar.com", type="alias")
        domain = service.add_domain(instance_id, data)

        response = service.verify_domain(instance_id, domain.id)

        assert response is not None
        assert response.domain == "verificar.com"
        assert response.verification_status == VerificationStatus.VERIFYING
        assert "cname" in response.dns_records

    def test_confirm_verification(self, service, instance_id):
        """Testa confirmação de verificação"""
        data = DomainCreateRequest(domain="confirmar.com", type="alias")
        domain = service.add_domain(instance_id, data)

        confirmed = service.confirm_verification(domain.id)

        assert confirmed is not None
        assert confirmed.verification_status == VerificationStatus.VERIFIED
        assert confirmed.verified_at is not None

    def test_fail_verification(self, service, instance_id):
        """Testa marcação de verificação como falhada"""
        data = DomainCreateRequest(domain="falhar.com", type="alias")
        domain = service.add_domain(instance_id, data)

        failed = service.fail_verification(domain.id, "DNS não propagou")

        assert failed is not None
        assert failed.verification_status == VerificationStatus.FAILED

    def test_validate_domain_format_valid(self, service):
        """Testa validação de domínios válidos"""
        valid_domains = [
            "example.com",
            "sub.example.com",
            "plataforma.empresa.com.br",
            "my-app.io",
            "test123.domain.net"
        ]

        for domain in valid_domains:
            assert service.validate_domain_format(domain) is True

    def test_validate_domain_format_invalid(self, service):
        """Testa validação de domínios inválidos"""
        invalid_domains = [
            "invalid",
            "no-tld.com.",
            "-startswith.com",
            "endswith-.com",
            "",
            "a" * 64 + ".com"
        ]

        for domain in invalid_domains:
            assert service.validate_domain_format(domain) is False

    def test_get_ssl_certificate_status_pending(self, service, instance_id):
        """Testa status SSL para domínio não verificado"""
        data = DomainCreateRequest(domain="sslpending.com", type="alias")
        service.add_domain(instance_id, data)

        status = service.get_ssl_certificate_status("sslpending.com")

        assert status["ssl_enabled"] is True
        assert status["certificate_status"] == "pending"
        assert status["issuer"] == "Let's Encrypt"

    def test_get_ssl_certificate_status_valid(self, service, instance_id):
        """Testa status SSL para domínio verificado"""
        data = DomainCreateRequest(domain="sslvalid.com", type="alias", ssl_enabled=True)
        domain = service.add_domain(instance_id, data)
        service.confirm_verification(domain.id)

        status = service.get_ssl_certificate_status("sslvalid.com")

        assert status["certificate_status"] == "valid"
        assert status["auto_renew"] is True

    def test_get_verification_instructions(self, service, instance_id):
        """Testa geração de instruções de verificação"""
        data = DomainCreateRequest(domain="instrucoes.com", type="alias")
        service.add_domain(instance_id, data)

        instructions = service.get_verification_instructions("instrucoes.com")

        assert "instrucoes.com" in instructions
        assert "CNAME" in instructions
        assert "TXT" in instructions
        assert "passo" in instructions.lower()

    def test_get_dns_records_for_domain(self, service, instance_id):
        """Testa retorno de registros DNS"""
        data = DomainCreateRequest(domain="dnsrecords.com", type="alias")
        domain = service.add_domain(instance_id, data)

        records = service.get_dns_records_for_domain(domain)

        assert len(records) >= 1
        assert any(r.type == "CNAME" for r in records)

    def test_get_proxy_config(self, service, instance_id):
        """Testa configuração de proxy reverso"""
        data = DomainCreateRequest(domain="proxy.com", type="alias", ssl_enabled=True)
        domain = service.add_domain(instance_id, data)

        config = service.get_proxy_config(domain)

        assert config["enabled"] is True
        assert config["ssl_enabled"] is True
        assert config["ssl_provider"] == "lets_encrypt"
        assert config["ssl_auto_renew"] is True

    def test_get_domain_preview(self, service, instance_id):
        """Testa geração de preview do domínio"""
        data = DomainCreateRequest(domain="preview.com", type="alias")
        domain = service.add_domain(instance_id, data)

        preview = service.get_domain_preview(domain)

        assert "domain" in preview
        assert "ssl" in preview
        assert "dns_records" in preview
        assert "proxy" in preview
        assert "next_steps" in preview
        assert preview["domain"]["name"] == "preview.com"

    def test_get_all_pending_verifications(self, service, instance_id):
        """Testa listagem de verificações pendentes"""
        data1 = DomainCreateRequest(domain="pending1.com", type="alias")
        data2 = DomainCreateRequest(domain="pending2.com", type="alias")

        service.add_domain(instance_id, data1)
        service.add_domain(instance_id, data2)

        pending = service.get_all_pending_verifications()

        assert len(pending) == 2
        assert all(d.verification_status == VerificationStatus.PENDING for d in pending)

    def test_get_domains_by_status(self, service, instance_id):
        """Testa filtro de domínios por status"""
        data = DomainCreateRequest(domain="status.com", type="alias")
        domain = service.add_domain(instance_id, data)

        service.confirm_verification(domain.id)

        verified = service.get_domains_by_status(VerificationStatus.VERIFIED)
        pending = service.get_domains_by_status(VerificationStatus.PENDING)

        assert len(verified) == 1
        assert verified[0].domain == "status.com"
        assert len(pending) == 0


class TestDomainValidation:
    """Testes de validação de domínios"""

    @pytest.fixture
    def service(self):
        return DomainService()

    def test_domain_with_subdomain(self, service, instance_id):
        """Testa domínio com múltiplos subdomínios"""
        data = DomainCreateRequest(domain="app.plataforma.empresa.com", type="alias")
        domain = service.add_domain(instance_id, data)

        assert domain.domain == "app.plataforma.empresa.com"
        assert service.validate_domain_format("app.plataforma.empresa.com")

    def test_internationalized_domain(self, service, instance_id):
        """Testa comportamento com domínio internacionalizado (punycode seria necessário)"""
        # Domínios IDN precisam de punycode para validação real
        # Aqui testamos o comportamento atual
        data = DomainCreateRequest(domain="xn--n3h.com", type="alias")
        domain = service.add_domain(instance_id, data)

        # Aceita formato punycode
        assert service.validate_domain_format("xn--n3h.com") is True


# Fixture para instance_id em todo o módulo
@pytest.fixture
def instance_id():
    """ID de instância mock para todos os testes"""
    return "inst_test_module_123"
from rest_framework import status
from rest_framework.test import APITestCase
from apps.veiculos.models import Veiculo
from apps.concessionaria.models import Ocorrencia
from apps.ordens.models import Servico, Autorizacao
from apps.workflow.models import VistoriaQualidade, ProcessoLavagem

class FluxoCompletoV2Test(APITestCase):
    def test_ciclo_operacional_v2(self):
        # 1. Veículo chega na Loja (Ex: Gran Via)
        veiculo = Veiculo.objects.create(
            placa="ABC-1234", marca_modelo="Onix", loja="GRAN_VIA", status="AVALIADOR"
        )
        self.assertEqual(veiculo.loja, "GRAN_VIA")

        # 2. Avaliador registra ocorrência e envia para Oficina
        ocorrencia = Ocorrencia.objects.create(
            descricao="Para-choque arranhado", setor_solicitante="Avaliador", veiculo_relacionado=veiculo.placa
        )
        veiculo.status = "OFICINA"
        veiculo.save()
        self.assertEqual(veiculo.status, "OFICINA")

        # 3. Oficina механік cria serviço dependente de autorização
        servico = Servico.objects.create(
            veiculo=veiculo, descricao="Pintura de para-choque", precisa_autorizacao=True
        )
        
        # 4. Administrativo aprova o serviço
        autorizacao = Autorizacao.objects.create(servico=servico, status="APROVADA")
        servico.status = "AUTORIZADO"
        servico.save()
        self.assertEqual(autorizacao.status, "APROVADA")

        # 5. Qualidade Pós-Oficina aprova o serviço executado
        vistoria = VistoriaQualidade.objects.create(
            veiculo=veiculo, etapa="POS_OFICINA", resultado="APROVADO", observacoes="Serviço perfeito"
        )
        veiculo.status = "LAVAGEM"
        veiculo.save()

        # 6. Processo de Lavagem
        lavagem = ProcessoLavagem.objects.create(veiculo=veiculo, status="CONCLUIDO")
        
        # 7. Qualidade Final libera para o Showroom / Loja
        vistoria_final = VistoriaQualidade.objects.create(
            veiculo=veiculo, etapa="FINAL", resultado="APROVADO", observacoes="Pronto para entrega"
        )
        veiculo.status = "SHOWROOM"
        veiculo.save()

        self.assertEqual(veiculo.status, "SHOWROOM")
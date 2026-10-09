from rest_framework.test import APITestCase
from apps.veiculos.models import Veiculo
from apps.concessionaria.models import Ocorrencia
from apps.ordens.models import Servico, Autorizacao
from apps.workflow.models import VistoriaQualidade, ProcessoLavagem

class FluxoCompletoV2Test(APITestCase):
    def test_ciclo_operacional_v2(self):
        # 1. Veículo chega na Loja
        veiculo = Veiculo.objects.create(
            placa="ABC-1234", marca_modelo="Onix", loja="GRAN_VIA", status="AVALIADOR"
        )
        self.assertEqual(veiculo.loja, "GRAN_VIA")

        # 2. Avaliador registra ocorrência usando chave estrangeira real
        ocorrencia = Ocorrencia.objects.create(
            veiculo=veiculo, origem="AVALIADOR", descricao="Para-choque arranhado"
        )
        veiculo.status = "OFICINA"
        veiculo.save()
        self.assertEqual(veiculo.status, "OFICINA")

        # 3. Oficina cria serviço
        servico = Servico.objects.create(
            veiculo=veiculo, descricao="Pintura de para-choque", precisa_autorizacao=True
        )
        
        # 4. Administrativo aprova
        autorizacao = Autorizacao.objects.create(servico=servico, status="APROVADA")
        servico.status = "AUTORIZADO"
        servico.save()
        self.assertEqual(autorizacao.status, "APROVADA")

        # 5. Qualidade Pós-Oficina
        vistoria = VistoriaQualidade.objects.create(
            veiculo=veiculo, etapa="POS_OFICINA", resultado="APROVADO", observacoes="Perfeito"
        )
        veiculo.status = "LAVAGEM"
        veiculo.save()

        # 6. Lavagem
        lavagem = ProcessoLavagem.objects.create(veiculo=veiculo, status="CONCLUIDO")
        
        # 7. Qualidade Final e Showroom
        vistoria_final = VistoriaQualidade.objects.create(
            veiculo=veiculo, etapa="FINAL", resultado="APROVADO", observacoes="Pronto"
        )
        veiculo.status = "SHOWROOM"
        veiculo.save()

        self.assertEqual(veiculo.status, "SHOWROOM")
from rest_framework.test import APITestCase
from apps.veiculos.models import Veiculo, CicloVeiculo # <-- Importação do Ciclo adicionada
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

        # 🚀 CORREÇÃO 1: Criação obrigatória do Ciclo Operacional
        ciclo = CicloVeiculo.objects.create(
            veiculo=veiculo, numero_ciclo=1, ativo=True
        )

        # 2. Avaliador registra ocorrência usando chave estrangeira real
        ocorrencia = Ocorrencia.objects.create(
            veiculo=veiculo, origem="AVALIADOR", descricao="Para-choque arranhado"
        )
        veiculo.status = "OFICINA"
        veiculo.save()
        self.assertEqual(veiculo.status, "OFICINA")

        # 3. Oficina cria serviço 
        # 🚀 CORREÇÃO 2: Serviço agora exige o parâmetro ciclo=ciclo
        servico = Servico.objects.create(
            veiculo=veiculo, ciclo=ciclo, descricao="Pintura de para-choque", precisa_autorizacao=True
        )
        
        # 4. Administrativo aprova
        autorizacao = Autorizacao.objects.create(servico=servico, status="APROVADA")
        servico.status = "AUTORIZADO"
        servico.save()
        self.assertEqual(autorizacao.status, "APROVADA")

        # 5. Qualidade Pós-Oficina
        vistoria = VistoriaQualidade.objects.create(
            veiculo=veiculo,
            ciclo=ciclo, # Já estava aqui, mas agora a variável existe
            etapa='POS_OFICINA',
            resultado='APROVADO',
            observacoes='Perfeito'
        )

        veiculo.status = "LAVAGEM"
        veiculo.save()

        # 6. Lavagem
        # 🚀 CORREÇÃO 3: ProcessoLavagem perdeu o campo 'veiculo' na refatoração, agora é apenas 'ciclo'
        lavagem = ProcessoLavagem.objects.create(ciclo=ciclo, status="CONCLUIDO")
        
        # 7. Qualidade Final e Showroom
        # 🚀 CORREÇÃO 4: Vistoria Final também exige o ciclo=ciclo
        vistoria_final = VistoriaQualidade.objects.create(
            veiculo=veiculo, ciclo=ciclo, etapa="FINAL", resultado="APROVADO", observacoes="Pronto"
        )
        veiculo.status = "SHOWROOM"
        veiculo.save()

        self.assertEqual(veiculo.status, "SHOWROOM")
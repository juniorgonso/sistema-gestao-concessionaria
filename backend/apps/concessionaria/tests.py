from rest_framework import status
from rest_framework.test import APITestCase
from apps.veiculos.models import Veiculo
from apps.concessionaria.models import Ocorrencia, Unidade, Concessionaria

class EquipeBTests(APITestCase):
    def setUp(self):
        self.concessionaria = Concessionaria.objects.create(nome="Grupo Via 1", cnpj="12345678000199")
        self.unidade = Unidade.objects.create(concessionaria=self.concessionaria, nome="Piedade")
        self.veiculo = Veiculo.objects.create(placa="XYZ-9876", marca_modelo="Compass", loja="PIEDADE", status="AVALIADOR")
        self.ocorrencias_url = '/api/v1/concessionaria/ocorrencias/'

    def test_criar_ocorrencia_v2(self):
        data = {
            "veiculo": self.veiculo.id,
            "origem": "AVALIADOR",
            "descricao": "Pneu furado e riscos na lateral"
        }
        response = self.client.post(self.ocorrencias_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ocorrencia.objects.count(), 1)
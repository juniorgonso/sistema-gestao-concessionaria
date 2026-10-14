"""Testes de regressão para rodar com: python manage.py test apps.veiculos.test_minha_oficina"""
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework.test import APITestCase

from apps.accounts.models import Funcao, Funcionario
from apps.concessionaria.models import Concessionaria, Unidade
from apps.veiculos.models import Veiculo


class MinhaOficinaTests(APITestCase):
    def setUp(self):
        grupo, _ = Group.objects.get_or_create(name='Oficina')
        empresa = Concessionaria.objects.create(nome='Rede teste', cnpj='00000000000001')
        self.piedade = Unidade.objects.create(
            concessionaria=empresa, nome='Piedade', codigo_loja='PIEDADE'
        )
        self.eurovia = Unidade.objects.create(
            concessionaria=empresa, nome='Eurovia', codigo_loja='EUROVIA'
        )
        funcao = Funcao.objects.create(nome='Mecânico')
        self.neto = get_user_model().objects.create_user(username='neto_teste', password='senha')
        self.neto.groups.add(grupo)
        Funcionario.objects.create(
            usuario=self.neto, nome='Neto', concessionaria=empresa,
            unidade=self.piedade, funcao=funcao, ativo=True
        )
        self.carlos = get_user_model().objects.create_user(username='carlos_teste', password='senha')
        self.carlos.groups.add(grupo)
        Funcionario.objects.create(
            usuario=self.carlos, nome='Carlos', concessionaria=empresa,
            unidade=self.eurovia, funcao=funcao, ativo=True
        )
        self.carro_piedade = Veiculo.objects.create(
            placa='PDT1234', marca_modelo='Teste Piedade', loja='PIEDADE', status='OFICINA'
        )
        self.carro_eurovia = Veiculo.objects.create(
            placa='EUR1234', marca_modelo='Teste Eurovia', loja='EUROVIA', status='OFICINA'
        )

    def test_neto_ve_apenas_piedade(self):
        self.client.force_authenticate(user=self.neto)
        response = self.client.get('/api/v1/veiculos/minha-oficina/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['unidade']['codigo_loja'], 'PIEDADE')
        self.assertEqual([v['id'] for v in response.data['veiculos']], [self.carro_piedade.id])

    def test_eurovia_ve_apenas_eurovia(self):
        self.client.force_authenticate(user=self.carlos)
        response = self.client.get('/api/v1/veiculos/minha-oficina/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([v['id'] for v in response.data['veiculos']], [self.carro_eurovia.id])

    def test_mecanico_nao_consulta_ou_edita_veiculo_de_outra_loja(self):
        self.client.force_authenticate(user=self.neto)
        endpoint = f'/api/v1/veiculos/lista/{self.carro_eurovia.pk}/'
        self.assertEqual(self.client.get(endpoint).status_code, 404)
        self.assertEqual(
            self.client.patch(endpoint, {'status_oficina': 'APROVADO'}, format='json').status_code,
            404,
        )

    def test_sem_autenticacao(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/v1/veiculos/minha-oficina/')
        self.assertEqual(response.status_code, 401)

    def test_sem_codigo_loja_falha_sem_cair_na_eurovia(self):
        self.piedade.codigo_loja = None
        self.piedade.save(update_fields=['codigo_loja'])
        self.client.force_authenticate(user=self.neto)
        response = self.client.get('/api/v1/veiculos/minha-oficina/')
        self.assertEqual(response.status_code, 403)

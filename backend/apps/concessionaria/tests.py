from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.contenttypes.models import ContentType
from .models import Fornecedor, DemandaExterna, Ocorrencia, EvidenciaFoto

User = get_user_model()

class EquipeBTests(APITestCase):
    def setUp(self):
        # 1. Configuração do utilizador e autenticação para os testes
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.force_authenticate(user=self.user)

        # 2. Caminhos exatos da nossa API
        self.demandas_url = '/api/v1/concessionaria/demandas-externas/'
        self.fornecedores_url = '/api/v1/concessionaria/fornecedores/'
        self.ocorrencias_url = '/api/v1/concessionaria/ocorrencias/'
        self.evidencias_url = '/api/v1/concessionaria/evidencias/'

    def test_criar_fornecedor(self):
        """Testa se o endpoint cria um fornecedor corretamente"""
        data = {'nome_fantasia': 'Oficina do João', 'tipo_servico': 'Mecânica'}
        response = self.client.post(self.fornecedores_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Fornecedor.objects.count(), 1)

    def test_fila_demandas_fifo_ordenacao(self):
        """Testa se a fila de demandas retorna a ordem correta (mais recentes primeiro)"""
        DemandaExterna.objects.create(titulo="Demanda Antiga", descricao="Teste 1", tipo="Busca", solicitante=self.user)
        DemandaExterna.objects.create(titulo="Demanda Nova", descricao="Teste 2", tipo="Entrega", solicitante=self.user)

        response = self.client.get(self.demandas_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Como a ordenação é '-criado_em', a "Demanda Nova" deve ser o primeiro item da lista
        primeiro_item = response.data[0]['titulo'] if isinstance(response.data, list) else response.data['results'][0]['titulo']
        self.assertEqual(primeiro_item, "Demanda Nova")

    def test_upload_evidencia_foto(self):
        """Testa o endpoint de upload de imagens e validação de vínculo genérico"""
        # Bytes de um GIF real de 1x1 pixel para passar na validação do Pillow
        gif_valido = (
            b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x05\x04\x04'
            b'\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44'
            b'\x01\x00\x3b'
        )
        foto_simulada = SimpleUploadedFile(name='teste.gif', content=gif_valido, content_type='image/gif')
        content_type = ContentType.objects.get_for_model(User)
        
        data = {
            'imagem': foto_simulada,
            'content_type': content_type.id,
            'object_id': self.user.id
        }
        response = self.client.post(self.evidencias_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EvidenciaFoto.objects.count(), 1)

    def test_criar_ocorrencia(self):
        """Testa a criação de ocorrências vinculadas aos setores"""
        data = {'descricao': 'Pneu furado', 'setor_solicitante': 'Oficina', 'status': 'PENDENTE'}
        response = self.client.post(self.ocorrencias_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ocorrencia.objects.count(), 1)
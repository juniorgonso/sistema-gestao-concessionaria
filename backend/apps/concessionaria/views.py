from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Fornecedor, DemandaExterna, EvidenciaFoto, Ocorrencia
from .serializers import FornecedorSerializer, DemandaExternaSerializer, EvidenciaFotoSerializer, OcorrenciaSerializer

class FornecedorViewSet(viewsets.ModelViewSet):
    queryset = Fornecedor.objects.all()
    serializer_class = FornecedorSerializer
    permission_classes = [permissions.AllowAny] # Alterado para testes do Mobile
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ativo', 'tipo_servico']

class DemandaExternaViewSet(viewsets.ModelViewSet):
    queryset = DemandaExterna.objects.all().order_by('-criado_em')
    serializer_class = DemandaExternaSerializer
    permission_classes = [permissions.AllowAny] # Alterado para testes do Mobile
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'prioridade', 'responsavel']

    def perform_create(self, serializer):
        # Evita erro se o utilizador for anónimo no teste
        if self.request.user.is_authenticated:
            serializer.save(solicitante=self.request.user)
        else:
            serializer.save()

class EvidenciaFotoViewSet(viewsets.ModelViewSet):
    queryset = EvidenciaFoto.objects.all()
    serializer_class = EvidenciaFotoSerializer
    permission_classes = [permissions.AllowAny] # Alterado para testes do Mobile

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(autor=self.request.user)
        else:
            serializer.save()

class OcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = Ocorrencia.objects.all().order_by('-criado_em')
    serializer_class = OcorrenciaSerializer
    permission_classes = [permissions.AllowAny] # Alterado para testes do Mobile
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'setor_solicitante', 'veiculo_relacionado']
from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Concessionaria, Unidade, Setor, Fornecedor, Ocorrencia, DemandaExterna, EvidenciaFoto
from .serializers import (
    ConcessionariaSerializer, UnidadeSerializer, SetorSerializer,
    FornecedorSerializer, OcorrenciaSerializer, DemandaExternaSerializer, EvidenciaFotoSerializer
)

class ConcessionariaViewSet(viewsets.ModelViewSet):
    queryset = Concessionaria.objects.all()
    serializer_class = ConcessionariaSerializer
    permission_classes = [permissions.AllowAny]

class UnidadeViewSet(viewsets.ModelViewSet):
    queryset = Unidade.objects.all()
    serializer_class = UnidadeSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['concessionaria']

class SetorViewSet(viewsets.ModelViewSet):
    queryset = Setor.objects.all()
    serializer_class = SetorSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['unidade']

class FornecedorViewSet(viewsets.ModelViewSet):
    queryset = Fornecedor.objects.all()
    serializer_class = FornecedorSerializer
    permission_classes = [permissions.AllowAny]

class OcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = Ocorrencia.objects.all()
    serializer_class = OcorrenciaSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['veiculo', 'origem', 'status']

class DemandaExternaViewSet(viewsets.ModelViewSet):
    queryset = DemandaExterna.objects.all()
    serializer_class = DemandaExternaSerializer
    permission_classes = [permissions.AllowAny]

class EvidenciaFotoViewSet(viewsets.ModelViewSet):
    queryset = EvidenciaFoto.objects.all()
    serializer_class = EvidenciaFotoSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ocorrencia']
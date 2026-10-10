from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Veiculo, CicloVeiculo
from .serializers import VeiculoSerializer, CicloVeiculoSerializer

class VeiculoViewSet(viewsets.ModelViewSet):
    queryset = Veiculo.objects.all()
    serializer_class = VeiculoSerializer
    permission_classes = [permissions.IsAuthenticated] # Blindado!
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['loja', 'status', 'placa']

class CicloVeiculoViewSet(viewsets.ModelViewSet):
    queryset = CicloVeiculo.objects.all()
    serializer_class = CicloVeiculoSerializer
    permission_classes = [permissions.IsAuthenticated] # Blindado!
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['veiculo', 'ativo', 'numero_ciclo']
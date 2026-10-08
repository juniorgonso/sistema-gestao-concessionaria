from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Veiculo
from .serializers import VeiculoSerializer

class VeiculoViewSet(viewsets.ModelViewSet):
    queryset = Veiculo.objects.all()
    serializer_class = VeiculoSerializer
    permission_classes = [permissions.AllowAny] # Aberto para testes mobile
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['loja', 'status', 'placa']
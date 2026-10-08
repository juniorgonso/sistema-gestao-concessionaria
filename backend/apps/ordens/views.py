from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Servico, Autorizacao
from .serializers import ServicoSerializer, AutorizacaoSerializer

class ServicoViewSet(viewsets.ModelViewSet):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    permission_classes = [permissions.AllowAny] # Aberto para agilizar nossos testes
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'veiculo', 'precisa_autorizacao']

class AutorizacaoViewSet(viewsets.ModelViewSet):
    queryset = Autorizacao.objects.all()
    serializer_class = AutorizacaoSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'servico']
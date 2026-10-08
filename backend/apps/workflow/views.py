from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import VistoriaQualidade, ProcessoLavagem
from .serializers import VistoriaQualidadeSerializer, ProcessoLavagemSerializer

class VistoriaQualidadeViewSet(viewsets.ModelViewSet):
    queryset = VistoriaQualidade.objects.all()
    serializer_class = VistoriaQualidadeSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['etapa', 'resultado', 'veiculo']

class ProcessoLavagemViewSet(viewsets.ModelViewSet):
    queryset = ProcessoLavagem.objects.all()
    serializer_class = ProcessoLavagemSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'veiculo']
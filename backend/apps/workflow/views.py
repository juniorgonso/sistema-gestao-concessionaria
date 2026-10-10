from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import VistoriaQualidade, ProcessoLavagem, HistoricoEvento
from .serializers import VistoriaQualidadeSerializer, ProcessoLavagemSerializer

class VistoriaQualidadeViewSet(viewsets.ModelViewSet):
    queryset = VistoriaQualidade.objects.all()
    serializer_class = VistoriaQualidadeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['etapa', 'resultado', 'veiculo', 'ciclo']

    # O "Olho que Tudo Vê" para a Criação
    def perform_create(self, serializer):
        vistoria = serializer.save() # Guarda a vistoria primeiro
        
        # Gera a auditoria automaticamente, sem o frontend saber
        HistoricoEvento.objects.create(
            veiculo=vistoria.veiculo,
            ciclo=vistoria.ciclo,
            tipo_evento="VISTORIA_REGISTRADA",
            descricao=f"Vistoria {vistoria.get_etapa_display()} finalizada com resultado: {vistoria.get_resultado_display()}.",
            autor=str(self.request.user) # Puxa o utilizador direto do Token JWT
        )

    # O "Olho que Tudo Vê" para a Atualização
    def perform_update(self, serializer):
        vistoria = serializer.save()
        
        HistoricoEvento.objects.create(
            veiculo=vistoria.veiculo,
            ciclo=vistoria.ciclo,
            tipo_evento="VISTORIA_ATUALIZADA",
            descricao=f"Vistoria {vistoria.get_etapa_display()} reavaliada para: {vistoria.get_resultado_display()}.",
            autor=str(self.request.user)
        )

class ProcessoLavagemViewSet(viewsets.ModelViewSet):
    queryset = ProcessoLavagem.objects.select_related(
        'ciclo',
        'ciclo__veiculo'
    ).all()
    serializer_class = ProcessoLavagemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'ciclo']

    def perform_create(self, serializer):
        lavagem = serializer.save()
        
        HistoricoEvento.objects.create(
            veiculo=lavagem.ciclo.veiculo, # Navega do ciclo até ao veículo com segurança
            ciclo=lavagem.ciclo,
            tipo_evento="LAVAGEM_CRIADA",
            descricao="Veículo inserido na fila de lavagem.",
            autor=str(self.request.user)
        )

    def perform_update(self, serializer):
        lavagem = serializer.save()
        
        HistoricoEvento.objects.create(
            veiculo=lavagem.ciclo.veiculo,
            ciclo=lavagem.ciclo,
            tipo_evento="LAVAGEM_STATUS_ALTERADO",
            descricao=f"Status da lavagem alterado para: {lavagem.get_status_display()}.",
            autor=str(self.request.user)
        )
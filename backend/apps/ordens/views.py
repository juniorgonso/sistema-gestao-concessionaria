from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Servico, Autorizacao
from .serializers import ServicoSerializer, AutorizacaoSerializer
from apps.workflow.models import HistoricoEvento  # O nosso "Olho que Tudo Vê"

class ServicoViewSet(viewsets.ModelViewSet):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    permission_classes = [permissions.IsAuthenticated] # Cofre Trancado
    # Adicionámos o 'ciclo' aos filtros para o mobile conseguir procurar corretamente
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'veiculo', 'ciclo', 'precisa_autorizacao']

    def perform_create(self, serializer):
        servico = serializer.save()
        
        HistoricoEvento.objects.create(
            veiculo=servico.veiculo,
            ciclo=servico.ciclo,
            tipo_evento="SERVICO_SOLICITADO",
            descricao=f"Serviço solicitado: {servico.descricao}.",
            autor=str(self.request.user)
        )

    def perform_update(self, serializer):
        servico = serializer.save()
        
        HistoricoEvento.objects.create(
            veiculo=servico.veiculo,
            ciclo=servico.ciclo,
            tipo_evento="SERVICO_STATUS_ALTERADO",
            descricao=f"Status do serviço '{servico.descricao}' alterado para: {servico.get_status_display()}.",
            autor=str(self.request.user)
        )

class AutorizacaoViewSet(viewsets.ModelViewSet):
    queryset = Autorizacao.objects.all()
    serializer_class = AutorizacaoSerializer
    permission_classes = [permissions.IsAuthenticated] # Cofre Trancado
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'servico']

    def perform_create(self, serializer):
        autorizacao = serializer.save()
        
        # O Django viaja da Autorização -> Serviço -> Veículo/Ciclo para carimbar o histórico
        HistoricoEvento.objects.create(
            veiculo=autorizacao.servico.veiculo,
            ciclo=autorizacao.servico.ciclo,
            tipo_evento="AUTORIZACAO_CRIADA",
            descricao=f"Pedido de autorização gerado para o serviço: {autorizacao.servico.descricao}.",
            autor=str(self.request.user)
        )

    def perform_update(self, serializer):
        autorizacao = serializer.save()
        
        HistoricoEvento.objects.create(
            veiculo=autorizacao.servico.veiculo,
            ciclo=autorizacao.servico.ciclo,
            tipo_evento="AUTORIZACAO_RESPONDIDA",
            descricao=f"Orçamento/Serviço '{autorizacao.servico.descricao}' foi {autorizacao.get_status_display().upper()}.",
            autor=str(self.request.user)
        )
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Veiculo, CicloVeiculo
from .serializers import VeiculoSerializer, CicloVeiculoSerializer
from apps.workflow.models import HistoricoEvento # O nosso sistema de auditoria

class VeiculoViewSet(viewsets.ModelViewSet):
    queryset = Veiculo.objects.all()
    serializer_class = VeiculoSerializer
    permission_classes = [permissions.IsAuthenticated] # Trancado!
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['loja', 'status', 'placa']

    def update(self, request, *args, **kwargs):
        # A MÁQUINA DE ESTADOS INQUEBRÁVEL
        veiculo = self.get_object()
        novo_status = request.data.get('status')

        # Só verifica se o utilizador estiver a tentar mudar o status
        if novo_status and novo_status != veiculo.status:
            
            # O Mapa de Regras (De onde está -> Para onde pode ir)
            transicoes_permitidas = {
                'AVALIADOR': ['OFICINA'],
                'OFICINA': ['QUALIDADE_POS'],
                'QUALIDADE_POS': ['LAVAGEM', 'OFICINA'], # Pode voltar à oficina se chumbar
                'LAVAGEM': ['QUALIDADE_FINAL'],
                'QUALIDADE_FINAL': ['SHOWROOM', 'LAVAGEM', 'OFICINA'], # Pode voltar se o cliente achar defeito
                'SHOWROOM': [] # Fim da linha
            }

            permitidos = transicoes_permitidas.get(veiculo.status, [])

            if novo_status not in permitidos:
                return Response(
                    {"erro": f"Fraude bloqueada! O sistema não permite pular um veículo de '{veiculo.status}' direto para '{novo_status}'."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Se a transição for válida, regista na auditoria instantaneamente
            ciclo_ativo = veiculo.ciclos.filter(ativo=True).first()
            HistoricoEvento.objects.create(
                veiculo=veiculo,
                ciclo=ciclo_ativo,
                tipo_evento="MUDANCA_ETAPA_VEICULO",
                descricao=f"Veículo avançou no fluxo: de {veiculo.status} para {novo_status}.",
                autor=request.user
            )

        # Continua com a gravação normal
        return super().update(request, *args, **kwargs)

class CicloVeiculoViewSet(viewsets.ModelViewSet):
    queryset = CicloVeiculo.objects.all()
    serializer_class = CicloVeiculoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['veiculo', 'ativo', 'numero_ciclo']

class VeiculoViewSet(viewsets.ModelViewSet):
    queryset = Veiculo.objects.all()
    serializer_class = VeiculoSerializer
    # ... os seus filtros que já lá estão ...

    # 🚀 TIRO 1: Ninguém falsifica o nascimento. Todo o veículo nasce no Avaliador!
    def perform_create(self, serializer):
        serializer.save(status='AVALIADOR')
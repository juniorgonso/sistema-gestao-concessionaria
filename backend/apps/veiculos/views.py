from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Veiculo, CicloVeiculo
from .serializers import VeiculoSerializer, CicloVeiculoSerializer
from apps.workflow.models import HistoricoEvento

class VeiculoViewSet(viewsets.ModelViewSet):
    queryset = Veiculo.objects.all()
    serializer_class = VeiculoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['loja', 'status', 'placa']

    def perform_create(self, serializer):
        # O veículo entra direto para a fila do mecânico
        serializer.save(status='OFICINA')

    def update(self, request, *args, **kwargs):
        veiculo = self.get_object()
        novo_status = request.data.get('status')

        if novo_status and novo_status != veiculo.status:
            transicoes_permitidas = {
                'AVALIADOR': ['OFICINA'],
                'OFICINA': ['QUALIDADE_POS'],
                'QUALIDADE_POS': ['LAVAGEM', 'OFICINA'], 
                'LAVAGEM': ['QUALIDADE_FINAL'],
                'QUALIDADE_FINAL': ['SHOWROOM', 'LAVAGEM', 'OFICINA'], 
                'SHOWROOM': [] 
            }

            permitidos = transicoes_permitidas.get(veiculo.status, [])

            if novo_status not in permitidos:
                return Response(
                    {"erro": f"Fraude bloqueada! O sistema não permite pular de '{veiculo.status}' direto para '{novo_status}'."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            ciclo_ativo = veiculo.ciclos.filter(ativo=True).first()
            if ciclo_ativo:
                HistoricoEvento.objects.create(
                    veiculo=veiculo,
                    ciclo=ciclo_ativo,
                    tipo_evento="MUDANCA_ETAPA_VEICULO",
                    descricao=f"Veículo avançou no fluxo: de {veiculo.status} para {novo_status}.",
                    autor=request.user
                )

        return super().update(request, *args, **kwargs)

class CicloVeiculoViewSet(viewsets.ModelViewSet):
    queryset = CicloVeiculo.objects.all()
    serializer_class = CicloVeiculoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['veiculo', 'ativo', 'numero_ciclo']
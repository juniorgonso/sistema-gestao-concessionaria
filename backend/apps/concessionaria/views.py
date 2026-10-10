from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Concessionaria, Unidade, Setor, Fornecedor, Ocorrencia, DemandaExterna, EvidenciaFoto
from .serializers import (
    ConcessionariaSerializer, UnidadeSerializer, SetorSerializer,
    FornecedorSerializer, OcorrenciaSerializer, DemandaExternaSerializer, EvidenciaFotoSerializer
)

class ConcessionariaViewSet(viewsets.ModelViewSet):
    queryset = Concessionaria.objects.all()
    serializer_class = ConcessionariaSerializer
    permission_classes = [permissions.IsAuthenticated]

class UnidadeViewSet(viewsets.ModelViewSet):
    queryset = Unidade.objects.all()
    serializer_class = UnidadeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['concessionaria']

class SetorViewSet(viewsets.ModelViewSet):
    queryset = Setor.objects.all()
    serializer_class = SetorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['unidade']

class FornecedorViewSet(viewsets.ModelViewSet):
    queryset = Fornecedor.objects.all()
    serializer_class = FornecedorSerializer
    permission_classes = [permissions.IsAuthenticated]

class OcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = Ocorrencia.objects.all()
    serializer_class = OcorrenciaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['veiculo', 'origem', 'status']

    def update(self, request, *args, **kwargs):
        # BLINDAGEM 1: Impede que o Mobile altere o status via PATCH direto
        if 'status' in request.data:
            return Response(
                {"erro": "Alteração direta de status bloqueada. Use o endpoint de transição oficial."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='avancar-fluxo')
    def avancar_fluxo(self, request, pk=None):
        # BLINDAGEM 2: A Máquina de Estados da Auditoria
        ocorrencia = self.get_object()
        novo_status = request.data.get('novo_status')
        
        # O dicionário inquebrável (De onde está -> Para onde pode ir)
        transicoes_permitidas = {
            'AVALIADOR': ['OFICINA'],
            'OFICINA': ['QUALIDADE_POS'],
            'QUALIDADE_POS': ['LAVAGEM', 'RETORNO_OFICINA'],
            'LAVAGEM': ['QUALIDADE_FINAL'],
            'QUALIDADE_FINAL': ['LIBERADO', 'RETORNO_LAVAGEM']
        }

        status_atual = ocorrencia.status

        if novo_status not in transicoes_permitidas.get(status_atual, []):
            return Response(
                {"erro": f"Transição bloqueada. Proibido pular de {status_atual} para {novo_status}."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Atualiza apenas se passou na validação da máquina de estados
        ocorrencia.status = novo_status
        ocorrencia.save()
        
        return Response({"mensagem": f"Sucesso! Movido com segurança para {novo_status}."})

class DemandaExternaViewSet(viewsets.ModelViewSet):
    queryset = DemandaExterna.objects.all()
    serializer_class = DemandaExternaSerializer
    permission_classes = [permissions.IsAuthenticated]

class EvidenciaFotoViewSet(viewsets.ModelViewSet):
    queryset = EvidenciaFoto.objects.all()
    serializer_class = EvidenciaFotoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ocorrencia']
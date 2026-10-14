from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.accounts.models import Funcionario
from apps.workflow.models import HistoricoEvento
from .models import Veiculo, CicloVeiculo
from .serializers import VeiculoSerializer, CicloVeiculoSerializer


class VeiculoViewSet(viewsets.ModelViewSet):
    queryset = Veiculo.objects.all()
    serializer_class = VeiculoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['loja', 'status', 'placa']

    def _unidade_oficina(self):
        """Fonte de verdade: o cadastro do funcionário autenticado no Django."""
        if not self.request.user.groups.filter(name='Oficina').exists():
            raise PermissionDenied('Este recurso é exclusivo do grupo Oficina.')

        funcionario = (
            Funcionario.objects.select_related('unidade')
            .filter(usuario=self.request.user, ativo=True)
            .first()
        )
        if not funcionario:
            raise PermissionDenied('Usuário sem cadastro de funcionário ativo.')
        if funcionario.concessionaria_id != funcionario.unidade.concessionaria_id:
            raise PermissionDenied(
                'O funcionário está vinculado a uma concessionária diferente da unidade.'
            )
        if not funcionario.unidade.codigo_loja:
            raise PermissionDenied(
                'A unidade do funcionário ainda não possui Código da loja configurado.'
            )
        return funcionario.unidade

    def get_queryset(self):
        qs = super().get_queryset()
        usuario = self.request.user
        # Impede que um usuário apenas de Oficina contorne o filtro pela
        # rota /lista/ ou acesse/edite um veículo de outra unidade por ID.
        if (
            usuario.is_authenticated
            and not usuario.is_superuser
            and not usuario.groups.filter(name='Administrativo').exists()
            and usuario.groups.filter(name='Oficina').exists()
        ):
            unidade = self._unidade_oficina()
            return qs.filter(loja=unidade.codigo_loja)
        return qs

    @action(detail=False, methods=['get'], url_path='minha-oficina')
    def minha_oficina(self, request):
        unidade = self._unidade_oficina()
        veiculos = self.filter_queryset(
            self.get_queryset().filter(loja=unidade.codigo_loja, status='OFICINA')
        )
        serializer = self.get_serializer(veiculos, many=True)
        return Response({
            'unidade': {
                'id': unidade.pk,
                'nome': unidade.nome,
                'codigo_loja': unidade.codigo_loja,
            },
            'veiculos': serializer.data,
        })

    def perform_create(self, serializer):
        # Mantém o encaminhamento original: cadastro -> Oficina.
        serializer.save(status='OFICINA')

    def update(self, request, *args, **kwargs):
        veiculo = self.get_object()
        novo_status = request.data.get('status')

        if (
            request.user.groups.filter(name='Oficina').exists()
            and not request.user.groups.filter(name='Administrativo').exists()
            and not request.user.is_superuser
            and 'loja' in request.data
            and request.data['loja'] != veiculo.loja
        ):
            raise PermissionDenied('A Oficina não pode mudar a loja do veículo.')

        if novo_status and novo_status != veiculo.status:
            transicoes_permitidas = {
                'AVALIADOR': ['OFICINA'],
                'OFICINA': ['QUALIDADE_POS'],
                'QUALIDADE_POS': ['LAVAGEM', 'OFICINA'],
                'LAVAGEM': ['QUALIDADE_FINAL'],
                'QUALIDADE_FINAL': ['SHOWROOM', 'LAVAGEM', 'OFICINA'],
                'SHOWROOM': [],
            }

            permitidos = transicoes_permitidas.get(veiculo.status, [])
            if novo_status not in permitidos:
                return Response(
                    {'erro': (
                        f"Transição não permitida: de '{veiculo.status}' "
                        f"para '{novo_status}'."
                    )},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            ciclo_ativo = veiculo.ciclos.filter(ativo=True).first()
            if ciclo_ativo:
                HistoricoEvento.objects.create(
                    veiculo=veiculo,
                    ciclo=ciclo_ativo,
                    tipo_evento='MUDANCA_ETAPA_VEICULO',
                    descricao=(
                        f'Veículo avançou no fluxo: de {veiculo.status} para {novo_status}.'
                    ),
                    autor=request.user,
                )

        return super().update(request, *args, **kwargs)


class CicloVeiculoViewSet(viewsets.ModelViewSet):
    queryset = CicloVeiculo.objects.all()
    serializer_class = CicloVeiculoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['veiculo', 'ativo', 'numero_ciclo']

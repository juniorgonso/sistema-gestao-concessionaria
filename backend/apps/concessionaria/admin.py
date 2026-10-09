from django.contrib import admin
from .models import Concessionaria, Unidade, Setor, Fornecedor, Ocorrencia, DemandaExterna, EvidenciaFoto

@admin.register(Concessionaria)
class ConcessionariaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'cnpj')
    search_fields = ('nome', 'cnpj')

@admin.register(Unidade)
class UnidadeAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'concessionaria', 'cidade')
    list_filter = ('concessionaria', 'cidade')
    search_fields = ('nome',)

@admin.register(Setor)
class SetorAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'unidade')
    list_filter = ('unidade',)
    search_fields = ('nome',)

@admin.register(Fornecedor)
class FornecedorAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome_fantasia', 'tipo_servico', 'ativo')
    list_filter = ('ativo',)

@admin.register(Ocorrencia)
class OcorrenciaAdmin(admin.ModelAdmin):
    list_display = ('id', 'veiculo', 'origem', 'status', 'criado_em')
    list_filter = ('origem', 'status')

@admin.register(DemandaExterna)
class DemandaExternaAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'tipo', 'solicitante', 'criado_em')

@admin.register(EvidenciaFoto)
class EvidenciaFotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'ocorrencia', 'enviado_em')
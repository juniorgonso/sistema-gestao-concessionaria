from django.contrib import admin
from .models import Concessionaria, Unidade, Setor


@admin.register(Concessionaria)
class ConcessionariaAdmin(admin.ModelAdmin):
    list_display = ("nome_fantasia", "razao_social", "cnpj", "ativa")
    search_fields = ("nome_fantasia", "razao_social", "cnpj")
    list_filter = ("ativa",)


@admin.register(Unidade)
class UnidadeAdmin(admin.ModelAdmin):
    list_display = ("nome", "concessionaria", "cidade", "estado", "ativa")
    search_fields = ("nome", "concessionaria__nome_fantasia")
    list_filter = ("ativa", "estado", "concessionaria")


@admin.register(Setor)
class SetorAdmin(admin.ModelAdmin):
    list_display = ("nome", "sigla", "unidade", "ordem_exibicao", "ativo")
    search_fields = ("nome", "sigla", "unidade__nome")
    list_filter = ("ativo", "unidade")
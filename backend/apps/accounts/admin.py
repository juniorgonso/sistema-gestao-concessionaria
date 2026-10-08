from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser, Funcao, Funcionario, VinculoSetor


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = (
        'username',
        'first_name',
        'last_name',
        'email',
        'is_active',
        'is_staff',
    )

    search_fields = (
        'username',
        'first_name',
        'last_name',
        'email',
    )


@admin.register(Funcao)
class FuncaoAdmin(admin.ModelAdmin):
    list_display = (
        'nome',
        'ativa',
    )

    list_filter = (
        'ativa',
    )

    search_fields = (
        'nome',
        'descricao',
    )


@admin.register(Funcionario)
class FuncionarioAdmin(admin.ModelAdmin):
    list_display = (
        'nome',
        'matricula',
        'concessionaria',
        'unidade',
        'funcao',
        'ativo',
    )

    list_filter = (
        'ativo',
        'concessionaria',
        'unidade',
        'funcao',
    )

    search_fields = (
        'nome',
        'matricula',
        'usuario__username',
        'usuario__first_name',
        'usuario__last_name',
    )

    autocomplete_fields = (
        'usuario',
        'concessionaria',
        'unidade',
        'funcao',
    )


@admin.register(VinculoSetor)
class VinculoSetorAdmin(admin.ModelAdmin):
    list_display = (
        'funcionario',
        'setor',
        'principal',
        'ativo',
        'criado_em',
    )

    list_filter = (
        'principal',
        'ativo',
        'setor',
    )

    search_fields = (
        'funcionario__nome',
        'setor__nome',
    )

    autocomplete_fields = (
        'funcionario',
        'setor',
    )
    
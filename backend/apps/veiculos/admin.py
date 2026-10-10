from django.contrib import admin
from .models import Veiculo, CicloVeiculo

@admin.register(Veiculo)
class VeiculoAdmin(admin.ModelAdmin):
    list_display = ('id', 'placa', 'marca_modelo', 'loja', 'status')
    search_fields = ('placa', 'marca_modelo')
    list_filter = ('status', 'loja')

admin.site.register(CicloVeiculo)
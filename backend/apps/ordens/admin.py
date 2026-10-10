from django.contrib import admin
from .models import Servico, ExecucaoServico, Autorizacao

admin.site.register(Servico)
admin.site.register(ExecucaoServico)
admin.site.register(Autorizacao)

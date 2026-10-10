from django.contrib import admin
from .models import HistoricoEvento, ProcessoLavagem, VistoriaQualidade

admin.site.register(HistoricoEvento)
admin.site.register(ProcessoLavagem)
admin.site.register(VistoriaQualidade)

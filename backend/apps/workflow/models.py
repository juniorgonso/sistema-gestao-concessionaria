from django.db import models
from apps.veiculos.models import Veiculo, CicloVeiculo
from django.conf import settings

class HistoricoEvento(models.Model):
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE, related_name='historico', verbose_name="Veículo")
    ciclo = models.ForeignKey(CicloVeiculo, on_delete=models.CASCADE, related_name='eventos', null=True, blank=True, verbose_name="Ciclo")
    tipo_evento = models.CharField(max_length=100, verbose_name="Tipo de Evento (Ex: MUDANCA_ETAPA, OCORRENCIA_CRIADA)")
    descricao = models.TextField(verbose_name="Detalhe da Movimentação")
    
    # 🔒 CORREÇÃO DO AUDITOR: Autor agora é um vínculo real com o Usuário
    autor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        verbose_name="Usuário Responsável"
    )
    registrado_em = models.DateTimeField(auto_now_add=True, verbose_name="Registrado em")

    class Meta:
        verbose_name = "Histórico e Auditoria"
        verbose_name_plural = "Históricos e Auditorias"
        ordering = ['-registrado_em']

    def __str__(self):
        return f"[{self.tipo_evento}] {self.veiculo.placa} em {self.registrado_em}"


class VistoriaQualidade(models.Model):
    ETAPA_CHOICES = [
        ('POS_OFICINA', 'Qualidade Pós-Oficina'),
        ('FINAL', 'Qualidade Final'),
    ]
    RESULTADO_CHOICES = [
        ('APROVADO', 'Aprovado'),
        ('REPROVADO', 'Reprovado / Gerou Nova Ocorrência'),
    ]

    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE, related_name='vistorias')
    
    # 🔒 CORREÇÃO DO AUDITOR: Null e Blank removidos. Ciclo é OBRIGATÓRIO!
    ciclo = models.ForeignKey(CicloVeiculo, on_delete=models.PROTECT, related_name='vistorias')
    
    etapa = models.CharField(max_length=20, choices=ETAPA_CHOICES)
    resultado = models.CharField(max_length=20, choices=RESULTADO_CHOICES)
    observacoes = models.TextField(blank=True, null=True)
    realizado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Vistoria {self.get_etapa_display()} - {self.veiculo.placa} [{self.get_resultado_display()}]"


class ProcessoLavagem(models.Model):
    STATUS_CHOICES = [
        ('FILA', 'Na Fila'),
        ('EM_ANDAMENTO', 'Em Andamento'),
        ('CONCLUIDO', 'Concluído'),
        ('CANCELADO', 'Cancelado'),
    ]

    # 🔒 CORREÇÃO DO AUDITOR: Null e Blank removidos. Ciclo é OBRIGATÓRIO!
    ciclo = models.ForeignKey(
        'veiculos.CicloVeiculo',
        on_delete=models.PROTECT,
        related_name='lavagens',
        verbose_name="Ciclo Operacional"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='FILA',
        verbose_name="Status",
    )

    responsavel = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Responsável",
    )

    iniciado_em = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Início da Lavagem",
    )

    concluido_em = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Conclusão da Lavagem",
    )

    observacoes = models.TextField(
        blank=True,
        null=True,
        verbose_name="Observações",
    )

    criado_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Criado em",
    )

    class Meta:
        verbose_name = "Processo de Lavagem"
        verbose_name_plural = "Processos de Lavagem"
        ordering = ['criado_em']

    def __str__(self):
        return (
            f"Lavagem do veículo {self.ciclo.veiculo.placa} "
            f"| Ciclo #{self.ciclo.numero_ciclo} "
            f"| {self.get_status_display()}"
        )

    
class EvidenciaFoto(models.Model):
    ciclo = models.ForeignKey(
        'veiculos.CicloVeiculo', 
        on_delete=models.CASCADE, 
        related_name='fotos',
        verbose_name="Ciclo Operacional"
    )
    foto = models.ImageField(upload_to='evidencias/%Y/%m/', verbose_name="Arquivo da Foto")
    descricao = models.CharField(max_length=255, blank=True, null=True, verbose_name="Descrição/Local do Dano")
    enviado_em = models.DateTimeField(auto_now_add=True)
    
    # 🔒 CORREÇÃO DO AUDITOR: Enviado_por agora é um vínculo real com o Usuário
    enviado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        verbose_name="Enviado por"
    )

    class Meta:
        verbose_name = "Evidência Fotográfica"
        verbose_name_plural = "Evidências Fotográficas"

    def __str__(self):
        return f"Foto do Ciclo #{self.ciclo.numero_ciclo} ({self.descricao or 'Sem descrição'})"
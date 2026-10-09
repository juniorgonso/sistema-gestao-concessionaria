from django.db import models
from django.conf import settings
from apps.veiculos.models import Veiculo, CicloVeiculo

class Concessionaria(models.Model):
    nome = models.CharField(max_length=150, verbose_name="Nome da Concessionária")
    cnpj = models.CharField(max_length=20, unique=True, verbose_name="CNPJ")

    def __str__(self):
        return self.nome


class Unidade(models.Model):
    concessionaria = models.ForeignKey(Concessionaria, on_delete=models.CASCADE, related_name='unidades')
    nome = models.CharField(max_length=150, verbose_name="Nome da Unidade (Ex: Gran Via, Eurovia, Piedade)")
    cidade = models.CharField(max_length=100, default="Jaboatão dos Guararapes")

    def __str__(self):
        return f"{self.nome} - {self.concessionaria.nome}"


class Setor(models.Model):
    unidade = models.ForeignKey(Unidade, on_delete=models.CASCADE, related_name='setores')
    nome = models.CharField(max_length=100, verbose_name="Nome do Setor (Ex: Oficina, Avaliação, Lavagem)")

    def __str__(self):
        return f"{self.nome} ({self.unidade.nome})"


class Fornecedor(models.Model):
    nome_fantasia = models.CharField(max_length=150, verbose_name="Nome Fantasia")
    tipo_servico = models.CharField(max_length=100, verbose_name="Tipo de Serviço")
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome_fantasia


class Ocorrencia(models.Model):
    ORIGEM_CHOICES = [
        ('AVALIADOR', 'Avaliador'),
        ('OFICINA', 'Oficina'),
        ('QUALIDADE_POS', 'Qualidade Pós-Oficina'),
        ('QUALIDADE_FINAL', 'Qualidade Final'),
    ]

    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE, related_name='ocorrencias', verbose_name="Veículo")
    ciclo = models.ForeignKey(CicloVeiculo, on_delete=models.CASCADE, related_name='ocorrencias', null=True, blank=True, verbose_name="Ciclo Operacional")
    origem = models.CharField(max_length=30, choices=ORIGEM_CHOICES, default='AVALIADOR', verbose_name="Etapa de Origem")
    
    descricao = models.TextField(verbose_name="Descrição do Problema")
    status = models.CharField(max_length=20, default='PENDENTE', verbose_name="Status da Ocorrência")
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Ocorrência"
        verbose_name_plural = "Ocorrências"
        ordering = ['-criado_em']

    def __str__(self):
        return f"[{self.get_origem_display()}] {self.descricao[:30]} - {self.veiculo.placa}"


class DemandaExterna(models.Model):
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    tipo = models.CharField(max_length=100)
    solicitante = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['criado_em']

    def __str__(self):
        return self.titulo


class EvidenciaFoto(models.Model):
    ocorrencia = models.ForeignKey(Ocorrencia, on_delete=models.CASCADE, related_name='fotos', null=True, blank=True, verbose_name="Ocorrência Relacionada")
    imagem = models.ImageField(upload_to='evidencias/', verbose_name="Ficheiro de Imagem")
    enviado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Foto Evidência #{self.id}"
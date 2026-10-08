from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

User = get_user_model()

# =====================================================================
# MÓDULOS DA EQUIPE A (NÚCLEO DO SISTEMA)
# =====================================================================

class Concessionaria(models.Model):
    razao_social = models.CharField(max_length=150, verbose_name="Razão social")
    nome_fantasia = models.CharField(max_length=150, verbose_name="Nome fantasia")
    cnpj = models.CharField(max_length=18, unique=True, null=True, blank=True, verbose_name="CNPJ")
    email = models.EmailField(blank=True, verbose_name="E-mail")
    telefone = models.CharField(max_length=20, blank=True, verbose_name="Telefone")
    ativa = models.BooleanField(default=True, verbose_name="Ativa")
    criada_em = models.DateTimeField(auto_now_add=True)
    atualizada_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Concessionária"
        verbose_name_plural = "Concessionárias"
        ordering = ["nome_fantasia"]

    def __str__(self):
        return self.nome_fantasia

class Unidade(models.Model):
    concessionaria = models.ForeignKey(Concessionaria, on_delete=models.PROTECT, related_name="unidades", verbose_name="Concessionária")
    nome = models.CharField(max_length=150, verbose_name="Nome da unidade")
    codigo = models.CharField(max_length=20, blank=True, verbose_name="Código")
    telefone = models.CharField(max_length=20, blank=True, verbose_name="Telefone")
    endereco = models.CharField(max_length=200, blank=True, verbose_name="Endereço")
    cidade = models.CharField(max_length=100, blank=True, verbose_name="Cidade")
    estado = models.CharField(max_length=2, blank=True, verbose_name="UF")
    ativa = models.BooleanField(default=True, verbose_name="Ativa")
    criada_em = models.DateTimeField(auto_now_add=True)
    atualizada_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Unidade"
        verbose_name_plural = "Unidades"
        ordering = ["nome"]
        constraints = [
            models.UniqueConstraint(fields=["concessionaria", "nome"], name="unique_unidade_por_concessionaria")
        ]

    def __str__(self):
        return f"{self.nome} - {self.concessionaria.nome_fantasia}"

class Setor(models.Model):
    unidade = models.ForeignKey(Unidade, on_delete=models.PROTECT, related_name="setores", verbose_name="Unidade")
    nome = models.CharField(max_length=100, verbose_name="Nome do setor")
    sigla = models.CharField(max_length=15, blank=True, verbose_name="Sigla")
    descricao = models.TextField(blank=True, verbose_name="Descrição")
    ordem_exibicao = models.PositiveIntegerField(default=0, verbose_name="Ordem de exibição")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Setor"
        verbose_name_plural = "Setores"
        ordering = ["ordem_exibicao", "nome"]
        constraints = [
            models.UniqueConstraint(fields=["unidade", "nome"], name="unique_setor_por_unidade")
        ]

    def __str__(self):
        return f"{self.nome} - {self.unidade.nome}"

# =====================================================================
# MÓDULOS DA EQUIPE B (APOIO OPERACIONAL E LOGÍSTICA EXTERNA)
# =====================================================================

class Fornecedor(models.Model):
    nome_fantasia = models.CharField(max_length=255, verbose_name="Nome Fantasia")
    contato = models.CharField(max_length=255, blank=True, null=True, verbose_name="Contato")
    tipo_servico = models.CharField(max_length=100, verbose_name="Tipo de Serviço")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Fornecedor"
        verbose_name_plural = "Fornecedores"
        ordering = ["nome_fantasia"]

    def __str__(self):
        return str(self.nome_fantasia)

class DemandaExterna(models.Model):
    PRIORIDADE_CHOICES = [('BAIXA', 'Baixa'), ('NORMAL', 'Normal'), ('ALTA', 'Alta'), ('URGENTE', 'Urgente')]
    STATUS_CHOICES = [('PENDENTE', 'Pendente'), ('ATRIBUIDA', 'Atribuída'), ('EM_EXECUCAO', 'Em Execução'), ('CONCLUIDA', 'Concluída'), ('NAO_CONCLUIDA', 'Não Concluída / Impedimento')]

    titulo = models.CharField(max_length=200, verbose_name="Título da Demanda")
    descricao = models.TextField(verbose_name="Descrição Detalhada")
    tipo = models.CharField(max_length=100, verbose_name="Tipo de Demanda")
    prioridade = models.CharField(max_length=15, choices=PRIORIDADE_CHOICES, default='NORMAL', verbose_name="Prioridade")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDENTE', verbose_name="Status")
    
    solicitante = models.ForeignKey(User, related_name='demandas_solicitadas', on_delete=models.SET_NULL, null=True, verbose_name="Solicitante")
    responsavel = models.ForeignKey(User, related_name='demandas_atribuidas', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Responsável")
    
    veiculo_relacionado = models.CharField(max_length=50, blank=True, null=True, verbose_name="Veículo Relacionado") 
    os_relacionada = models.CharField(max_length=50, blank=True, null=True, verbose_name="OS Relacionada")
    
    motivo_ocorrencia = models.TextField(blank=True, null=True, verbose_name="Motivo da Ocorrência")
    criado_em = models.DateTimeField(auto_now_add=True)
    iniciado_em = models.DateTimeField(null=True, blank=True, verbose_name="Iniciado em")
    concluido_em = models.DateTimeField(null=True, blank=True, verbose_name="Concluído em")

    class Meta:
        verbose_name = "Demanda Externa"
        verbose_name_plural = "Demandas Externas"
        ordering = ["-criado_em"]

    def __str__(self):
        return f"{self.titulo} - {self.get_status_display()}"

class EvidenciaFoto(models.Model):
    imagem = models.ImageField(upload_to='evidencias/%Y/%m/%d/', verbose_name="Fotografia")
    autor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Autor da Foto")
    criado_em = models.DateTimeField(auto_now_add=True)
    
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        verbose_name = "Evidência Fotográfica"
        verbose_name_plural = "Evidências Fotográficas"
        ordering = ["-criado_em"]

    def __str__(self):
        return f"Evidência {self.id} - {self.criado_em.strftime('%d/%m/%Y')}"

class Ocorrencia(models.Model):
    """Registro de avarias e problemas operacionais"""
    STATUS_CHOICES = [('PENDENTE', 'Pendente'), ('EM_ANALISE', 'Em Análise'), ('RESOLVIDA', 'Resolvida')]
    
    descricao = models.TextField(verbose_name="Descrição da Ocorrência")
    setor_solicitante = models.CharField(max_length=100, verbose_name="Setor Solicitante")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDENTE')
    
    # Textos livres por enquanto, até a Equipe A terminar a tabela de Veículos
    veiculo_relacionado = models.CharField(max_length=50, blank=True, null=True, verbose_name="Placa/Chassi")
    os_relacionada = models.CharField(max_length=50, blank=True, null=True, verbose_name="Número da OS")
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Ocorrência"
        verbose_name_plural = "Ocorrências"
        ordering = ["-criado_em"]

    def __str__(self):
        return f"Ocorrência {self.id} - {self.status}"
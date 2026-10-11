from rest_framework import permissions

# Crachá exclusivo para o pessoal da Oficina
class IsOficina(permissions.BasePermission):
    def has_permission(self, request, view):
        # O usuário precisa estar logado e pertencer ao grupo 'Oficina'
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.groups.filter(name='Oficina').exists()
        )

# Crachá exclusivo para os Lavadores
class IsLavagem(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.groups.filter(name='Lavagem').exists()
        )

# Crachá exclusivo para a Qualidade / Chefia
class IsQualidade(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.groups.filter(name='Qualidade').exists()
        )
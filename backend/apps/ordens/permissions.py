from rest_framework import permissions

class IsAdministrativo(permissions.BasePermission):
    """ Permite acesso apenas ao grupo Administrativo """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.groups.filter(name='Administrativo').exists()
        )
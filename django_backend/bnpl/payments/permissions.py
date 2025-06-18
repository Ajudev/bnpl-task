from rest_framework import permissions

class IsMerchantOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.user_type == 'merchant'

class IsOwnerOrMerchant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.user_type == 'merchant':
            return obj.merchant == request.user
        return obj.customer_email == request.user.email
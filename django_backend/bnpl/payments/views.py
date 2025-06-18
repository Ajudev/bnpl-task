from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import PaymentPlan, Installment
from .serializers import PaymentPlanSerializer, PaymentPlanCreateSerializer, InstallmentSerializer
from .permissions import IsMerchantOrReadOnly

class PaymentPlanViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentPlanSerializer
    permission_classes = [IsAuthenticated, IsMerchantOrReadOnly]

    def get_queryset(self):
        if self.request.user.user_type == 'merchant':
            return PaymentPlan.objects.filter(merchant=self.request.user)
        return PaymentPlan.objects.filter(customer_email=self.request.user.email)

    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentPlanCreateSerializer
        return PaymentPlanSerializer

    def perform_create(self, serializer):
        serializer.save(merchant=self.request.user)

class InstallmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InstallmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'merchant':
            return Installment.objects.filter(payment_plan__merchant=self.request.user)
        return Installment.objects.filter(payment_plan__customer_email=self.request.user.email)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        installment = self.get_object()
        
        if installment.status == 'paid':
            return Response({'error': 'Installment already paid'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        installment.status = 'paid'
        installment.paid_at = timezone.now()
        installment.save()
        
        return Response({'message': 'Payment successful'})

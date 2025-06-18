from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from payments.models import PaymentPlan, Installment

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def merchant_dashboard(request):
    if request.user.user_type != 'merchant':
        return Response({'error': 'Merchant access required'}, status=403)
    
    plans = PaymentPlan.objects.filter(merchant=request.user)
    installments = Installment.objects.filter(payment_plan__merchant=request.user)
    
    total_revenue = installments.filter(status='paid').aggregate(
        total=Sum('amount'))['total'] or 0
        
    total_plans = plans.count()
    active_plans = plans.filter(status='active').count()
    completed_plans = plans.filter(status='completed').count()
    
    overdue_installments = installments.filter(status='overdue').count()
    
    success_rate = 0
    if total_plans > 0:
        success_rate = (completed_plans / total_plans) * 100
    
    return Response({
        'total_revenue': total_revenue,
        'total_plans': total_plans,
        'active_plans': active_plans,
        'completed_plans': completed_plans,
        'overdue_installments': overdue_installments,
        'success_rate': round(success_rate, 2)
    })
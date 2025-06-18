from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.PaymentPlanViewSet, basename='paymentplan')
router.register(r'installments', views.InstallmentViewSet, basename='installment')

urlpatterns = [
    path('', include(router.urls)),
    path(
        "installments/pay/<str:pk>",
        views.InstallmentViewSet.as_view({"post": "pay"}),
        name="pay_installment",
    ),
]
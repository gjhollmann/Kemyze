from django.urls import path
from . import views

urlpatterns = [
    path('', views.loginMain, name='loginMain'),
    path('dbtest/', views.newModelTest, name='newModelTest')
]
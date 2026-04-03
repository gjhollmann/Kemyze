from django.urls import path
from . import views

urlpatterns = [
    path('', views.tester, name='tester'),
    path('dbtest/', views.newModelTest, name='newModelTest')
]
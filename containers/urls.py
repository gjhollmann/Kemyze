from django.urls import path
from . import views

urlpatterns = [
    path('getContainer', views.getContainer, name='getContainer'),
    path('getSDS', views.getSDS, name='getSDS'),
    path('getSearch', views.getSearch, name='getSearch'),
    path('', views.containersMain, name='containersMain'),
]
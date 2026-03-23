

from django.urls import path
from . import views

urlpatterns = [
    path("", views.tester, name="tester"),
    path("dbtest/", views.dbtester, name="dbtester"),
    path(
        "containers/<int:container_id>/change-log/",
        views.get_change_log,
        name="get_change_log",
    ),
    path(
        "containers/<int:container_id>/most-recent-change/",
        views.get_most_recent_change,
        name="get_most_recent_change",
    ),
]
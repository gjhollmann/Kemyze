

from django.db import models


class TestTable(models.Model):
    testName = models.CharField(max_length=255)
    testPhrase = models.CharField(max_length=255)

    def __str__(self):
        return self.testName


class ContainerChangeLog(models.Model):
    audit_id = models.BigAutoField(primary_key=True)
    container_id = models.BigIntegerField()
    action_type = models.CharField(max_length=10)
    old_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)
    changed_by = models.BigIntegerField(null=True, blank=True)
    changed_at = models.DateTimeField()

    class Meta:
        db_table = "container_audit_log"
        managed = False
        ordering = ["-changed_at", "-audit_id"]

    def __str__(self):
        return f"{self.action_type} - container {self.container_id} @ {self.changed_at}"
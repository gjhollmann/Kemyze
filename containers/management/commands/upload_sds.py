from django.core.management.base import BaseCommand, CommandError
from common.models import Containers
import os
import base64


class Command(BaseCommand):
    help = "Upload a local PDF file into the database as a BLOB, will update all containers"

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the PDF file')

    def handle(self, *args, **options):
        file_path = options['file_path']

        # Validate file existence
        if not os.path.isfile(file_path):
            raise CommandError(f"File not found: {file_path}")

        # Validate PDF extension
        if not file_path.lower().endswith('.pdf'):
            raise CommandError("Only PDF files are allowed.")

        try:
            with open(file_path, 'rb') as f:
                pdf_bytes = f.read()

            with open("output_file.bin", "wb") as f:
                f.write(base64.b64encode(pdf_bytes))

            # Save to DB
            Containers.objects.all().update(
            sds_sheet=base64.b64encode(pdf_bytes)
            )
            self.stdout.write(self.style.SUCCESS(f"PDF '{file_path}' uploaded successfully."))

        except Exception as e:
            raise CommandError(f"Error uploading PDF: {e}")
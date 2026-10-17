import base64
import json
from django.test import TestCase, Client
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from common.models import Containers, Locations, ContainerAuditLog, Users


class ContainerViewsTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up hierarchical locations
        cls.site_loc = Locations.objects.create(name="SiteA", type="site")
        cls.room_loc = Locations.objects.create(name="Room101", type="room", parent=cls.site_loc)
        cls.cabinet_loc = Locations.objects.create(name="Cabinet1", type="cabinet", parent=cls.room_loc)
        cls.shelf_loc = Locations.objects.create(name="Shelf1", type="shelf", parent=cls.cabinet_loc)

        # Set up users with different access levels
        cls.admin_user = Users.objects.create(
            user_id=1, access_level=1, first_name="Admin", last_name="User", location=cls.site_loc, email="Admin@test.com"
        )
        cls.standard_user = Users.objects.create(
            user_id=2, access_level=3, first_name="Standard", last_name="User", location=cls.site_loc, email="Standard@test.com"
        )
        cls.restricted_user = Users.objects.create(
            user_id=3, access_level=4, first_name="Restricted", last_name="User", location=cls.room_loc, email="Restricted@test.com"
        )

        # Sample PDF bytes and base64
        cls.sample_pdf_bytes = b"%PDF-1.4 sample pdf content for testing sds retrieval"
        cls.sample_pdf_base64 = base64.b64encode(cls.sample_pdf_bytes)

        # Set up a container
        cls.container = Containers.objects.create(
            container_id=100,
            chemical_name="Acetone",
            cas_number="67-64-1",
            expr_date="2027-12-31",
            acqn_date="2026-01-01",
            location=cls.shelf_loc,
            quantity="low",
            sds_sheet=cls.sample_pdf_base64
        )

        # Set up an audit log
        cls.audit_log = ContainerAuditLog.objects.create(
            container_id=100,
            changed_by=1,
            old_values={"chemical_name": "Old Acetone", "cas_number": "67-64-1", "quantity": "high", "location_id": cls.shelf_loc.location_id},
            new_values={"chemical_name": "Acetone", "cas_number": "67-64-1", "quantity": "low", "location_id": cls.shelf_loc.location_id}
        )

    def setUp(self):
        self.client = Client()

    # ----------------------------------------------------
    # 1. containersMain Tests
    # ----------------------------------------------------
    def test_containers_main(self):
        response = self.client.get(reverse("containersMain"))
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Hello from the containers backend", response.content)

    # ----------------------------------------------------
    # 2. getContainer Tests
    # ----------------------------------------------------
    def test_get_container_with_access_level(self):
        response = self.client.get(reverse("getContainer"), {"kemID": 100, "accessLevel": "full"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["container_id"], 100)
        self.assertEqual(data["chemical_name"], "Acetone")
        self.assertIn("Shelf1", data["location"])

    def test_get_container_without_access_level(self):
        response = self.client.get(reverse("getContainer"), {"kemID": 100})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("sds_sheet", data)
        self.assertNotIn("chemical_name", data)

    def test_get_container_missing_params(self):
        response = self.client.get(reverse("getContainer"))
        self.assertEqual(response.status_code, 400)

    def test_get_container_not_found(self):
        response = self.client.get(reverse("getContainer"), {"kemID": 999, "accessLevel": "full"})
        self.assertEqual(response.status_code, 400)

    def test_get_container_invalid_method(self):
        response = self.client.post(reverse("getContainer"), {"kemID": 100})
        self.assertEqual(response.status_code, 405)

    # ----------------------------------------------------
    # 3. getSDS Tests
    # ----------------------------------------------------
    def test_get_sds_success(self):
        response = self.client.get(reverse("getSDS"), {"kemID": 100})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/pdf")

    def test_get_sds_missing_param(self):
        response = self.client.get(reverse("getSDS"))
        self.assertEqual(response.status_code, 400)

    def test_get_sds_not_found(self):
        response = self.client.get(reverse("getSDS"), {"kemID": 999})
        self.assertEqual(response.status_code, 400)

    def test_get_sds_invalid_method(self):
        response = self.client.post(reverse("getSDS"), {"kemID": 100})
        self.assertEqual(response.status_code, 405)

    # ----------------------------------------------------
    # 4. getSearch Tests
    # ----------------------------------------------------
    def test_get_search_success(self):
        response = self.client.get(reverse("getSearch"), {"input": "Acetone", "userID": 1})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(len(data), 1)
        self.assertEqual(data[0]["chemical_name"], "Acetone")

    def test_get_search_missing_input_with_show_low(self):
        response = self.client.get(reverse("getSearch"), {"show_low": "true", "userID": 1})
        self.assertEqual(response.status_code, 200)

    def test_get_search_missing_userid(self):
        response = self.client.get(reverse("getSearch"), {"input": "Acetone"})
        self.assertEqual(response.status_code, 400)

    # ----------------------------------------------------
    # 5. getSearchRecent Tests
    # ----------------------------------------------------
    def test_get_search_recent_success(self):
        response = self.client.get(reverse("getSearchRecent"), {"userID": 1})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)

    def test_get_search_recent_missing_userid(self):
        response = self.client.get(reverse("getSearchRecent"))
        self.assertEqual(response.status_code, 400)

    # ----------------------------------------------------
    # 6. editContainer Tests
    # ----------------------------------------------------
    def test_edit_container_success(self):
        payload = {
            "user_id": 1,
            "container_id": 100,
            "chemical_name": "Updated Acetone",
            "quantity": "medium",
            "location": "SiteA",
            "room": "Room101",
            "cabinet": "Cabinet1",
            "shelf": "Shelf1"
        }
        response = self.client.post(
            reverse("editContainer"),
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.container.refresh_from_db()
        self.assertEqual(self.container.chemical_name, "Updated Acetone")

    def test_edit_container_forbidden(self):
        payload = {"user_id": 3, "container_id": 100, "chemical_name": "Bad Edit"}
        response = self.client.post(
            reverse("editContainer"),
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)

    def test_edit_container_missing_user(self):
        payload = {"container_id": 100, "chemical_name": "No User"}
        response = self.client.post(
            reverse("editContainer"),
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)

    # ----------------------------------------------------
    # 7. getLocationChildren Tests
    # ----------------------------------------------------
    def test_get_location_children_root(self):
        response = self.client.get(reverse("getLocationChildren"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)

    def test_get_location_children_specific(self):
        response = self.client.get(reverse("getLocationChildren"), {"location": "SiteA"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data[0]["name"], "Room101")

    # ----------------------------------------------------
    # 8. Change Log Tests (getContainerChangeLog & getUserChangeLog)
    # ----------------------------------------------------
    def test_get_container_change_log(self):
        response = self.client.get(reverse("getContainerChangeLog"), {"container_id": 100})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)

    def test_get_user_change_log(self):
        response = self.client.get(reverse("getUserChangeLog"), {"user_id": 1})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)

    # ----------------------------------------------------
    # 9. uploadSDS Tests
    # ----------------------------------------------------
    def test_upload_sds_success(self):
        pdf_file = SimpleUploadedFile("test_sds.pdf", self.sample_pdf_bytes, content_type="application/pdf")
        response = self.client.post(reverse("uploadSDS"), {"user_id": 1, "container_id": 100, "sds_file": pdf_file})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])

    def test_upload_sds_invalid_file(self):
        invalid_file = SimpleUploadedFile("test.txt", b"not a pdf", content_type="text/plain")
        response = self.client.post(reverse("uploadSDS"), {"user_id": 1, "sds_file": invalid_file})
        self.assertEqual(response.status_code, 415)

    def test_upload_sds_missing_user(self):
        pdf_file = SimpleUploadedFile("test_sds.pdf", self.sample_pdf_bytes, content_type="application/pdf")
        response = self.client.post(reverse("uploadSDS"), {"sds_file": pdf_file})
        self.assertEqual(response.status_code, 400)

    # ----------------------------------------------------
    # 10. createContainer Tests
    # ----------------------------------------------------
    def test_create_container_success(self):
        payload = {
            "user_id": 1,
            "chemical_name": "Ethanol",
            "cas_number": "64-17-5",
            "acqn_date": "2026-02-01",
            "quantity": "high",
            "location": "SiteA",
            "room": "Room101",
            "cabinet": "Cabinet1",
            "shelf": "Shelf1",
            "sds_base64": self.sample_pdf_base64.decode("utf-8")
        }
        response = self.client.post(
            reverse("createContainer"),
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("container_id", data)

    def test_create_container_missing_param(self):
        payload = {
            "user_id": 1,
            "chemical_name": "Ethanol"
        }
        response = self.client.post(
            reverse("createContainer"),
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)

    # ----------------------------------------------------
    # 11. addLocation Tests
    # ----------------------------------------------------
    def test_add_location_success(self):
        payload = {
            "user_id": 1,
            "new_location": "BuildingB",
            "type": "site"
        }
        response = self.client.post(
            reverse("addLocation"),
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Locations.objects.filter(name="BuildingB").exists())

    def test_add_location_missing_user(self):
        payload = {"new_location": "BuildingC"}
        response = self.client.post(
            reverse("addLocation"),
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)

import json
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from django.test import RequestFactory, SimpleTestCase

from .views import deleteUser


class DeleteUserTests(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def post_delete_request(self, data):
        return self.factory.post(
            '/login/users/delete/',
            data=json.dumps(data),
            content_type='application/json',
        )

    @patch('login.views.Users.objects')
    def test_authorized_user_deletes_target_user(self, users):
        requesting_user = SimpleNamespace(access_level=3)
        target_user = MagicMock()
        users.get.side_effect = [requesting_user, target_user]

        response = deleteUser(self.post_delete_request({'user_id': 10, 'target_user_id': 20}))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), {
            'success': True,
            'message': 'User deleted successfully.',
            'user_id': 20,
        })
        target_user.delete.assert_called_once_with()

    @patch('login.views.Users.objects')
    def test_quaternary_user_cannot_delete_an_account(self, users):
        users.get.return_value = SimpleNamespace(access_level=4)

        response = deleteUser(self.post_delete_request({'user_id': 10, 'target_user_id': 20}))

        self.assertEqual(response.status_code, 403)
        self.assertEqual(users.get.call_count, 1)

    @patch('login.views.Users.objects')
    def test_user_cannot_delete_own_account(self, users):
        response = deleteUser(self.post_delete_request({'user_id': 10, 'target_user_id': 10}))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(users.get.call_count, 0)

    def test_delete_requires_both_user_ids(self):
        response = deleteUser(self.post_delete_request({'user_id': 10}))

        self.assertEqual(response.status_code, 400)
        self.assertIn('target_user_id', json.loads(response.content)['message'])

import json
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from django.test import RequestFactory, SimpleTestCase

from .views import deleteUser, getUser, editUser, addUser, searchManagedUsers, loginMain, forgotPasswordReq, _get_accessible_location_ids
from django.contrib.auth.hashers import make_password, check_password
from common.models import Users


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


class SearchManagedUsersTests(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def post_search_request(self, data):
        return self.factory.post(
            '/login/users/search/',
            data=json.dumps(data),
            content_type='application/json',
        )

    @patch('login.views.Locations.objects')
    @patch('login.views.Users.objects')
    def test_search_returns_only_matching_manageable_accounts(self, users, locations):
        requesting_user = SimpleNamespace(access_level=3, location_id=10)
        users.select_related.return_value.get.return_value = requesting_user
        locations.filter.return_value.values_list.side_effect = [[11], []]

        managed_users = users.filter.return_value
        searchable_users = managed_users.filter.return_value
        searchable_users.select_related.return_value.order_by.return_value.__getitem__.return_value = [
            SimpleNamespace(
                user_id=20,
                first_name='Maria',
                last_name='Delgado',
                location=SimpleNamespace(name='Chemistry Lab'),
                access_level=4,
            )
        ]

        response = searchManagedUsers(
            self.post_search_request({'user_id': 5, 'search': 'chem', 'offset': 0})
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), {
            'success': True,
            'results': [{
                'id': 20,
                'name': 'Maria Delgado',
                'location': 'Chemistry Lab',
                'access_level': 4,
            }],
            'offset': 0,
            'next_offset': None,
            'has_more': False,
        })
        users.filter.assert_called_once_with(
            location_id__in={10, 11},
            access_level__gt=3,
        )
        managed_users.filter.assert_called_once()

    @patch('login.views.Users.objects')
    def test_quaternary_user_cannot_search_managed_accounts(self, users):
        users.select_related.return_value.get.return_value = SimpleNamespace(
            access_level=4,
            location_id=10,
        )

        response = searchManagedUsers(self.post_search_request({'user_id': 5}))

        self.assertEqual(response.status_code, 403)
        users.filter.assert_not_called()

    @patch('login.views.Locations.objects')
    @patch('login.views.Users.objects')
    def test_empty_search_returns_all_manageable_accounts(self, users, locations):
        users.select_related.return_value.get.return_value = SimpleNamespace(
            access_level=3,
            location_id=10,
        )
        locations.filter.return_value.values_list.return_value = []
        managed_users = users.filter.return_value
        managed_users.select_related.return_value.order_by.return_value.__getitem__.return_value = [
            SimpleNamespace(
                user_id=20,
                first_name='Stacy',
                last_name='Reyes',
                location=SimpleNamespace(name='Main Lab'),
                access_level=4,
            ),
            SimpleNamespace(
                user_id=21,
                first_name='Bill',
                last_name='Roberts',
                location=SimpleNamespace(name='Main Lab'),
                access_level=4,
            ),
        ]

        response = searchManagedUsers(
            self.post_search_request({'user_id': 5, 'search': '', 'offset': 0})
        )

        data = json.loads(response.content)
        self.assertEqual(response.status_code, 200)
        self.assertEqual([account['id'] for account in data['results']], [20, 21])
        self.assertFalse(data['has_more'])
        managed_users.filter.assert_not_called()

    @patch('login.views.Locations.objects')
    @patch('login.views.Users.objects')
    def test_search_paginates_to_ten_results(self, users, locations):
        users.select_related.return_value.get.return_value = SimpleNamespace(
            access_level=2,
            location_id=10,
        )
        locations.filter.return_value.values_list.return_value = []
        paged_users = [
            SimpleNamespace(
                user_id=index,
                first_name='User',
                last_name=str(index),
                location=SimpleNamespace(name='Main Lab'),
                access_level=4,
            )
            for index in range(1, 12)
        ]
        users.filter.return_value.select_related.return_value.order_by.return_value.__getitem__.return_value = paged_users

        response = searchManagedUsers(self.post_search_request({'user_id': 5, 'offset': 20}))

        data = json.loads(response.content)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['results']), 10)
        self.assertEqual(data['offset'], 20)
        self.assertEqual(data['next_offset'], 30)
        self.assertTrue(data['has_more'])
# class SearchManagedUsersTests


# Tests for loginMain - getAccessibleLocationIds (KM-149).
# loginMain
class LoginMainTests(SimpleTestCase):
    def setUp(self):
       self.factory = RequestFactory() 
       
       # Simulated (mock) user with hashed password.
       # User information similar to that used in frontend tests.
       self.test_user = {
            'user_id': 526,
            'email': 'johnny@example.com',
            'access_level': 4,
            'password': make_password('Password123'),
        }
    # setUp(self)

    # Test valid credentials.
    @patch('login.views.Users.objects')
    def test_login_with_valid_creds(self, users):
        users.get.return_value = SimpleNamespace(**self.test_user)

        # Simulated valid login attempt.
        request = self.factory.get(
            '/login',
            {
                'User': self.test_user['email'],
                'Password': 'Password123',
            },
        )

        # Call real Django API, verify success (200 OK).
        response = loginMain(request)
        self.assertEqual(response.status_code, 200)

        # Inspect and verify returned user information.
        data = json.loads(response.content)
        self.assertEqual(data, { 
            'userID': self.test_user['user_id'],
            'accessLevel': self.test_user['access_level'],
            },
        )
    # def test_login_with_valid_creds

    # Test incorrect password behavior.
    @patch('login.views.Users.objects')
    def test_login_with_incorrect_password(self, users):
        # Returned mock user info (converted to SimpleNamespace)
        users.get.return_value = SimpleNamespace(**self.test_user)

        # Attempted login with incorrect password.
        request = self.factory.get(
            '/login',
            {
                'User': self.test_user['email'],
                'Password': 'WrongPassword123',
            },
        )

        # Call loginMain view with incorrect password; verify if rejected.
        response = loginMain(request)
        self.assertEqual(response.status_code, 400)

        data = response.content
        self.assertEqual(data.decode(), 'Login failed; invalid information.')

        # Confirm correct user searched.
        users.get.assert_called_once_with(email=self.test_user['email'])
    # def test_login_with_incorrect_password
# class LoginMainTest


# forgotPasswordReq
class ForgotPasswordReqTests(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()

        # User info (repeated).
        self.test_user = {
            'user_id': 526,
            'email': 'john@example.com',
            'access_level': 4,
        }
    # def setUp(self)
    
    # Test for forgotten password; user has valid email address.
    @patch('login.views.send_mail')
    @patch('login.views.Users.objects')
    def test_forgotten_password_valid_email(self, users, mock_send_mail):
        users.get.return_value = SimpleNamespace(**self.test_user)

        # POST request with email. 
        request = self.factory.post(
            '/login/forgotPasswordReq',
            data=json.dumps({
                'email': self.test_user['email'],
            }),
            content_type='application/json',
        )

        # Call to Django view, successful response verification.
        response = forgotPasswordReq(request)
        self.assertEqual(response.status_code, 200)

        # Confirmation message.
        data = json.loads(response.content)
        self.assertEqual(data, {
            'status': 'OK',
            'message': 'Reset instructions have been sent.' 
        })

        # User found via email? Check call to email function.
        users.get.assert_called_once_with(email=self.test_user['email'])
        mock_send_mail.assert_called_once_with(
            'Kemyze: Reset Password',
            'Hello - please follow the email reset instructions below.',
            'no-reply@kemyze.com',
            [self.test_user['email']],
            fail_silently=False,
        )
    # def test_forgotten_password_valid_email

    # Test for missing email.
    def test_forgotten_password_missing_email(self):
        # Reset request with no email.
        request = self.factory.post(
            '/login/forgotPasswordReq',
            data=json.dumps({}),
            content_type='application/json',
        )

        response = forgotPasswordReq(request)
        self.assertEqual(response.status_code, 400)

        data = json.loads(response.content)
        self.assertEqual(data, {
            'status': 'error',
            'message': 'Missing or empty email parameter.',
        })
    # def test_forgotten_password_missing_email

    # Test with email not present in database.
    @patch('login.views.send_mail')
    @patch('login.views.Users.objects')
    def test_forgotten_password_unknown_email(self, users, mock_send_mail):
        # Nonexistent user.
        users.get.side_effect = Users.DoesNotExist
        request = self.factory.post(
            '/login/forgotPasswordReq',
            data=json.dumps({
                'email': 'nonexistent@example.com',
            }),
            content_type='application/json',
        )

        response = forgotPasswordReq(request)
        self.assertEqual(response.status_code, 200)

        data = json.loads(response.content)
        self.assertEqual(data, {
            'status': 'OK',
            'message': 'Reset instructions have been sent.' 
        })

        # Ensure no reset email sent.
        mock_send_mail.assert_not_called()
    # def test_forgotten_password_unknown_email
# class ForgotPasswordReqTests


# getUser
class GetUserTests(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()

        # User info.
        self.test_user = {
            'user_id': 526,
            'first_name': 'Johnny',
            'last_name': 'Appleseed',
            'email': 'john@example.com',
            'phone': '5551234567',
            'access_level': 4,
        }

        # Mock object for location.
        self.test_location = SimpleNamespace(
            location_id=10,
            name='School',
        )
    # def setUp(self)

    # Test for successful profile retrieval.
    @patch('login.views.Users.objects')
    def test_get_user_profile(self, users):
        # Mock user with assigned location.
        mock_user = SimpleNamespace(
            **self.test_user,
            location=self.test_location,
            location_id=10,
        )
        
        # Lookups for active user and requested user in getUser (with GET request).
        users.get.side_effect = [mock_user, mock_user];
        getUserReq = self.factory.get(
            '/login/getUser',
            {
                'active_user_id': 526,
                'user_id': 526,
            },
        )
        
        getUserRes = getUser(getUserReq)
        self.assertEqual(getUserRes.status_code, 200)

        # Convert json response, insepct returned profile info.
        data = json.loads(getUserRes.content)
        self.assertEqual(data, {
            'user_id': 526,
            'first_name': 'Johnny',
            'last_name': 'Appleseed',
            'email': 'john@example.com',
            'phone': '5551234567',
            'access_level': 4,
            'location': 'School',
        })

        # Eneusre password not in profile response.
        # Confirm backend search of active and requested users.
        self.assertNotIn('password', data)
        self.assertEqual(users.get.call_count, 2)
    # def test_get_user_profile

    # Test profile retrieval in event of missing ID.
    @patch('login.views.Users.objects')
    def test_get_user_missing_id(self, users):
        getUserReq = self.factory.get(
            '/login/getUser',
            {
                'active_user_id': 526,
            },
        )
        getUserRes = getUser(getUserReq)
        self.assertEqual(getUserRes.content.decode(),
                        "Missing 'user_id' Parameter",
                        )
        users.get.assert_not_called()
    # def test_get_user_missing_id

    # Test for unauthorized access. One user requests a different user's information.
    @patch('login.views.Users.objects')
    def test_get_user_unauthorized(self, users):
        # Requesting user.
        active_user = SimpleNamespace(
            user_id=526,
            access_level=4,
            location_id=10,
        )

        # Requested user.
        req_user = SimpleNamespace(
            user_id=297,
            access_level=4,
            location_id=10,
        )

        # Side effect for active user vs. target (requested).
        users.get.side_effect = [active_user, req_user]
        getUserReq = self.factory.get(
            '/login/getUser',
            {
                'active_user_id': 526,
                'user_id': 297,
            },
        )

        # Try to deny access.
        getUserRes = getUser(getUserReq)
        self.assertEqual(getUserRes.status_code, 403)
        self.assertEqual(getUserRes.content.decode(),
                        "User does not have access to other users' information",
                        )
    # def test_get_user_unauthorized
# class GetUserTests


# editUser
class EditUserTests(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()

        # Requesting user.
        self.active_user = {
            'user_id': 526,
            'access_level': 3,
            'location_id': 10,
        }

        # Requested user whose profile is being edited.
        self.req_user = {
            'user_id': 297,
            'first_name': 'Johnny',
            'last_name': 'Appleseed',
            'email': 'john@example.com',
            'phone': '5551234567',
            'access_level': 4,
            'location_id': 10,
        }
    # def setUp(self)

    # Test valid update to a profile's information.
    @patch('login.views.Users.objects')
    def test_edit_user_valid(self, users):
        active_user = SimpleNamespace(**self.active_user)
        req_user = MagicMock(**self.req_user)

        # Simulated database searches for both users.
        # POST request with updated profile info.
        users.get.side_effect = [active_user, req_user]
        editUserReq = self.factory.post(
            '/login/editUser',
            data=json.dumps({
                'active_user_id': 526,
                'user_id': 297,
                'first_name': 'Jonathan',
                'phone': '5559876543',
            }),
            content_type='application/json',
        )

        # Call to editUser Django view, successful response verification.
        editUserRes = editUser(editUserReq)
        self.assertEqual(editUserRes.status_code, 200)
        self.assertEqual(editUserRes.content.decode(), 'Success')

        # Check whether user information was updated and user saved.
        self.assertEqual(req_user.first_name, 'Jonathan')
        self.assertEqual(req_user.phone, '5559876543')
        req_user.save.assert_called_once_with()
    # def test_edit_user_valid

    # Test editing user with a missing userID.
    @patch('login.views.Users.objects')
    def test_edit_user_missing_id(self, users):
        editUserReq = self.factory.post(
            '/login/editUser',
            data=json.dumps({
                'active_user_id': 526,
                'first_name': 'Jonathan',
            }),
            content_type='application/json',
        )
        editUserRes = editUser(editUserReq)

        # Check for missing parameter error.
        self.assertEqual(editUserRes.status_code, 400)
        self.assertEqual(
            editUserRes.content.decode(),
            "Missing 'user_id' Parameter",
        )
        users.get.assert_not_called()
    # def test_edit_user_missing_id

    # Test unauthorized attempt to edit profile.
    # Test case uses access level 4.
    @patch('login.views.Users.objects')
    def test_edit_user_unauthorized(self, users):
        active_user = SimpleNamespace(
            **{**self.active_user, 'access_level': 4}
        )

        req_user = MagicMock(**self.req_user)
        users.get.side_effect = [active_user, req_user]

        editUserReq = self.factory.post(
            '/login/editUser',
            data=json.dumps({
                'active_user_id': 526,
                'user_id': 297,
                'first_name': 'Jonathan',
            }),
            content_type='application/json',
        )
        editUserRes = editUser(editUserReq)

        # Verify whether to attempt to edit was denied.
        # Also ensure requested user's info. was not saved.
        self.assertEqual(editUserRes.status_code, 403)
        self.assertEqual(
            editUserRes.content.decode(),
            "User does not have permission to edit profiles",
        )
        req_user.save.assert_not_called()
    # def test_edit_user_unauthorized

    # Editing with invalid email.
    @patch('login.views.Users.objects')
    def test_edit_user_invalid_email(self, users):

        active_user = SimpleNamespace(**self.active_user)
        req_user = MagicMock(**self.req_user)

        users.get.side_effect = [active_user, req_user]

        editUserReq = self.factory.post(
            '/login/editUser',
            data=json.dumps({
                'active_user_id': 526,
                'user_id': 297,
                'email': 'invalid-email',
            }),
            content_type='application/json',
        )
        editUserRes = editUser(editUserReq)

        # Verify email validation error. Ensure information not saved.
        self.assertEqual(editUserRes.status_code, 400)
        self.assertEqual(
            editUserRes.content.decode(),
            "Invalid email",
        )
        req_user.save.assert_not_called()
    # def test_edit_user_invalid_email
# class EditUserTests


# addUser
class AddUserTests(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()

        # Info of user adding a new account.
        self.active_user = {
            'user_id': 989,
            'access_level': 3,
        }

        # Location for new user (example).
        self.test_location = SimpleNamespace(
            location_id=10,
            name='School',
        )

        # Info. for new user account.
        self.new_user = {
            'user_id': self.active_user['user_id'],
            'name': 'Johnny Appleseed',
            'location': 'School',
            'phone': '5551234567',
            'email': 'john@example.com',
            'authorization': 'Quaternary',
            'password': 'Password123',
        }
    # def setUp(self)

    @patch('login.views.Locations.objects')
    @patch('login.views.Users.objects')
    def test_add_user_valid(self, users, locations):
        # Mock requesting user.
        active_user = SimpleNamespace(
            **self.active_user,
            location=self.test_location,
        )

        # First lookup finds requester. Second finds no existing email.
        users.get.side_effect = [active_user, Users.DoesNotExist]

        # Return valid location.
        locations.filter.return_value.first.return_value = self.test_location

        # Simulate request to create a user, call Django view.
        addUserReq = self.factory.post(
            '/login/addUser',
            data=json.dumps(self.new_user),
            content_type='application/json',
        )
        addUserRes = addUser(addUserReq)

        self.assertEqual(addUserRes.status_code, 200)
        self.assertEqual(addUserRes.content.decode(), 'User made')

        # Confirm account was created.
        users.create.assert_called_once()

        # Inspect values passed to Users.objects.create().
        created_user = users.create.call_args.kwargs

        self.assertEqual(created_user['first_name'], 'Johnny')
        self.assertEqual(created_user['last_name'], 'Appleseed')
        self.assertEqual(created_user['email'], self.new_user['email'])
        self.assertEqual(created_user['access_level'], 4)
        self.assertEqual(created_user['location'], self.test_location)

        # Verify password was hashed before being stored, and that hash matches original password.
        self.assertNotEqual(
            created_user['password'],
            self.new_user['password'],
        )

        # Verify the hash matches the original password.
        self.assertTrue(
            check_password(
                self.new_user['password'],
                created_user['password'],
            )
        )
    # def test_add_user_valid

    # Test request submission with missing field (name),
    @patch('login.views.Users.objects')
    def test_add_user_missing_field(self, users):
        request_data = {
            **self.new_user,
        }

        # Remove required field manually.
        request_data.pop('name')
        addUserReq = self.factory.post(
            '/login/addUser',
            data=json.dumps(request_data),
            content_type='application/json',
        )
        addUserRes = addUser(addUserReq)

        self.assertEqual(addUserRes.status_code, 400)
        self.assertEqual(
            addUserRes.content.decode(),
            'Missing name Parameter',
        )

        # Check database action prevention.
        users.get.assert_not_called()
        users.create.assert_not_called()
    # def test_add_user_missing_field

    # Test for quaternary attempt at account creation.
    @patch('login.views.Locations.objects')
    @patch('login.views.Users.objects')
    def test_add_user_unauthorized(self, users, locations):
        active_user = SimpleNamespace(
            **{**self.active_user, 'access_level': 4},
            location=self.test_location,
        )

        users.get.return_value = active_user
        locations.filter.return_value.first.return_value = self.test_location

        addUserReq = self.factory.post(
            '/login/addUser',
            data=json.dumps(self.new_user),
            content_type='application/json',
        )
        addUserRes = addUser(addUserReq)

        self.assertEqual(addUserRes.status_code, 403)
        self.assertEqual(
            addUserRes.content.decode(),
            'User is not allowed to make users',
        )
        users.create.assert_not_called()

        # Test for account creation with existing email.
    @patch('login.views.Locations.objects')
    @patch('login.views.Users.objects')
    def test_add_user_duplicate_email(self, users, locations):
        active_user = SimpleNamespace(
            **self.active_user,
            location=self.test_location,
        )

        existing_user = SimpleNamespace(
            user_id=297,
            email=self.new_user['email'],
        )

        # Requester exists, and email is already registered.
        users.get.side_effect = [active_user, existing_user]
        locations.filter.return_value.first.return_value = self.test_location

        addUserReq = self.factory.post(
            '/login/addUser',
            data=json.dumps(self.new_user),
            content_type='application/json',
        )
        addUserRes = addUser(addUserReq)

        self.assertEqual(addUserRes.status_code, 400)
        self.assertEqual(
            addUserRes.content.decode(),
            'User Already Exists',
        )

        users.create.assert_not_called()
    # def test_add_user_duplicate_email
# class AddUserTests        


# _get_accessible_location_ids
class GetAccessibleLocationIdsTests(SimpleTestCase):
    # Setup with simulated location IDs.
    def setUp(self):
        self.root_id = 10
        self.child_ids = [11, 12]
        self.grandchild_id = 13
    # def setUp(self)

    # Test location with no descendants.
    @patch('login.views.Locations.objects')
    def test_get_accessible_location_root(self, locations):

        # Simulate no child locations found.
        locations.filter.return_value.values_list.return_value = []

        # Call helper function directly. Root location should still be included.
        result = _get_accessible_location_ids(self.root_id)
        self.assertEqual(result, {10})

        # Verify the database was searched.
        locations.filter.assert_called_once_with(
            parent_id__in=[10]
        )
    # def test_get_accessible_location_root

    @patch('login.views.Locations.objects')
    def test_get_accessible_location_descendants(self, locations):

        # Simulate successive levels of the location hierarchy.
        locations.filter.return_value.values_list.side_effect = [
            [11, 12],  # Children of root 10.
            [13],      # Grandchild under one of the children.
            [],        # No additional descendants.
        ]

        result = _get_accessible_location_ids(self.root_id)

        # All reachable locations should be returned.
        self.assertEqual(result, {10, 11, 12, 13})

        # Verify all three hierarchy levels were checked.
        self.assertEqual(locations.filter.call_count, 3)
    # def test_get_accessible_location_descendants
# class GetAccessibleLocationIdsTests 
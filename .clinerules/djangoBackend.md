---
paths:
  - "**/*.py"
---
# Django Backend Rules

Follow these rules when writing or editing Python code.

- Shared models live in `common/models.py` and are `managed = False`. MySQL owns the schema, not Django migrations. Never run `makemigrations`/`migrate` for these models. Schema and trigger changes go in a `.sql` file under `sql/` and must be approved by the team before anyone runs them.
- Every view must have a docstring in the existing format: Route, Method, Parameters, Returns.
- Check the HTTP method first and return `HttpResponseNotAllowed` for anything else.
- Validate every request parameter. Return `HttpResponseBadRequest` with a clear message when one is missing or invalid.
- Enforce access level on the server by looking up the user (`Users.objects.get(user_id=...)`). Never trust an access level sent by the client for create, edit, or delete actions.
- Use the Django ORM. Never build SQL with string formatting.
- Never add new secrets to `kemyze/settings.py`. Read them from environment variables.
- Never return exception text to the client (no `f"...{e}"` or `str(e)` in responses). Return a generic message like `HttpResponseServerError("Could not update container")`.
- Return data with `JsonResponse`, and errors with the matching response class (`HttpResponseBadRequest`, `HttpResponseForbidden`, `HttpResponseNotAllowed`, `HttpResponseServerError`).
- Name new routes in the existing camelCase style (`getContainer`, `editContainer`).

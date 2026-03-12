# Install dependencies
python -m pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Create Vercel-compatible output vercel directory
mkdir -p .vercel/output/static
cp -r staticfiles/ .vercel/output/static/

python manage.py makemigrations
python manage.py migrate
python -m venv venv
source venv/bin/activate

# Install dependencies
python -m pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate
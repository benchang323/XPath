from pathlib import Path
import json
from datetime import timedelta
import os,sys

BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET_FILE = BASE_DIR / "secret.json"

#with open(SECRET_FILE, "r") as f:
#    SECRET_DATA = json.load(f)

#SECRET_KEY = SECRET_DATA.get("SECRET_KEY", 'django-insecure-p=rln@%5qr4)i2kx7r=subh1yan9v5^nwg)^d=3y39k)%bv=_w')

#DEBUG = SECRET_DATA.get("DEBUG", True)

#ALLOWED_HOSTS = SECRET_DATA.get("ALLOWED_HOSTS", [])
ALLOWED_HOSTS = ['159.203.130.16', 'localhost']
DEBUG = True
SECRET_KEY="abc"

CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = ["*"]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'trips_likes',
    'rest_framework.authtoken',
    'rest_framework_simplejwt.token_blacklist',
    'user_account.apps.UserAccountConfig',
    'matching.apps.MatchingConfig',
    'trips.apps.TripsConfig',
    'compatibility.apps.CompatibilityConfig',
    'share.apps.ShareConfig',
    'chat_app.apps.ChatAppConfig',
    'django_filters',
    'corsheaders',
]


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'django_server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'django_server.wsgi.application'

DATABASES = {
    'default': {
        'NAME': 'defaultdb',
        "ENGINE": "django.db.backends.mysql",
        'HOST': 'db-mysql-nyc3-64965-do-user-15766233-0.c.db.ondigitalocean.com',  
        'PORT': 25060,
        'USER': 'doadmin',
        'PASSWORD': 'AVNS_CLFfOKpR1CsFMw5Zxf9',
    }
}

if 'test' in sys.argv or 'test_coverage' in sys.argv:  # Adjust the condition based on how you run tests
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'

USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'
# STATICFILES_DIRS = [BASE_DIR / "static"]
# STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST_FRAMEWORK configuration
REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'user_account.exceptions.status_code_handler',
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ]
}
AUTH_USER_MODEL = 'user_account.User'

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'django_debug.log'),
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'], 
            'level': 'INFO',
            'propagate': True,
        },
    },
}
## Configs to Interface with other apps
SEND_GRID_API_KEY = "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"
DGO_SPACES_ACCESS_KEY = "DO00NUFVQ2ZW9VLWRD37"
DGO_SPACES_SECRET_KEY = "XzMmuPvJMMMztvcsV38W31dY22wzIAH9fEjeNFbOVN0"
DGO_BUCKET_NAME = 'oose-xpath'
DGO_BUCKET_URL = 'https://nyc3.digitaloceanspaces.com'
OPENAI_KEY = "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"
NEO4J_URI= 'neo4j+s://85d583d3.databases.neo4j.io'
NEO4J_USERNAME='neo4j'
NEO4J_PASSWORD='j_fsZQ0sTCbOLY5AY4Ngfrf1VvlqrlW3ZfLP_ta2A78'
AURA_INSTANCEID='85d583d3'
AURA_INSTANCENAME='Xpath'
FROM_EMAIL='xpath.inc@gmail.com'
GOOGLE_API_KEY='AIzaSyBb2fVcyg2aCfvejujrwGrHte4upg_tF1c'
STREAM_API_KEY = "rxuvyjpj3ypg"
STREAM_API_SECRET = "ubmkggkp6q67qenu2g8hxffsqwn6ppeut7ux8ga9bx74cnwu82psz3y9uny5zd97"

from django.db import models
from django.core.validators import MinValueValidator
from datetime import date
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.models import AbstractUser

# User authentication
# class UserAuth(models.Model):
#     username = models.CharField(max_length=50, unique = True, null = False)
#     password = models.CharField(max_length=150, null= False)
#     email = models.EmailField(null = False)
#     phoneNumber= models.CharField(max_length=15, null=False)
#     isValidated = models.BooleanField(default = False)
    
#     def set_password(self, raw_password):
#         # Hash the password before saving
#         self.password = make_password(raw_password)

#     def check_password(self, raw_password):
#         # Check if the provided raw password matches the hashed password
#         return check_password(raw_password, self.password)
    
#     def save(self, *args, **kwargs):
#         # Hash the password before saving
#         self.password = (self.password) # Hash password
        
#         super(UserAuth, self).save(*args, **kwargs)
        
#     def __str__(self):
#         return self.username

class User(AbstractUser):
    username = models.CharField(max_length=50, unique = True, null = False)
    password = models.CharField(max_length=150, null= False)
    email = models.EmailField(unique = True, null = False)
    phoneNumber= models.CharField(max_length=15, null=False)
    otp = models.CharField(max_length=6, null=True,default=None)
    isVerified = models.BooleanField(null=True,default=False)
    
    name = None
    first_name = None
    last_name = None
    
    USERNAME_FIELD = 'username'
    
# Authentication for DOB- ensure only adults are using this platform as of right now
class DobAuth(models.Model):
    
    # If account is deleted delete this value as well.
    user = models.ForeignKey(User, to_field='username', on_delete=models.CASCADE)
    
    # Only users who are 18+ are allowed on XPath  
    birth_date = models.DateField(validators=[MinValueValidator(limit_value=date.today().year-18)]) 
    
    def __str__(self):
        return str(self.birth_date) # Convert birth_date to string for representation

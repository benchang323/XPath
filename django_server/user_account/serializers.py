from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import DobAuth, User

# class UserAuthSerializer(ModelSerializer):
#     class Meta:
#         model = UserAuth
#         # Serialized representation
#         fields = ['id', 'username', 'email', 'phoneNumber', 'password']  

#         extra_kwargs = {
#             'password': {'write_only': True},  # Ensure password is write-only during serialization
#         }

#     def create(self, validated_data):
#         # Custom 'create' method to handle password hashing before saving the user object
#         user = UserAuth(
#             username=validated_data['username'],
#             email=validated_data['email'],
#             phoneNumber=validated_data['phoneNumber'],
            
#         )
#         user.set_password(validated_data['password'])
#         user.save()
#         return user

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'phoneNumber', 'otp', 'isVerified']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('otp', None)
        validated_data.pop('isVerified', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance
# Not used as of right now but keeping it just in case
class DobAuthSerializer(serializers.ModelSerializer): 
    class Meta:
        model = DobAuth
        # Serialized representation
        fields = ['id', 'user', 'birth_date']

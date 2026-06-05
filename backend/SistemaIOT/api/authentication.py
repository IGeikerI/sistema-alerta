from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from rest_framework_simplejwt.settings import api_settings

from .models import Usuario


class UsuarioJWTAuthentication(JWTAuthentication):
    """
    Autentica JWT emitidos para api.Usuario.

    El proyecto mantiene Usuario como una tabla propia de la aplicacion, no
    como AUTH_USER_MODEL de Django. Por eso no se usa get_user_model().
    """

    def get_user(self, validated_token):
        try:
            user_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError as exc:
            raise InvalidToken(
                "El token no contiene un identificador de usuario valido"
            ) from exc

        try:
            return Usuario.objects.get(**{api_settings.USER_ID_FIELD: user_id})
        except Usuario.DoesNotExist as exc:
            raise AuthenticationFailed(
                "Usuario no encontrado", code="user_not_found"
            ) from exc

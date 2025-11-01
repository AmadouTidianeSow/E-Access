import {AuthenticationStrategy} from '@loopback/authentication';
import {
  TokenServiceBindings,
  JWTService,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {Request, HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';

export class JWTAuthenticationStrategy implements AuthenticationStrategy {
  name = 'jwt';

  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public tokenService: JWTService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile> {
    const token = this.extractCredentials(request);
    try {
      // verifyToken retourne déjà un UserProfile
      return await this.tokenService.verifyToken(token);
    } catch {
      throw new HttpErrors.Unauthorized('Invalid token');
    }
  }

  extractCredentials(request: Request): string {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new HttpErrors.Unauthorized('Authorization header missing');
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new HttpErrors.Unauthorized(
        'Authorization header is not of type Bearer.',
      );
    }
    return parts[1];
  }
}

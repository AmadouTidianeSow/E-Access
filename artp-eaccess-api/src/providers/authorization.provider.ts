// src/providers/authorization.provider.ts

import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  AuthorizationBindings,
  Authorizer,
} from '@loopback/authorization';
import {Provider, inject} from '@loopback/core';
import {
  SecurityBindings,
  UserProfile,
  securityId,
} from '@loopback/security';
import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';

export class MyAuthorizationProvider implements Provider<Authorizer> {
  constructor(
    @inject(SecurityBindings.USER)
    private userProfile: UserProfile,

    @repository(UserRepository)
    private userRepo: UserRepository,

    // 1) injection optionnelle du metadata
    @inject(AuthorizationBindings.METADATA, {optional: true})
    private metadata?: AuthorizationMetadata,
  ) {}

  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    _context: AuthorizationContext,
    // 2) fallback sur metadata injecté ou vide
    metadata: AuthorizationMetadata = this.metadata ?? {},
  ): Promise<AuthorizationDecision> {
    // 3) si pas de metadata ou pas de allowedRoles => ALLOW
    if (!metadata.allowedRoles || metadata.allowedRoles.length === 0) {
      return AuthorizationDecision.ALLOW;
    }

    // 4) Récupérer les rôles depuis le UserProfile ou la BDD
    let roles: string[] = [];
    if (this.userProfile.role) {
      roles = [this.userProfile.role as string];
    } else {
      const id = this.userProfile[securityId];
      if (!id) return AuthorizationDecision.DENY;
      try {
        const user = await this.userRepo.findById(id as string);
        roles = [user.role];
      } catch {
        return AuthorizationDecision.DENY;
      }
    }

    // 5) comparer et décider
    const isAllowed = metadata.allowedRoles.some(r => roles.includes(r));
    return isAllowed
      ? AuthorizationDecision.ALLOW
      : AuthorizationDecision.DENY;
  }
}

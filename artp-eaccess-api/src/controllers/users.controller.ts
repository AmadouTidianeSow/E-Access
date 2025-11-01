// src/controllers/users.controller.ts

import {
  post,
  requestBody,
  HttpErrors,
  getModelSchemaRef,
  response,
} from '@loopback/rest';
import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';
import {User} from '../models';
import {inject} from '@loopback/core';
import {
  TokenServiceBindings,
} from '@loopback/authentication-jwt';
import {TokenService} from '@loopback/authentication';
import {
  UserProfile,
  securityId,
} from '@loopback/security';
import {authenticate} from '@loopback/authentication';
import {SecurityBindings} from '@loopback/security';
import * as bcrypt from 'bcryptjs';
import {Role} from '../constants';

// --- DTOs ---

/** Data required to register a new user */
export interface RegisterRequest {
  nom: string;
  prenom: string;
  login: string;
  password: string;
  role: Role;
}

/** User credentials for login */
export interface Credentials {
  login: string;
  password: string;
}

/** Payload for changing password */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/** Response returned after successful authentication */
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
    role: Role;
  };
}

export class UsersController {
  constructor(
    @repository(UserRepository)
    public userRepo: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public tokenService: TokenService,
    @inject(SecurityBindings.USER, {optional: true})
    public currentUserProfile?: UserProfile,
  ) {}

  // ------- Register new user -------
  @post('/users/register')
  @response(200, {
    description: 'Register a new user',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async register(
    @requestBody({
      description: 'Data for new user registration',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['nom', 'prenom', 'login', 'password', 'role'],
            properties: {
              nom: {type: 'string'},
              prenom: {type: 'string'},
              login: {type: 'string'},
              password: {type: 'string', minLength: 8},
              role: {type: 'string', enum: Object.values(Role)},
            },
          },
        },
      },
    })
    req: RegisterRequest,
  ): Promise<User> {
    // Check for existing login
    const exists = await this.userRepo.count({login: req.login});
    if (exists.count > 0) {
      throw new HttpErrors.Conflict('Ce login est déjà utilisé');
    }
    // Hash the password
    const hash = await bcrypt.hash(req.password, 10);
    // Create the user
    const created = await this.userRepo.create({
      nom: req.nom,
      prenom: req.prenom,
      login: req.login,
      password: hash,
      role: req.role,
    });
    // Reload without the password field
    const safeUser = await this.userRepo.findById(created.id!, {
      fields: {password: false},
    });
    return safeUser;
  }

  // ------- Authenticate user -------
  @post('/users/login')
  @response(200, {
    description: 'Login and receive a JWT token',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {type: 'string'},
            user: {
              type: 'object',
              properties: {
                id: {type: 'string'},
                nom: {type: 'string'},
                prenom: {type: 'string'},
                role: {type: 'string', enum: Object.values(Role)},
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      description: 'Credentials for login',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['login', 'password'],
            properties: {
              login: {type: 'string'},
              password: {type: 'string'},
            },
          },
        },
      },
    })
    creds: Credentials,
  ): Promise<AuthResponse> {
    // Find user by login
    const user = await this.userRepo.findOne({where: {login: creds.login}});
    if (!user) {
      throw new HttpErrors.Unauthorized('Login ou mot de passe incorrect');
    }
    // Verify password
    const matched = await bcrypt.compare(creds.password, user.password);
    if (!matched) {
      throw new HttpErrors.Unauthorized('Login ou mot de passe incorrect');
    }
    // Build user profile for JWT
    const userProfile: UserProfile = {
      [securityId]: user.id!,
      name: `${user.nom} ${user.prenom}`,
      role: user.role,
    };
    // Generate token
    const token = await this.tokenService.generateToken(userProfile);
    return {
      token,
      user: {
        id: user.id!,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role as Role,
      },
    };
  }

  // ------- Change password -------
  @post('/users/change-password')
  @authenticate('jwt')
  @response(204, {
    description: 'Change password for current user',
  })
  async changePassword(
    @requestBody({
      description: 'Old and new password',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['oldPassword', 'newPassword'],
            properties: {
              oldPassword: {type: 'string'},
              newPassword: {type: 'string', minLength: 8},
            },
          },
        },
      },
    })
    req: ChangePasswordRequest,
  ): Promise<void> {
    // Ensure user is authenticated
    const userId = this.currentUserProfile?.[securityId] as string | undefined;
    if (!userId) {
      throw new HttpErrors.Unauthorized('Utilisateur non authentifié');
    }
    // Retrieve current user
    const user = await this.userRepo.findById(userId);
    // Verify old password
    const matched = await bcrypt.compare(req.oldPassword, user.password);
    if (!matched) {
      throw new HttpErrors.Unauthorized('Ancien mot de passe incorrect');
    }
    // Hash and update to new password
    const newHash = await bcrypt.hash(req.newPassword, 10);
    await this.userRepo.updateById(userId, {password: newHash});
  }
}

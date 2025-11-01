// src/application.ts
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import { FILE_UPLOAD_SERVICE, STORAGE_DIRECTORY } from './keys';
import multer from 'multer';

import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {AuthorizationComponent, AuthorizationTags} from '@loopback/authorization';
import {JWTAuthenticationComponent} from '@loopback/authentication-jwt';

import {JWTAuthenticationStrategy} from './authentication-strategies/jwt-strategy';
import {MyAuthorizationProvider} from './providers/authorization.provider';
import {UserRepository} from './repositories';
import {NotificationService} from './services/notification.service';
import {ScannerService} from './services/scanner.service';
import {VisiteService} from './services/visite.service';

export {ApplicationConfig};

export class ArtpEAccessApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.bind('services.NotificationService').toClass(NotificationService);
    this.bind('services.ScannerService').toClass(ScannerService);
    this.bind('services.VisiteService').toClass(VisiteService);

    // 1) Séquence personnalisée
    this.sequence(MySequence);

    // 2) Static assets & Explorer
    this.static('/', path.join(__dirname, '../public'));
    this.configure(RestExplorerBindings.COMPONENT).to({path: '/explorer'});
    this.component(RestExplorerComponent);

    // 3) File upload
    this.configureFileUpload(options.fileStorageDirectory);

    // 4) Authentification
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);


    

    // 5) Autorisation (ACL) — **clé corrigée**  
   this.component(AuthorizationComponent);
    this.bind('authorizationProviders.my-authorizer-provider')
      .toProvider(MyAuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);

    // 6) Bind repositories (LoopBack auto‑bind si vous utilisez @repository dans les controllers)
    this.bind('repositories.UserRepository').toClass(UserRepository);

    // 7) Boot options
    this.projectRoot = __dirname;
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  protected configureFileUpload(destination?: string) {
    destination = destination ?? path.join(__dirname, '../files');
    this.bind(STORAGE_DIRECTORY).to(destination);
    const multerOptions: multer.Options = {
      storage: multer.diskStorage({
        destination,
        filename: (req, file, cb) => cb(null, file.originalname),
      }),
    };
    this.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
  }
}

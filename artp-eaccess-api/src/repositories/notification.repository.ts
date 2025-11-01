// src/repositories/notification.repository.ts

import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {Notification, NotificationRelations} from '../models';
import {ArtpEAccessDataSource} from '../datasources';

export class NotificationRepository extends DefaultCrudRepository<
  Notification,
  typeof Notification.prototype.id,
  NotificationRelations
> {
  constructor(
    @inject('datasources.artpEAccess') dataSource: ArtpEAccessDataSource,
  ) {
    super(Notification, dataSource);
  }
}

// src/controllers/dashboard.controller.ts

import {repository} from '@loopback/repository';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {get, param, response} from '@loopback/rest';
import {Role} from '../constants';
import {
  VisiteRepository,
  LieuRepository,
  NotificationRepository,
} from '../repositories';

export interface DashboardSummary {
  totalVisits: number;
  pendingVisits: number;
  ongoingVisits: number;
  completedVisits: number;
}

export interface VisiteBySite {
  site: string;
  count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface VisitsPerDay {
  date: string;
  count: number;
}

export interface HoursPerDay {
  date: string;
  totalHours: number;
}

export interface LastNotification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface TodayCount {
  count: number;
}

export interface TodayHours {
  totalHours: number;
}

@authenticate('jwt')
@authorize({allowedRoles: [Role.ADMIN]})
export class DashboardController {
  constructor(
    @repository(VisiteRepository)
    private visiteRepo: VisiteRepository,
    @repository(LieuRepository)
    private lieuRepo: LieuRepository,
    @repository(NotificationRepository)
    private notifRepo: NotificationRepository,
  ) {}

  // 1) Totaux
  @get('/admin/dashboard/summary')
  @response(200, {
    description: 'Totals of visits: total, pending, ongoing, completed',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            totalVisits:   {type: 'number'},
            pendingVisits: {type: 'number'},
            ongoingVisits: {type: 'number'},
            completedVisits:{type: 'number'},
          },
          required: ['totalVisits','pendingVisits','ongoingVisits','completedVisits'],
        },
      },
    },
  })
  async summary(): Promise<DashboardSummary> {
    const total     = await this.visiteRepo.count();
    const pending   = await this.visiteRepo.count({statut: 'en_attente'});
    const ongoing   = await this.visiteRepo.count({statut: 'en_cours'});
    const completed = await this.visiteRepo.count({statut: 'terminee'});
    return {
      totalVisits:     total.count,
      pendingVisits:   pending.count,
      ongoingVisits:   ongoing.count,
      completedVisits: completed.count,
    };
  }

  // 2) Visites par site
  @get('/admin/dashboard/visites-by-site')
  @response(200, {
    description: 'Visits grouped by site',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              site:  {type: 'string'},
              count: {type: 'number'},
            },
          },
        },
      },
    },
  })
  async visitesBySite(): Promise<VisiteBySite[]> {
    // On utilise directement le driver MongoDB
    const mongo = (this.visiteRepo.dataSource.connector as any).db;
    const coll = mongo.collection('Visite');
    type RawSite = { site: string; count: number };
    const raw = (await coll.aggregate([
      { $lookup: {
          from: 'Lieu',
          localField: 'lieuId',
          foreignField: '_id',
          as: 'lieu',
      }},
      { $unwind: '$lieu' },
      { $group: { _id: '$lieu.nom', count: { $sum: 1 } } },
      { $project: { site: '$_id', count: 1, _id: 0 } },
    ]).toArray()) as RawSite[];
    return raw.map(r => ({site: r.site, count: r.count}));
  }

  // 3) Répartition par statut
  @get('/admin/dashboard/status-distribution')
  @response(200, {
    description: 'Distribution of visits by status',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status:{type:'string'},
              count: {type:'number'},
            },
          },
        },
      },
    },
  })
  async statusDistribution(): Promise<StatusDistribution[]> {
    const mongo = (this.visiteRepo.dataSource.connector as any).db;
    const coll = mongo.collection('Visite');
    type RawStatus = { status: string; count: number };
    const raw = (await coll.aggregate([
      { $group: { _id: '$statut', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]).toArray()) as RawStatus[];
    return raw.map(r => ({status: r.status, count: r.count}));
  }

  // 4) Visites par jour
  @get('/admin/dashboard/visits-per-day')
  @response(200, {
    description: 'Number of visits per day',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type:'object',
            properties: {
              date:  {type:'string',format:'date'},
              count: {type:'number'},
            },
          },
        },
      },
    },
  })
  async visitsPerDay(
    @param.query.number('days', {schema: {minimum:1, default:7}}) days = 7,
  ): Promise<VisitsPerDay[]> {
    const mongo = (this.visiteRepo.dataSource.connector as any).db;
    const coll = mongo.collection('Visite');
    const since = new Date();
    since.setDate(since.getDate() - days + 1);
    type RawDay = { date: string; count: number };
    const raw = (await coll.aggregate([
      { $match: { dateDebut: { $gte: since.toISOString() } } },
      { $group: { _id: { $substr: ['$dateDebut', 0, 10] }, count: { $sum: 1 } } },
      { $project: { date: '$_id', count:1, _id:0 } },
      { $sort: { date:1 } },
    ]).toArray()) as RawDay[];
    return raw.map(r => ({date: r.date, count: r.count}));
  }



  // 6) Dernières notifications "visitor_checkin" d’aujourd’hui
  @get('/admin/dashboard/last-notifications')
  @response(200, {
    description: 'Last 10 visitor_checkin notifications for today',
    content: {
      'application/json': {
        schema: {
          type:'array',
          items: {
            type:'object',
            properties: {
              id:        {type:'string'},
              message:   {type:'string'},
              createdAt: {type:'string',format:'date-time'},
              read:      {type:'boolean'},
            },
          },
        },
      },
    },
  })
  async lastNotifications(): Promise<LastNotification[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const todayISO = startOfDay.toISOString();
    const notifications = await this.notifRepo.find({
      where: {
        and: [
          {type: 'visitor_checkin'},
          {createdAt: {gte: todayISO}},
        ],
      },
      order: ['createdAt DESC'],
      limit: 10,
    });
    return notifications.map(n => ({
      id:        n.id!,
      message:   n.message,
      createdAt: new Date(n.createdAt!).toISOString(),
      read:      Boolean(n.read),
    }));
  }

  // 7) Nombre de visites depuis 00:00 aujourd’hui
  @get('/admin/dashboard/visits-today')
  @response(200, {
    description: 'Nombre de visites commencées aujourd’hui',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            count: {type: 'number'},
          },
          required: ['count'],
        },
      },
    },
  })
  async visitsToday(): Promise<TodayCount> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const cnt = await this.visiteRepo.count({
      dateDebut: {gte: startOfDay.toISOString()},
    });
    return {count: cnt.count};
  }

 
}

import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Lieu} from '../models';
import {LieuRepository} from '../repositories';

export class LieuController {
  constructor(
    @repository(LieuRepository)
    public lieuRepository : LieuRepository,
  ) {}

  @post('/admin/lieux')
  @response(200, {
    description: 'Lieu model instance',
    content: {'application/json': {schema: getModelSchemaRef(Lieu)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lieu, {
            title: 'NewLieu',
            exclude: ['id'],
          }),
        },
      },
    })
    lieu: Omit<Lieu, 'id'>,
  ): Promise<Lieu> {
    return this.lieuRepository.create(lieu);
  }

  @get('/admin/lieux/count')
  @response(200, {
    description: 'Lieu model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Lieu) where?: Where<Lieu>,
  ): Promise<Count> {
    return this.lieuRepository.count(where);
  }

  @get('/admin/lieux')
  @response(200, {
    description: 'Array of Lieu model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Lieu, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Lieu) filter?: Filter<Lieu>,
  ): Promise<Lieu[]> {
    return this.lieuRepository.find(filter);
  }

  @patch('/admin/lieux')
  @response(200, {
    description: 'Lieu PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lieu, {partial: true}),
        },
      },
    })
    lieu: Lieu,
    @param.where(Lieu) where?: Where<Lieu>,
  ): Promise<Count> {
    return this.lieuRepository.updateAll(lieu, where);
  }

  @get('/admin/lieux/{id}')
  @response(200, {
    description: 'Lieu model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Lieu, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Lieu, {exclude: 'where'}) filter?: FilterExcludingWhere<Lieu>
  ): Promise<Lieu> {
    return this.lieuRepository.findById(id, filter);
  }

  @patch('/admin/lieux/{id}')
  @response(204, {
    description: 'Lieu PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lieu, {partial: true}),
        },
      },
    })
    lieu: Lieu,
  ): Promise<void> {
    await this.lieuRepository.updateById(id, lieu);
  }

  @put('/admin/lieux/{id}')
  @response(204, {
    description: 'Lieu PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() lieu: Lieu,
  ): Promise<void> {
    await this.lieuRepository.replaceById(id, lieu);
  }

  @del('/admin/lieux/{id}')
  @response(204, {
    description: 'Lieu DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.lieuRepository.deleteById(id);
  }
}

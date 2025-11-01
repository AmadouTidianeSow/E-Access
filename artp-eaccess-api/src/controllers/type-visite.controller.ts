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
import {TypeVisite} from '../models';
import {TypeVisiteRepository} from '../repositories';
// import {authenticate} from '@loopback/authentication';
// import {authorize} from '@loopback/authorization';
// import {Role} from '../constants';

export class TypeVisiteController {
  constructor(
    @repository(TypeVisiteRepository)
    public typeVisiteRepository : TypeVisiteRepository,
  ) {}

  @post('/admin/typevisite')
  @response(200, {
    description: 'TypeVisite model instance',
    content: {'application/json': {schema: getModelSchemaRef(TypeVisite)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TypeVisite, {
            title: 'NewTypeVisite',
            exclude: ['id'],
          }),
        },
      },
    })
    typeVisite: Omit<TypeVisite, 'id'>,
  ): Promise<TypeVisite> {
    return this.typeVisiteRepository.create(typeVisite);
  }

  @get('/admin/typevisite/count')
  @response(200, {
    description: 'TypeVisite model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(TypeVisite) where?: Where<TypeVisite>,
  ): Promise<Count> {
    return this.typeVisiteRepository.count(where);
  }

  @get('/admin/typevisite')
  @response(200, {
    description: 'Array of TypeVisite model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(TypeVisite, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(TypeVisite) filter?: Filter<TypeVisite>,
  ): Promise<TypeVisite[]> {
    return this.typeVisiteRepository.find(filter);
  }

  @patch('/admin/typevisite')
  @response(200, {
    description: 'TypeVisite PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TypeVisite, {partial: true}),
        },
      },
    })
    typeVisite: TypeVisite,
    @param.where(TypeVisite) where?: Where<TypeVisite>,
  ): Promise<Count> {
    return this.typeVisiteRepository.updateAll(typeVisite, where);
  }

  @get('/admin/typevisite/{id}')
  @response(200, {
    description: 'TypeVisite model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(TypeVisite, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(TypeVisite, {exclude: 'where'}) filter?: FilterExcludingWhere<TypeVisite>
  ): Promise<TypeVisite> {
    return this.typeVisiteRepository.findById(id, filter);
  }

  @patch('/admin/typevisite/{id}')
  @response(204, {
    description: 'TypeVisite PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TypeVisite, {partial: true}),
        },
      },
    })
    typeVisite: TypeVisite,
  ): Promise<void> {
    await this.typeVisiteRepository.updateById(id, typeVisite);
  }

  @put('/admin/typevisite/{id}')
  @response(204, {
    description: 'TypeVisite PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() typeVisite: TypeVisite,
  ): Promise<void> {
    await this.typeVisiteRepository.replaceById(id, typeVisite);
  }

  @del('/admin/typevisite/{id}')
  @response(204, {
    description: 'TypeVisite DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.typeVisiteRepository.deleteById(id);
  }
}

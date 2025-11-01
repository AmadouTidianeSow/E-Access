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
import {CategoryVisiteur} from '../models';
import {CategoryVisiteurRepository} from '../repositories';
// import {authenticate} from '@loopback/authentication';
// import {authorize}   from '@loopback/authorization';
// import {Role}        from '../constants';
// @authenticate('jwt')
// @authorize({
//   allowedRoles: [Role.ADMIN],
// })

export class CategoryVisiteurController {
  constructor(
    @repository(CategoryVisiteurRepository)
    public categoryVisiteurRepository : CategoryVisiteurRepository,
  ) {}

  @post('/admin/categories')
  @response(200, {
    description: 'CategoryVisiteur model instance',
    content: {'application/json': {schema: getModelSchemaRef(CategoryVisiteur)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CategoryVisiteur, {
            title: 'NewCategoryVisiteur',
            exclude: ['id'],
          }),
        },
      },
    })
    categoryVisiteur: Omit<CategoryVisiteur, 'id'>,
  ): Promise<CategoryVisiteur> {
    return this.categoryVisiteurRepository.create(categoryVisiteur);
  }

  @get('/admin/categories/count')
  @response(200, {
    description: 'CategoryVisiteur model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(CategoryVisiteur) where?: Where<CategoryVisiteur>,
  ): Promise<Count> {
    return this.categoryVisiteurRepository.count(where);
  }

  @get('/admin/categories')
  @response(200, {
    description: 'Array of CategoryVisiteur model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(CategoryVisiteur, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(CategoryVisiteur) filter?: Filter<CategoryVisiteur>,
  ): Promise<CategoryVisiteur[]> {
    return this.categoryVisiteurRepository.find(filter);
  }

  @patch('/admin/categories')
  @response(200, {
    description: 'CategoryVisiteur PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CategoryVisiteur, {partial: true}),
        },
      },
    })
    categoryVisiteur: CategoryVisiteur,
    @param.where(CategoryVisiteur) where?: Where<CategoryVisiteur>,
  ): Promise<Count> {
    return this.categoryVisiteurRepository.updateAll(categoryVisiteur, where);
  }

  @get('/admin/categories/{id}')
  @response(200, {
    description: 'CategoryVisiteur model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(CategoryVisiteur, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(CategoryVisiteur, {exclude: 'where'}) filter?: FilterExcludingWhere<CategoryVisiteur>
  ): Promise<CategoryVisiteur> {
    return this.categoryVisiteurRepository.findById(id, filter);
  }

  @patch('/admin/categories/{id}')
  @response(204, {
    description: 'CategoryVisiteur PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CategoryVisiteur, {partial: true}),
        },
      },
    })
    categoryVisiteur: CategoryVisiteur,
  ): Promise<void> {
    await this.categoryVisiteurRepository.updateById(id, categoryVisiteur);
  }

  @put('/admin/categories/{id}')
  @response(204, {
    description: 'CategoryVisiteur PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() categoryVisiteur: CategoryVisiteur,
  ): Promise<void> {
    await this.categoryVisiteurRepository.replaceById(id, categoryVisiteur);
  }

  @del('/admin/categories/{id}')
  @response(204, {
    description: 'CategoryVisiteur DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.categoryVisiteurRepository.deleteById(id);
  }
}

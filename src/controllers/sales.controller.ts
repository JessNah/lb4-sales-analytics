import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {Sales} from '../models';
import {SalesRepository} from '../repositories';

export class SalesController {
  constructor(
    @repository(SalesRepository)
    public salesRepository: SalesRepository,
  ) {}

  @post('/sales', {
    responses: {
      '200': {
        description: 'Sales model instance',
        content: {'application/json': {schema: getModelSchemaRef(Sales)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Sales, {exclude: ['id']}),
        },
      },
    })
    sales: Omit<Sales, 'id'>,
  ): Promise<Sales> {
    return this.salesRepository.create(sales);
  }

  @get('/sales/count', {
    responses: {
      '200': {
        description: 'Sales model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Sales)) where?: Where<Sales>,
  ): Promise<Count> {
    return this.salesRepository.count(where);
  }

  @get('/sales', {
    responses: {
      '200': {
        description: 'Array of Sales model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Sales)},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Sales))
    filter?: Filter<Sales>,
  ): Promise<Sales[]> {
    return this.salesRepository.find(filter);
  }

  @get('/sales/analytics/{country}/{year}/{month}', {
    responses: {
      '200': {
        description: 'Number of sales by country in a date YYYY/MM range.',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async analyticsMonthAndYear(
    @param.path.string('country') country: string,
    @param.path.number('year') year: number,
    @param.path.number('month') month: number,
  ): Promise<number> {
    const filter = {
      where: {
        country,
        date: {
          between: [
            new Date(year, month - 1).toISOString(),
            new Date(year, month).toISOString(),
          ] as [string, string],
        },
      },
    };

    const res = await this.salesRepository.find(filter);

    return res.length;
  }

  @get('/sales/analytics/{country}/{year}', {
    responses: {
      '200': {
        description: 'Number of sales by country for a year.',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async analyticsYear(
    @param.path.string('country') country: string,
    @param.path.number('year') year: number,
  ): Promise<number> {
    const filter = {
      where: {
        country,
        date: {
          between: [
            new Date(year, 0).toISOString(),
            new Date(year + 1, 0).toISOString(),
          ] as [string, string],
        },
      },
    };

    const res = await this.salesRepository.find(filter);

    return res.length;
  }

  @patch('/sales', {
    responses: {
      '200': {
        description: 'Sales PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Sales, {partial: true}),
        },
      },
    })
    sales: Sales,
    @param.query.object('where', getWhereSchemaFor(Sales)) where?: Where<Sales>,
  ): Promise<Count> {
    return this.salesRepository.updateAll(sales, where);
  }

  @get('/sales/{id}', {
    responses: {
      '200': {
        description: 'Sales model instance',
        content: {'application/json': {schema: getModelSchemaRef(Sales)}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Sales> {
    return this.salesRepository.findById(id);
  }

  @patch('/sales/{id}', {
    responses: {
      '204': {
        description: 'Sales PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Sales, {partial: true}),
        },
      },
    })
    sales: Sales,
  ): Promise<void> {
    await this.salesRepository.updateById(id, sales);
  }

  @put('/sales/{id}', {
    responses: {
      '204': {
        description: 'Sales PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() sales: Sales,
  ): Promise<void> {
    await this.salesRepository.replaceById(id, sales);
  }

  @del('/sales/{id}', {
    responses: {
      '204': {
        description: 'Sales DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.salesRepository.deleteById(id);
  }
}

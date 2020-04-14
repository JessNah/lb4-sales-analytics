import {Entity, model, property} from '@loopback/repository';

@model()
export class Sales extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
  })
  id?: number;


  constructor(data?: Partial<Sales>) {
    super(data);
  }
}

export interface SalesRelations {
  // describe navigational properties here
}

export type SalesWithRelations = Sales & SalesRelations;

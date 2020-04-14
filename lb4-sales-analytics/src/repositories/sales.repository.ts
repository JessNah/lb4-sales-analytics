import {DefaultCrudRepository} from '@loopback/repository';
import {Sales, SalesRelations} from '../models';
import {BridgedbCloudantDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class SalesRepository extends DefaultCrudRepository<
  Sales,
  typeof Sales.prototype.id,
  SalesRelations
> {
  constructor(
    @inject('datasources.BridgedbCloudant') dataSource: BridgedbCloudantDataSource,
  ) {
    super(Sales, dataSource);
  }
}

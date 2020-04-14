import {
  /* inject, Application, CoreBindings, */
  lifeCycleObserver, // The decorator
  LifeCycleObserver, // The interface
} from '@loopback/core';
//import the repository decorator
import {repository} from '@loopback/repository';

//import the Sales and SalesRepository in my LB app
import {SalesRepository} from '../repositories';
import {Sales} from '../models';


/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('addDataGroup')
export class AddDataObserver implements LifeCycleObserver {
  /*
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) {}
  */
 constructor(
    @repository('SalesRepository') private salesRepo: SalesRepository,
  ) {}
  /**
   * This method will be invoked when the application starts
   */
  async start(): Promise<void> {
    let count: number = (await this.salesRepo.count()).count;
    if (count !== 0) return;
  
    //create an instance of Sales to be inserted into the database
    let salesData = new Sales({
      description: 'this is a sample data',
      date: '2019-01-01',
      country: 'Canada',
      total: 100,
    });
    this.salesRepo.create(salesData);
  }

  /**
   * This method will be invoked when the application stops
   */
  async stop(): Promise<void> {
    // Add your logic for stop
  }
}

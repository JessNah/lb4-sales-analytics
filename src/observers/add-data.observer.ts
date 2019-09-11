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

const COUNTRIES: string[] = ['Canada', 'US', 'Mexico', 'Germany', 'France'];

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('AddDataGroup')
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

    let rCountry: number = 0;
    let rTotal: number = 0;
    let rDesc: string = '';
    let salesData: Sales;

    for (let i = 0; i < 100; i++) {
      //generate random number for country
      rCountry = Math.floor(Math.random() * 5);

      //generate random number for total
      rTotal = Math.floor(Math.random() * 1000);

      //generate random characters for description
      rDesc = Math.random()
        .toString(36)
        .substring(7);

      salesData = new Sales({
        id: i,
        description: rDesc,
        date: this.randomDate().toDateString(),
        country: COUNTRIES[rCountry],
        total: rTotal,
      });

      this.salesRepo.create(salesData);
    }
  }
  randomDate(): Date {
    let minDate: Date = new Date(2019, 0, 1);
    let maxDate: Date = new Date();

    return new Date(
      minDate.getTime() +
        Math.random() * (maxDate.getTime() - minDate.getTime()),
    );
  }
  /**
   * This method will be invoked when the application stops
   */
  async stop(): Promise<void> {
    // Add your logic for stop
  }
}

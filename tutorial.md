## Building End-to-End Application with LoopBack, Cloudant and React.js

Authors: Aly Hegazy (Aly.Hegazy@ibm.com), Diana Lau (dhmlau@ca.ibm.com)

In this tutorial, we are going to build an end-to-end application that has a dashboard built with React.js that shows the sales data which is stored in a Cloudant database. We're also going to show you how to use LoopBack 4 to expose REST APIs to connect to the Cloudant database so that the frontend dashboard can call.

### Overview

There are 2 main parts of the tutorial:

- Part 1: Create the APIs connecting to Cloudant using LoopBack
  In this part, we will be creating a LoopBack application `lb4-sales-analytics` that connects to a Cloudant database.
- Part 2: Create the React application that calls the REST APIs created in Part 1
  In this part, we will be creating a dashboard application `lb4-sales-react-app` using React.js.

### Part 1 - Create APIs connecting to Cloudant using LoopBack

#### Before you begin

Make sure you have Node.js 8.9+ and [LoopBack 4 CLI](https://www.npmjs.com/package/@loopback/cli) installed.

LoopBack has a set of [command line interfaces](https://loopback.io/doc/en/lb4/Command-line-interface.html) that help you to create the LoopBack artifacts more easily.

#### Step 1 - Scaffold a LoopBack 4 application

Generate a LoopBack 4 application called `lb4-sales-analytics`.

```sh
$ lb4 app lb4-sales-analytics
? Project description: lb4-sales-analytics
? Project root directory: lb4-sales-analytics
? Application class name: Lb4SalesAnalyticsApplication
? Select features to enable in the project (Press <space> to select, <a> to toggle all, <i> to invert selectio
n)Enable tslint, Enable prettier, Enable mocha, Enable loopbackBuild, Enable vscode, Enable docker, Enable rep
ositories, Enable services
...
Application lb4-sales-analytics was created in lb4-sales-analytics.

Next steps:

$ cd lb4-sales-analytics
$ npm start
```

_Tips:_ If you are going to use all the default value, you can speed up this scaffolding process by using `--yes` option, i.e. `lb4 app your-app-name --yes`.

#### Step 2 - Create the Sales model

The `Sales` model represents each sales order, which has the following properties:

- id: id of the sales order
- description: description of the sales order
- date: date when the sales order is being made
- country: country where the sales order is being made
- total: amount of the sales order

```sh
$ lb4 model
? Model class name: Sales
? Please select the model base class Entity (A persisted model with an ID)
? Allow additional (free-form) properties? No
Let's add a property to Sales
Enter an empty property name when done

? Enter the property name: id
? Property type: number
? Is id the ID property? Yes
? Is it required?: No
? Default value [leave blank for none]:

Let's add another property to Sales
Enter an empty property name when done

? Enter the property name: description
? Property type: string
? Is it required?: No
? Default value [leave blank for none]:

Let's add another property to Sales
Enter an empty property name when done

? Enter the property name: date
? Property type: date
? Is it required?: Yes
? Default value [leave blank for none]:

Let's add another property to Sales
Enter an empty property name when done

? Enter the property name: country
? Property type: string
? Is it required?: Yes
? Default value [leave blank for none]:

Let's add another property to Sales
Enter an empty property name when done

? Enter the property name: total
? Property type: number
? Is it required?: Yes
? Default value [leave blank for none]:

Let's add another property to Sales
Enter an empty property name when done

? Enter the property name:
   create src/models/sales.model.ts
   update src/models/index.ts

Model Sales was created in src/models/
```

#### Step 3 - Add a datasource

We are now going to create a datasource that connects to a Cloudant database. In this example, we are using the [Cloudant docker image](https://hub.docker.com/r/ibmcom/cloudant-developer/), so that the database can be run locally. The LoopBack Cloudant connector repo contains utility script to download and run the Cloudant docker image. See https://github.com/strongloop/loopback-connector-cloudant#setup-cloudant-instance.

```sh
$ lb4 datasource
? Datasource name: cloudant
? Select the connector for cloudant: IBM Cloudant DB (supported by StrongLoop)
? Connection String url to override other settings (eg: https://username:password@host): http://admin:pass@localhost:8080/lb4-sales
? database:
? username:
? password: [hidden]
? Specify the model name to document mapping, defaults to `loopback__model__name`:
   create src/datasources/cloudant.datasource.json
   create src/datasources/cloudant.datasource.ts
...
Datasource cloudant was created in src/datasources/
```

This datasource configures the LoopBack Cloudant connector. If you have the connection url, you can ignore the rest of the settings, e.g. database, username and password. By default, the maximum number of instances returned by the REST APIs is 25. To modify that, we can add a `globalLimit` property to the generated `cloudant.datasource.json` as below:

```json
{
  "name": "cloudant",
  "connector": "cloudant",
  "url": "http://admin:pass@localhost:8080",
  "database": "lb4-sales",
  "username": "",
  "password": "",
  "modelIndex": "",
  "globalLimit": 1000
}
```

Alternatively, you can use the [Cloudant service](https://cloud.ibm.com/catalog/services/cloudant) on IBM Cloud. There are a few steps you need to do to use the Cloudant service within your LoopBack 4 application without exposing the credential information. Go to the [Deploying to IBM Cloud docs page](https://loopback.io/doc/en/lb4/Deploying-to-IBM-Cloud.html) for more details.

#### Step 4 - Create a Repository

Next, we are going to create a `Repository` that binds the datasource and the model.

```sh
$ lb4 repository
? Please select the datasource CloudantDatasource
? Select the model(s) you want to generate a repository Sales
? Please select the repository base class DefaultCrudRepository (Legacy juggler bridge)
   create src/repositories/sales.repository.ts
   update src/repositories/index.ts

Repository SalesRepository was created in src/repositories/
```

#### Step 5 - Create a Controller

A Controller handle the request-response lifecycle for your API.

```sh
$ lb4 controller
? Controller class name: Sales
? What kind of controller would you like to generate? REST Controller with CRUD functions
? What is the name of the model to use with this CRUD repository? Sales
? What is the name of your CRUD repository? SalesRepository
? What is the name of ID property? id
? What is the type of your ID? number
? What is the base HTTP path name of the CRUD operations? /sales
   create src/controllers/sales.controller.ts
   update src/controllers/index.ts

Controller Sales was created in src/controllers/
```

Besides the CRUD operations, we are going to add 2 more endpoints:

- `GET /sales/analytics/{country}/{year}/{month}`: Get the number of sales by country in a date YYYY/MM range
- `GET /sales/analytics/{country}/{year}`: Number of sales by country for a year

_FIXME: Not sure if it's better to copy and paste the code snippet here or just point them to sales.controller.ts file_

In `src/controllers/sales.controller.ts`, add the following two methods that correspond to the new endpoints:

```ts
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
```

#### Step 6: Change port to 3001

The default port used in the LoopBack application is 3000. Since the React application we're going to create will use the same port, we'll modify the LoopBack application to use port 3001 instead.

Go to index.js. Change the port from 3000 to 3001 in `config`, i.e.

```ts
const config = {
  rest: {
    port: +(process.env.PORT || 3001),
    host: process.env.HOST,
    openApiSpec: {
      // useful when used with OpenAPI-to-GraphQL to locate your application
      setServersFromRequest: true,
    },
  },
};
```

#### Test your API

Now, your application is ready to run.

```sh
$ npm start

Server is running at http://[::1]:3001
Try http://[::1]:3001/ping

```

Open a browser and go to URL: http://localhost:3001

The OpenAPI spec for the REST APIs can be found in http://localhost:3001/openapi.json. You can test your APIs by going to the API Explorer: http://localhost:3001/explorer

#### Optional: Seeding the database

To seed a database, we'll insert some random data during the start of the application. We can make use of the [life cycle support](https://loopback.io/doc/en/lb4/Life-cycle.html) of LoopBack.

Run the [life cycle observer generator](https://loopback.io/doc/en/lb4/Life-cycle-observer-generator.html) command: `lb4 observer`.

```sh
$ lb4 observer
? Observer name: AddData
? Observer group: AddDataGroup
   create src/observers/add-data.observer.ts
   update src/observers/index.ts
Observer AddData was created in src/observers/
```

In the `AddDataObserver`, there are 2 generated methods: `start()` and `stop()`. We are going to add some data during the start of the application by calling `Repository.create()`.

First, we'll get the `SalesRepository` that we've created earlier. Add the constructor as follows:

```ts
constructor(
  @repository('SalesRepository') private salesRepo: SalesRepository,
) {}
```

Make sure you add the following imports:

```ts
//import the repository decorator
import {repository} from '@loopback/repository';

//import the Sales and SalesRepository in my LB app
import {SalesRepository} from '../repositories';
import {Sales} from '../models';
```

In the `start()` method, create an instance of `Sales` and add to the database through `Repository.create()` method.

```ts
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
```

You can find out more details in generating random `Sales` instances in https://medium.com/loopback/loopback-quick-tip-seeding-database-using-life-cycle-observer-8ddca55fea5c.

_FIXME: Code to generate multiple instances can be found under src/observers/add-data.observer.ts_

### Part 2 - Create the dashboard using React

In this section, we will be creating a dashboard using React. If you are new to React, you might want to take [this tutorial](https://reactjs.org/tutorial/tutorial.html) first.

After everything is built, the app will look like:

![Dashboard](dashboard.png)

In this dashboard, we will have 3 components:

1. Toolbar at the top of the page
2. Overview section that contains grids of some data points
3. Sales graph section that shows the sales number for the past few months for various countries

#### Step 1: Create React App

Run this command:

```sh
$ npx create-react-app lb4-sales-react-app
```

#### Step 2: Create the Dashboard

Under `src` folder, create a file called `Dashboard.js`. See code in `src/Dashboard.js` in our pre-built application.

As you can see in the `render()` method, there are 3 main components:

- Toolbar with "LoopBack Dashboard" text
- Overview section with the `CenteredGrid` component which we'll be creating
- Sales section with the `SimpleLineChart` component which we'll be creating

#### Step 3: Create CenteredGrid for the Overview Section

Create a file called `CenteredGrid.js`, and see code in `src/CenteredGrid.js` in our pre-built application. We are going to create 2 grids for the total number of sales and total revenue from sales. They maps to the two endpoints `/sales/count` and `/sales` we've created using LoopBack 4 previously.

Since there are some values that are commonly used in the 3 components we are creating, create a file called `config.js` with the following content:

```js
const baseUrl = 'http://localhost:3001';
const availableCountries = ['US', 'Canada', 'Germany', 'France', 'Mexico'];

export {baseUrl, availableCountries};
```

In `CenteredGrid.js`, initialize the component's state as follows in the constructor:

```js
this.state = {
  totalNumberOfSales: 0,
  totalRevenueOfSales: 0,
};
```

Add the `componentDidMount()` lifecycle method, so that the REST APIs will be called after the component is rendered and then update the state with the data:

Check react lifecycle methods: https://reactjs.org/docs/react-component.html#the-component-lifecycle

```js
async componentDidMount() {
  const [ totalNumberOfSales, totalRevenueOfSales ] = await Promise.all([
    fetch(`${baseUrl}/sales/count`).then(res => res.json()).catch(err => err),
    fetch(`${baseUrl}/sales`).then(res => res.json()).catch(err => err)
  ]);

  this.setState({
    totalNumberOfSales: totalNumberOfSales.count || 0,
    totalRevenueOfSales: Array.isArray(totalRevenueOfSales) ?
      totalRevenueOfSales.reduce((sum, curr) => sum + curr.total, 0) : 0,
  });
}
```

Finally, we will modify the `render()` function as below:

```js
render() {
  const { classes } = this.props;
  return (
    <div className={classes.root}>
    <Grid container spacing={24}>
      <Grid item xs={6}>
          <Paper className={classes.paper}>
          <h3>Total Number Of Sales</h3>
          { this.state.totalNumberOfSales }
          </Paper>
      </Grid>
      <Grid item xs={6}>
          <Paper className={classes.paper}>
          <h3>Total Revenue From Sales</h3>
          ${ this.state.totalRevenueOfSales }
          </Paper>
      </Grid>
    </Grid>
    </div>
  );
}
```

#### Step 4: Create SimpleLineChart for the Sales Section

In this section, we need 2 values to construct the graph:

1. x-axis: the `dates` (year, month and the label on the graph)
2. y-axis: the sales `graphData`

Let's create a file called `SimpleLineChart.js`, and we are going to initialize the component's state with the two variables in the constructor:

Note that the graph period is determined by the variable `CALC_PERIOD_IN_MONTHS`

```js
constructor() {
  super();

  this.state = {
    graphData: [],
    dates: []
  };

  const MONTHS_IN_TEXT = ['JAN', 'FEB', 'MAR','APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const currentYear = new Date().getUTCFullYear();
  const currentMonth = new Date().getUTCMonth();

  for (let i = 0; i < CALC_PERIOD_IN_MONTHS; i++) {
    const date = new Date(currentYear, currentMonth - 12 + i, 1);

    this.state.dates[i] = {
      label: MONTHS_IN_TEXT[date.getUTCMonth()],
      year: date.getUTCFullYear(),
      month: date.getUTCMonth(),
    };
  }
}
```

Take a look at the `componentDidMount()` function to see how to get the sales data per country.

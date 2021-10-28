## Pluggable Federation?

This repository demonstrates a potential pattern of using Apollo
federation to allow plugging in capabilities to a graph without client updates.

The current handling by the gateway of interface or union types may, under some circumstances demonstrated here, lead the gateway to issue a request to a GraphQL service that it cannot fulfil.

We have two product types `Car` and `Truck`, each with a service to provide a gallery for each. There is also a product details service that orchestrates them, and will return either a car or truck gallery using Apollo federation.

A client can issue a query to select from the product details service a gallery of an unknown product, but so long as the returned type implements the Gallery interface it can handle the response.

We can image adding `Motorbike` and `Scooter` services, updating product details service to return them, and without any client change be able to show new products to users whilst maintaining separation of concerns in our GraphQL services. 

```graphql
{
  gallery {
    ... on Gallery {
      images
    }
  }
}
```

We receive the following error upon executing the query today, as the gateway will forward the `Gallery` interface that through federation appears to be available, to the product details service. The product service itself however is not aware of the `Gallery` interface and returns us an error, as it only knows of the federation stub types `TruckGallery` and `CarGallery`.

> GraphQLError: Unknown type "Gallery". Did you mean "CarGallery"?"

There do appear to be some circumstances where the gateway _will_ correctly break down the types in an interface to only those that the GraphQL service is aware of, although it is unclear exactly why that occurs, and is not demonstrated here.

Adding a `__typename` _within_ the inline fragment appears to be a good trigger to force the gateway to request a type a GraphQL service does not know about.

```graphql
{
  gallery {
    ... on Gallery {
      __typename
      images
    }
  }
}
```

We could avoid the error by using each product in the inline fragment, but must then make query and client changes before rolling out our new products, mitigating any benefits to the setup.

```graphql
{
  gallery {
    ... on CarGallery {
      images
    }
    ... on TruckGallery {
      images
    }
  }
}
```

If the gateway were to reduce the types requested to only those that match an interface and are known to the service, then this pattern could be leveraged. 

### Installation

To run this demo locally, pull down the repository then run the following commands:

```sh
npm install
```

This will install all of the dependencies for the gateway and each underlying service.

```sh
npm run start-services
```

This command will run all of the microservices at once. They can be found at http://localhost:4001, http://localhost:4002, http://localhost:4003.

In another terminal window, run the gateway by running this command:

```sh
npm run start-gateway
```

This will start up the gateway and serve it at http://localhost:4000

### What is this?

This demo showcases three partial schemas running as federated microservices. Each of these schemas can be accessed on their own and form a partial shape of an overall schema. The gateway fetches the service capabilities from the running services to create an overall composed schema which can be queried. 

The microservices are located under the [`./services`](./services/) folder and the gateway that composes the overall schema is in the [`gateway.js`](./gateway.js) file.

To see the query plan when running queries against the gateway, click on the `Query Plan` tab in the bottom right hand corner of [GraphQL Playground](http://localhost:4000)

To learn more about Apollo Federation, check out the [docs](https://www.apollographql.com/docs/apollo-server/federation/introduction)

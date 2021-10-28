const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const typeDefs = gql`
  extend type Query {
    gallery: ProductGalleryUnion
  }

  union ProductGalleryUnion = CarGallery | TruckGallery

  type CarGallery @extends @key(fields: "carToken") {
    carToken: ID! @external
  }

  type TruckGallery @extends @key(fields: "truckToken") {
    truckToken: ID! @external
  }
`;

const resolvers = {
  Query: {
    gallery() {
      return {
        carToken: "1"
      }
    }
  },
  ProductGalleryUnion: {
    __resolveType(object) {
      if (object.truckToken != null) {
        return "TruckGallery"
      } else if (object.carToken != null) {
        return "CarGallery"
      }
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
});

server.listen({ port: 4003 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

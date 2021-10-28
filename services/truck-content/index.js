const {ApolloServer, gql} = require("apollo-server");
const {buildFederatedSchema} = require("@apollo/federation");

const typeDefs = gql`
  extend type Query {
    truckGallery: TruckGallery
  }

  interface Gallery {
    images: Int
  }

  type TruckGallery implements Gallery @key(fields: "truckToken") {
    images: Int
    truckToken: ID!
  }
`;

const resolvers = {
  Query: {
    gallery() {
      return {}
    }
  },
  TruckGallery: {
    __resolveReference(object) {
      return {
        truckToken: "2"
      };
    },
    images() {
      return 2
    }
  },
  Gallery: {
    __resolveType(object) {
      if (object.truckToken != null) {
        return "TruckGallery"
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

server.listen({port: 4002}).then(({url}) => {
  console.log(`🚀 Server ready at ${url}`);
});

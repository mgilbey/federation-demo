const {ApolloServer, gql} = require("apollo-server");
const {buildFederatedSchema} = require("@apollo/federation");

const typeDefs = gql`
  extend type Query {
    carGallery: CarGallery
  }

  interface Gallery {
    images: Int
  }

  type CarGallery implements Gallery @key(fields: "carToken") {
    carToken: ID!
    images: Int
  }
`;

const resolvers = {
  Query: {
    gallery() {
      return {}
    }
  },
  CarGallery: {
    __resolveReference(object) {
      return {
        carToken: "1",
      };
    },
    images() {
      return 1
    }
  },
  Gallery: {
    __resolveType(object) {
      if (object.carToken != null) {
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

server.listen({port: 4001}).then(({url}) => {
  console.log(`🚀 Server ready at ${url}`);
});


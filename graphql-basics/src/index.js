import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';

// Scalar Types - String, int, float, boolean, ID

// Create a Yoga instance with a GraphQL schema
const yoga = createYoga({
    schema: createSchema({
        typeDefs: /* GraphQL */ `
            type Query {
                title: String!
                price: Float!
                releaseYear: Int
                rating: Float
                inStock: Boolean!
            }
        `,
        resolvers: {
            Query: {
                title: () => 'The Lord of the Rings: The Fellowship of the Ring',
                price: () => 19.99,
                releaseYear: () => 2001,
                rating: () => 8.8,
                inStock: () => true,
            },
        },
    }),
});

// Create an HTTP server with the Yoga instance
const server = createServer(yoga);

// Start the server and listen on port 4000
server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql');
});

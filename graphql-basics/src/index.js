import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';

// Scalar Types - String, int, float, boolean, ID

// Create a Yoga instance with a GraphQL schema

// 1. Create an "add" query that returns a float
// 2. Set up "add" to take two arguments (a, b) which are required floats
// 3. Have the resolver send back the sum of the two arguments
const yoga = createYoga({
    schema: createSchema({
        typeDefs: /* GraphQL */ `
            type Query {
                add(a: Float!, b: Float!): Float!
                greeting(name: String, position: String): String!
                me: User!
                post: Post!
            }
            type User {
                id: ID!
                name: String!
                email: String!
                age: Int
            }
            type Post {
                id: ID!
                title: String!
                body: String!
                published: Boolean!
            }
        `,
        resolvers: {
            Query: {
                add(parent, args, ctx, info) {
                    if (args.a && args.b) {
                        return args.a + args.b;
                    }
                },
                greeting(parent, args, ctx, info) {
                    if (args.name && args.position) {
                        return `Hello, ${args.name}! You are my favorite ${args.position}.`;
                    } else {
                        return 'Hello!';
                    }
                },
                me: () => {
                    return {
                        id: '7',
                        name: 'Davide',
                        email: 'info@davideladisa.it',
                        age: 28,
                    };
                },
                post() {
                    return {
                        id: '1',
                        title: 'Hello World',
                        body: 'This is a post',
                        published: true,
                    };
                },
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

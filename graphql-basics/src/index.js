import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';

// Scalar Types - String, int, float, boolean, ID

// 1. Set up an array of three posts with dummy post data (id, title, body, published)
// 2. Set up a "posts" query and resolver that returns all the posts
// 3. Test the query out
// 4. Add a "query" argument that only returns posts that contain the query string in the title or body
// 5. Run a few sample queries searching for posts with a specific title

const posts = [
    {
        id: '1',
        title: 'GraphQL',
        body: 'GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data.',
        published: true,
    },
    {
        id: '2',
        title: 'Node.js',
        body: 'Node.js is a JavaScript runtime built on Chrome’s V8 JavaScript engine.',
        published: true,
    },
    {
        id: '3',
        title: 'React',
        body: 'React is a JavaScript library for building user interfaces.',
        published: false,
    },
];

const yoga = createYoga({
    schema: createSchema({
        typeDefs: /* GraphQL */ `
            type Query {
                posts(query: String): [Post!]!
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
                posts: (parent, args, ctx, info) => {
                    if (!args.query) {
                        return posts;
                    }
                    return posts.filter((post) => {
                        const isTitleMatch = post.title
                            .toLowerCase()
                            .includes(args.query.toLowerCase());
                        const isBodyMatch = post.body
                            .toLowerCase()
                            .includes(args.query.toLowerCase());
                        return isTitleMatch || isBodyMatch;
                    });
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

import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import db from './db.js';
import Query from './resolvers/Query.js';
import Mutation from './resolvers/Mutation.js';
import Post from './resolvers/Post.js';
import User from './resolvers/User.js';
import Comment from './resolvers/Comment.js';

// Leggi il file schema.graphql
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf8');
const resolvers = {
    Query,
    Mutation,
    Post,
    User,
    Comment,
};

// Creazione dell'istanza GraphQL Yoga
const yoga = createYoga({
    schema: createSchema({
        typeDefs,
        resolvers,
    }),
    context: {
        db,
    },
});

// Creazione del server HTTP
const server = createServer(yoga);

// Avvio del server sulla porta 4000
server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql');
});

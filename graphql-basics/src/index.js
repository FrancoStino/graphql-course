import { createServer } from 'node:http';
import { createSchema, createYoga, createPubSub } from 'graphql-yoga';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { prisma } from './prisma.js';
import Query from './resolvers/Query.js';
import Mutation from './resolvers/Mutation.js';
import Subscription from './resolvers/Subscription.js';
import Post from './resolvers/Post.js';
import User from './resolvers/User.js';
import Comment from './resolvers/Comment.js';

// Leggi il file schema.graphql
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf8');

// PubSub
const pubsub = createPubSub();
const resolvers = {
    Query,
    Mutation,
    Subscription,
    Post,
    User,
    Comment,
};

// Create GraphQL Yoga instance
const yoga = createYoga({
    schema: createSchema({
        typeDefs,
        resolvers,
    }),
    context: {
        prisma,
        pubsub,
    },
    graphiql: {
        title: 'GraphQL Course',
        //     logo: `
        //     <div style="display: flex; align-items: center;">
        //         <img src="https://example.com/logo.png"
        //              alt="GraphQL Logo"
        //              style="height: 40px; margin-right: 10px;" />
        //         <span style="font-size: 20px; font-weight: bold;">GraphQL Course</span>
        //     </div>
        // `,
        // Puoi personalizzare il CSS, aggiungere un logo, ecc.
        //     customCss: `
        //   .title {
        //     background-image: url('https://tuo-logo-url.com/logo.png');
        //     background-size: contain;
        //     height: 50px;
        //   }
        // `,
    },
    landingPage: true,
    cors: true,

    subscriptions: {
        enabled: true,
    },
});

// Creazione del server HTTP
const server = createServer(yoga);

// Start both servers
server.listen(4000, async () => {
    console.info('🚀 Server is running on http://localhost:4000');
    console.info('📊 GraphQL API endpoint: http://localhost:4000');
    console.info('🔌 WebSocket subscriptions endpoint: ws://localhost:4000');
});

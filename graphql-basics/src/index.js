// Questo codice implementa un server GraphQL usando GraphQL Yoga e Node.js

import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';

// Goal: Set up a relationship between Comment and Post

// 1. Set up an author field on Comment - OK
// 2. Update all comments in the array to have a new post field (use on of the post ids as value) - OK
// 3. Crate a resolver for the Comments post field that returns the post that the comment belongs to - OK
// 4. Run a sample query thats get all comments and gets the post name - OK
// 5. Set up a comments field on Post - OK
// 6. Set up a resolver for the Post comments field that returns all comments belonging to that post - OK
// 7. Run a sample query that gets all posts and all there comments - OK

// Array di utenti con dati di esempio
const users = [
    {
        id: '1',
        name: 'Davide',
        email: 'davide@example.com',
        age: 27,
    },
    {
        id: '2',
        name: 'Michele',
        email: 'michele@example.com',
    },
    {
        id: '3',
        name: 'Tiziano',
        email: 'tiziano@example.com',
    },
];

// Array di post con dati di esempio
const posts = [
    {
        id: '10',
        title: 'GraphQL 101',
        body: 'This is how to use GraphQL...',
        published: true,
        author: '1', // Riferimento all'id dell'utente autore
    },
    {
        id: '11',
        title: 'GraphQL 201',
        body: 'This is an advanced GraphQL post...',
        published: false,
        author: '1',
    },
    {
        id: '12',
        title: 'Programming Music',
        body: '',
        published: false,
        author: '2',
    },
];

// Array di commenti con dati di esempio
const comments = [
    {
        id: '102',
        text: 'This worked well for me. Thanks!',
        author: '1', // Riferimento all'id dell'utente autore
        post: '10', // Riferimento all'id del post associato
    },
    {
        id: '103',
        text: 'Glad you enjoyed it.',
        author: '1',
        post: '10',
    },
    {
        id: '104',
        text: 'This did no work.',
        author: '2',
        post: '11',
    },
    {
        id: '105',
        text: 'Nevermind. I got it to work.',
        author: '3',
        post: '12',
    },
];
// Creazione dell'istanza GraphQL Yoga
const yoga = createYoga({
    schema: createSchema({
        // Definizione dello schema GraphQL con i tipi di dati
        typeDefs: /* GraphQL */ `
            # Query type definisce i punti di ingresso per le richieste di lettura
            type Query {
                users(query: String): [User!]! # Lista di utenti con filtro opzionale
                posts(query: String): [Post!]! # Lista di post con filtro opzionale
                comments: [Comment!]! # Lista di commenti
                me: User! # Utente corrente
                post: Post! # Post singolo
            }

            # Tipo User rappresenta un utente
            type User {
                id: ID!
                name: String!
                email: String!
                age: Int
                posts: [Post!]! # Relazione one-to-many con i post
                comments: [Comment!]! # Relazione one-to-many con i commenti
            }

            # Tipo Post rappresenta un articolo
            type Post {
                id: ID!
                title: String!
                body: String!
                published: Boolean!
                author: User! # Relazione many-to-one con l'utente
                comments: [Comment!]! # Relazione one-to-many con i commenti
            }
            type Comment {
                id: ID!
                text: String!
                author: User! # Relazione many-to-one con l'utente
                post: Post! # Relazione many-to-one con il post
            }
        `,
        // Implementazione dei resolver per gestire le query
        resolvers: {
            Query: {
                // Resolver per ottenere utenti con filtro opzionale sul nome
                users(parent, args, ctx, info) {
                    if (!args.query) {
                        return users;
                    }
                    return users.filter((user) => {
                        return user.name.toLowerCase().includes(args.query.toLowerCase());
                    });
                },
                // Resolver per ottenere post con filtro su titolo o corpo
                posts(parent, args, ctx, info) {
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
                // Resolver per ottenere l'utente corrente (hardcoded per esempio)
                me() {
                    return {
                        id: '123098',
                        name: 'Mike',
                        email: 'mike@example.com',
                    };
                },
                // Resolver per ottenere un post singolo (hardcoded per esempio)
                post() {
                    return {
                        id: '092',
                        title: 'GraphQL 101',
                        body: '',
                        published: false,
                    };
                },
                // Resolver per ottenere tutti i commenti
                comments() {
                    return comments;
                },
            },
            // Resolver per il tipo Post per gestire la relazione con l'autore
            Post: {
                author(parent, args, ctx, info) {
                    return users.find((user) => {
                        return user.id === parent.author;
                    });
                },
                comments(parent, args, ctx, info) {
                    return comments.filter((comment) => {
                        return comment.post === parent.id;
                    });
                },
            },
            // Resolver per il tipo User per gestire la relazione con i post e commenti
            User: {
                posts(parent, args, ctx, info) {
                    return posts.filter((post) => {
                        return post.author === parent.id;
                    });
                },
                comments(parent, args, ctx, info) {
                    return comments.filter((comment) => {
                        return comment.author === parent.id;
                    });
                },
            },
            // Resolver per il tipo Comment per gestire la relazione con l'autore
            Comment: {
                author(parent, args, ctx, info) {
                    return users.find((user) => {
                        return user.id === parent.author;
                    });
                },
                post(parent, args, ctx, info) {
                    return posts.find((post) => {
                        return post.id === parent.post;
                    });
                },
            },
        },
    }),
});

// Creazione del server HTTP
const server = createServer(yoga);

// Avvio del server sulla porta 4000
server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql');
});

import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';
import { v4 as uuidv4 } from 'uuid';
import { GraphQLError } from 'graphql';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import db from './db.js';

// Leggi il file schema.graphql
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf8');

// Creazione dell'istanza GraphQL Yoga
const yoga = createYoga({
    schema: createSchema({
        typeDefs,
        resolvers: {
            Query: {
                users(parent, args, { db }, info) {
                    if (!args.query) {
                        return db.users;
                    }
                    return db.users.filter((user) => {
                        return user.name.toLowerCase().includes(args.query.toLowerCase());
                    });
                },
                posts(parent, args, { db }, info) {
                    if (!args.query) {
                        return db.posts;
                    }
                    return db.posts.filter((post) => {
                        const isTitleMatch = post.title
                            .toLowerCase()
                            .includes(args.query.toLowerCase());
                        const isBodyMatch = post.body
                            .toLowerCase()
                            .includes(args.query.toLowerCase());
                        return isTitleMatch || isBodyMatch;
                    });
                },
                me() {
                    return {
                        id: '123098',
                        name: 'Mike',
                        email: 'mike@example.com',
                    };
                },
                post() {
                    return {
                        id: '092',
                        title: 'GraphQL 101',
                        body: '',
                        published: false,
                    };
                },
                comments(parent, args, { db }, info) {
                    return db.comments;
                },
            },
            Mutation: {
                createUser(parent, args, { db }, info) {
                    const emailTaken = db.users.some(
                        (user) => user.email === args.data.email,
                    );
                    if (emailTaken) {
                        throw new GraphQLError('Email already in use');
                    }
                    const user = {
                        id: uuidv4(),
                        ...args.data,
                    };

                    db.users.push(user);
                    return user;
                },
                deleteUser(parent, args, { db }, info) {
                    const userIndex = db.users.findIndex((user) => user.id === args.id);

                    if (userIndex === -1) {
                        throw new GraphQLError('User not found');
                    }

                    const deletedUsers = db.users.splice(userIndex, 1);

                    db.posts = db.posts.filter((post) => {
                        const match = post.author === args.id;

                        if (match) {
                            db.comments = db.comments.filter(
                                (comment) => comment.post !== post.id,
                            );
                        }

                        return !match;
                    });

                    db.comments = db.comments.filter(
                        (comment) => comment.author !== args.id,
                    );

                    return deletedUsers[0];
                },
                createPost(parent, args, { db }, info) {
                    const userExists = db.users.some(
                        (user) => user.id === args.data.author,
                    );
                    if (!userExists) {
                        throw new GraphQLError('User not found');
                    }
                    const post = {
                        id: uuidv4(),
                        ...args.data,
                    };
                    db.posts.push(post);
                    return post;
                },
                deletePost(parent, args, { db }, info) {
                    const postIndex = db.posts.findIndex((post) => post.id === args.id);
                    if (postIndex === -1) {
                        throw new GraphQLError('Post not found');
                    }
                    const deletedPost = db.posts.splice(postIndex, 1);
                    db.comments = db.comments.filter(
                        (comment) => comment.post !== args.id,
                    );
                    return deletedPost[0];
                },
                createComment(parent, args, { db }, info) {
                    const userExists = db.users.some(
                        (user) => user.id === args.data.author,
                    );
                    const postExists = db.posts.some(
                        (post) => post.id === args.data.post && post.published,
                    );

                    if (!userExists) {
                        throw new GraphQLError('User not found');
                    }

                    if (!postExists) {
                        throw new GraphQLError('Post not found');
                    }
                    const comment = {
                        id: uuidv4(),
                        ...args.data,
                    };
                    db.comments.push(comment);
                    return comment;
                },
                deleteComment(parent, args, { db }, info) {
                    const commentIndex = db.comments.findIndex(
                        (comment) => comment.id === args.id,
                    );
                    if (commentIndex === -1) {
                        throw new GraphQLError('Comment not found');
                    }
                    const deletedComment = db.comments.splice(commentIndex, 1);
                    return deletedComment[0];
                },
            },
            Post: {
                author(parent, args, { db }, info) {
                    return db.users.find((user) => {
                        return user.id === parent.author;
                    });
                },
                comments(parent, args, { db }, info) {
                    return db.comments.filter((comment) => {
                        return comment.post === parent.id;
                    });
                },
            },
            User: {
                posts(parent, args, { db }, info) {
                    return db.posts.filter((post) => {
                        return post.author === parent.id;
                    });
                },
                comments(parent, args, { db }, info) {
                    return db.comments.filter((comment) => {
                        return comment.author === parent.id;
                    });
                },
            },
            Comment: {
                author(parent, args, { db }, info) {
                    return db.users.find((user) => {
                        return user.id === parent.author;
                    });
                },
                post(parent, args, { db }, info) {
                    return db.posts.find((post) => {
                        return post.id === parent.post;
                    });
                },
            },
        },
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

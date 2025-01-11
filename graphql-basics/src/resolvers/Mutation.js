import { GraphQLError } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

// Goal: Setup CREATED, UPDATED, and DELETED for comment subscription

// 1. Set up a custom payload type for comment subscription with "mutation" and "data"
// 2. Update publish call in createdComment to send back CREATED with the data
// 3. Add publish call in deleteComment using DELETED event
// 4. Add publish call in updatedComment using UPDATED
// 5. Test you work by creating, updating, and deleting a comment

const Mutation = {
    createUser(parent, args, { db }, info) {
        const emailTaken = db.users.some((user) => user.email === args.data.email);
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
                db.comments = db.comments.filter((comment) => comment.post !== post.id);
            }

            return !match;
        });

        db.comments = db.comments.filter((comment) => comment.author !== args.id);

        return deletedUsers[0];
    },
    updateUser(parent, args, { db }, info) {
        const { id, data } = args;
        const userIndex = db.users.findIndex((user) => user.id === id);
        const user = db.users[userIndex];

        if (userIndex === -1) {
            throw new GraphQLError('User not found');
        }

        if (typeof data.email === 'string') {
            const emailTaken = db.users.some((user) => user.email === data.email);
            if (emailTaken) {
                throw new GraphQLError('Email already in use');
            }
            db.users[userIndex].email = data.email;
        }

        if (typeof data.name === 'string') {
            db.users[userIndex].name = data.name;
        }
        if (typeof data.age !== 'undefined') {
            db.users[userIndex].age = data.age;
        }
        return db.users[userIndex];
    },
    createPost(parent, args, { db, pubsub }, info) {
        const userExists = db.users.some((user) => user.id === args.data.author);
        if (!userExists) {
            throw new GraphQLError('User not found');
        }
        const post = {
            id: uuidv4(),
            ...args.data,
        };
        db.posts.push(post);
        if (post.published) {
            pubsub.publish('post', {
                post: {
                    mutation: 'CREATED',
                    data: post,
                },
            });
        }
        return post;
    },
    deletePost(parent, args, { db, pubsub }, info) {
        const postIndex = db.posts.findIndex((post) => post.id === args.id);
        if (postIndex === -1) {
            throw new GraphQLError('Post not found');
        }
        const [deletedPost] = db.posts.splice(postIndex, 1);
        db.comments = db.comments.filter((comment) => comment.post !== args.id);

        if (deletedPost.published) {
            pubsub.publish('post', {
                post: {
                    mutation: 'DELETED',
                    data: deletedPost,
                },
            });
        }
        return deletedPost;
    },

    // Updates an existing post in the database.

    // Parameters:
    // - `parent`: The parent resolver object (not used)
    // - `args`: An object containing the post ID and the updated data for the post
    // - `{ db, pubsub }`: An object containing the database and the PubSub instance
    // - `info`: The GraphQL resolver info object (not used)

    // The function first finds the index of the post in the `db.posts` array using the provided post ID. If the post is not found, it throws a `GraphQLError` with the message "Post not found".

    // The function then checks if the `data.title`, `data.body`, or `data.published` properties are provided, and updates the corresponding fields in the post object. If the `published` status of the post changes, the function publishes a `'post'` event with the appropriate mutation type (`'UNPUBLISHED'` or `'PUBLISHED'`).

    // If the post is published and any of the fields are updated, the function publishes a `'post'` event with the `'UPDATED'` mutation type.

    // Finally, the function returns the updated post object.
    updatePost(parent, args, { db, pubsub }, info) {
        const { id, data } = args;
        const postIndex = db.posts.findIndex((post) => post.id === id);
        if (postIndex === -1) {
            throw new GraphQLError('Post not found');
        }
        const originalPost = { ...db.posts[postIndex] };

        if (typeof data.title === 'string') {
            db.posts[postIndex].title = data.title;
        }
        if (typeof data.body === 'string') {
            db.posts[postIndex].body = data.body;
        }
        if (typeof data.published !== 'undefined') {
            db.posts[postIndex].published = data.published;

            if (originalPost.published && !db.posts[postIndex].published) {
                pubsub.publish('post', {
                    post: {
                        mutation: 'UNPUBLISHED',
                        data: db.posts[postIndex],
                    },
                });
            } else if (!originalPost.published && db.posts[postIndex].published) {
                pubsub.publish('post', {
                    post: {
                        mutation: 'PUBLISHED',
                        data: db.posts[postIndex],
                    },
                });
            } else if (db.posts[postIndex].published) {
                pubsub.publish('post', {
                    post: {
                        mutation: 'UPDATED',
                        data: db.posts[postIndex],
                    },
                });
            }
        }
        return db.posts[postIndex];
    },
    createComment(parent, args, { db, pubsub }, info) {
        const userExists = db.users.some((user) => user.id === args.data.author);
        const postExists = db.posts.some((post) => post.id === args.data.post && post.published);

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
        pubsub.publish(`comment ${args.data.post}`, {
            comment: {
                mutation: 'CREATED',
                data: comment,
            },
        });
        return comment;
    },
    deleteComment(parent, args, { db, pubsub }, info) {
        const commentIndex = db.comments.findIndex((comment) => comment.id === args.id);
        if (commentIndex === -1) {
            throw new GraphQLError('Comment not found');
        }
        const deletedComment = db.comments.splice(commentIndex, 1);
        pubsub.publish(`comment ${deletedComment[0].post}`, {
            comment: {
                mutation: 'DELETED',
                data: deletedComment[0],
            },
        });
        return deletedComment[0];
    },
    updateComment(parent, args, { db, pubsub }, info) {
        const { id, data } = args;
        const commentIndex = db.comments.findIndex((comment) => comment.id === id);
        if (commentIndex === -1) {
            throw new GraphQLError('Comment not found');
        }
        if (typeof data.text === 'string') {
            db.comments[commentIndex].text = data.text;
        }
        pubsub.publish(`comment ${db.comments[commentIndex].post}`, {
            comment: {
                mutation: 'UPDATED',
                data: db.comments[commentIndex],
            },
        });
        return db.comments[commentIndex];
    },
};

export { Mutation as default };

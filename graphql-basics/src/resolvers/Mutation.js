import { GraphQLError } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

// Goal: Set up a mutation for updating a post

// 1. Define mutation
//   - Add id/data for arguments. Setup data to support title, body, published
//   - Return the updated post
// 2. Create resolver method
//   - Verify post exists, else throw error
//   Update post proprties on at a time
// 3. Verify your work by updating all properties for a given post

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
    createPost(parent, args, { db }, info) {
        const userExists = db.users.some((user) => user.id === args.data.author);
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
        db.comments = db.comments.filter((comment) => comment.post !== args.id);
        return deletedPost[0];
    },
    updatePost(parent, args, { db }, info) {
        const { id, data } = args;
        const postIndex = db.posts.findIndex((post) => post.id === id);
        const post = db.posts[postIndex];
        if (postIndex === -1) {
            throw new GraphQLError('Post not found');
        }
        if (typeof data.title === 'string') {
            db.posts[postIndex].title = data.title;
        }
        if (typeof data.body === 'string') {
            db.posts[postIndex].body = data.body;
        }
        if (typeof data.published !== 'undefined') {
            db.posts[postIndex].published = data.published;
        }
        return db.posts[postIndex];
    },
    createComment(parent, args, { db }, info) {
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
        return comment;
    },
    deleteComment(parent, args, { db }, info) {
        const commentIndex = db.comments.findIndex((comment) => comment.id === args.id);
        if (commentIndex === -1) {
            throw new GraphQLError('Comment not found');
        }
        const deletedComment = db.comments.splice(commentIndex, 1);
        return deletedComment[0];
    },
};

export { Mutation as default };

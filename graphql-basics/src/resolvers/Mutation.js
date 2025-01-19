import { GraphQLError } from 'graphql';

const Mutation = {
    async createUser(parent, args, { prisma }, info) {
        const emailTaken = await prisma.user.findUnique({
            where: { email: args.data.email }
        });

        if (emailTaken) {
            throw new GraphQLError('Email already in use');
        }

        return prisma.user.create({
            data: {
                ...args.data
            }
        });
    },

    async deleteUser(parent, args, { prisma }, info) {
        const userExists = await prisma.user.findUnique({
            where: { id: args.id }
        });

        if (!userExists) {
            throw new GraphQLError('User not found');
        }

        return prisma.user.delete({
            where: { id: args.id }
        });
    },

    async updateUser(parent, args, { prisma }, info) {
        const { id, data } = args;

        if (data.email) {
            const emailTaken = await prisma.user.findUnique({
                where: { email: data.email }
            });

            if (emailTaken && emailTaken.id !== id) {
                throw new GraphQLError('Email already in use');
            }
        }

        return prisma.user.update({
            where: { id },
            data
        });
    },

    async createPost(parent, args, { prisma, pubsub }, info) {
        const userExists = await prisma.user.findUnique({
            where: { id: args.data.author }
        });

        if (!userExists) {
            throw new GraphQLError('User not found');
        }

        const post = await prisma.post.create({
            data: {
                title: args.data.title,
                body: args.data.body,
                published: args.data.published,
                author: {
                    connect: { id: args.data.author }
                }
            }
        });

        if (post.published) {
            pubsub.publish('post', {
                post: {
                    mutation: 'CREATED',
                    data: post
                }
            });
        }

        return post;
    },

    async deletePost(parent, args, { prisma, pubsub }, info) {
        const post = await prisma.post.findUnique({
            where: { id: args.id }
        });

        if (!post) {
            throw new GraphQLError('Post not found');
        }

        const deletedPost = await prisma.post.delete({
            where: { id: args.id }
        });

        if (deletedPost.published) {
            pubsub.publish('post', {
                post: {
                    mutation: 'DELETED',
                    data: deletedPost
                }
            });
        }

        return deletedPost;
    },

    async updatePost(parent, args, { prisma, pubsub }, info) {
        const { id, data } = args;

        const originalPost = await prisma.post.findUnique({
            where: { id }
        });

        if (!originalPost) {
            throw new GraphQLError('Post not found');
        }

        const updatedPost = await prisma.post.update({
            where: { id },
            data
        });

        if (typeof data.published !== 'undefined') {
            if (originalPost.published && !updatedPost.published) {
                pubsub.publish('post', {
                    post: {
                        mutation: 'UNPUBLISHED',
                        data: updatedPost
                    }
                });
            } else if (!originalPost.published && updatedPost.published) {
                pubsub.publish('post', {
                    post: {
                        mutation: 'PUBLISHED',
                        data: updatedPost
                    }
                });
            }
        } else if (updatedPost.published) {
            pubsub.publish('post', {
                post: {
                    mutation: 'UPDATED',
                    data: updatedPost
                }
            });
        }

        return updatedPost;
    },

    async createComment(parent, args, { prisma, pubsub }, info) {
        const [userExists, postExists] = await Promise.all([
            prisma.user.findUnique({ where: { id: args.data.author } }),
            prisma.post.findFirst({
                where: {
                    id: args.data.post,
                    published: true
                }
            })
        ]);

        if (!userExists) {
            throw new GraphQLError('User not found');
        }

        if (!postExists) {
            throw new GraphQLError('Post not found or not published');
        }

        const comment = await prisma.comment.create({
            data: {
                text: args.data.text,
                author: {
                    connect: { id: args.data.author }
                },
                post: {
                    connect: { id: args.data.post }
                }
            }
        });

        pubsub.publish(`comment ${args.data.post}`, {
            comment: {
                mutation: 'CREATED',
                data: comment
            }
        });

        return comment;
    },

    async deleteComment(parent, args, { prisma, pubsub }, info) {
        const comment = await prisma.comment.findUnique({
            where: { id: args.id }
        });

        if (!comment) {
            throw new GraphQLError('Comment not found');
        }

        const deletedComment = await prisma.comment.delete({
            where: { id: args.id }
        });

        pubsub.publish(`comment ${deletedComment.postId}`, {
            comment: {
                mutation: 'DELETED',
                data: deletedComment
            }
        });

        return deletedComment;
    },

    async updateComment(parent, args, { prisma, pubsub }, info) {
        const { id, data } = args;

        const comment = await prisma.comment.findUnique({
            where: { id }
        });

        if (!comment) {
            throw new GraphQLError('Comment not found');
        }

        const updatedComment = await prisma.comment.update({
            where: { id },
            data
        });

        pubsub.publish(`comment ${updatedComment.postId}`, {
            comment: {
                mutation: 'UPDATED',
                data: updatedComment
            }
        });

        return updatedComment;
    }
};

export { Mutation as default };
import { GraphQLError } from 'graphql';

const Subscription = {
    comment: {
        async subscribe(parent, { postId }, { prisma, pubsub }, info) {
            const post = await prisma.post.findFirst({
                where: {
                    id: postId,
                    published: true
                }
            });

            if (!post) {
                throw new GraphQLError('Post not found or is not published');
            }

            return pubsub.subscribe(`comment ${postId}`);
        }
    },
    post: {
        subscribe(parent, args, { pubsub }, info) {
            return pubsub.subscribe('post');
        }
    }
};

export { Subscription as default };
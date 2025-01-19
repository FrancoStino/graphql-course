const Query = {
    async users(parent, args, { prisma }, info) {
        if (!args.query) {
            return prisma.user.findMany();
        }
        return prisma.user.findMany({
            where: {
                name: {
                    contains: args.query,
                    mode: 'insensitive'
                }
            }
        });
    },
    async posts(parent, args, { prisma }, info) {
        if (!args.query) {
            return prisma.post.findMany();
        }
        return prisma.post.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: args.query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        body: {
                            contains: args.query,
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        });
    },
    async comments(parent, args, { prisma }, info) {
        return prisma.comment.findMany();
    }
};

export { Query as default };
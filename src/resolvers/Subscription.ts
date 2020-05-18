import { pubSub } from "../subscriptions";

const forwardedSubscriptions = {
    serviceOrder: {
        subscribe: async (parent, args, context) => {
            return context.prismaClient.$subscribe.serviceOrder(args);
        },
        resolve: payload => {
            return payload
        },
    },
    serviceContract: {
        subscribe: async (parent, args, context) => {
            return context.prismaClient.$subscribe.serviceContract(args);
        },
        resolve: payload => {
            return payload
        },
    },
    workOrder: {
        subscribe: async (parent, args, context) => {
            return context.prismaClient.$subscribe.workOrder(args);
        },
        resolve: payload => {
            return payload
        },
    }
};

export default forwardedSubscriptions;

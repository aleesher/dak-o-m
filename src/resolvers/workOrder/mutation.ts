import { Context } from "../../index";

/**
 * This resolver allows to update several work orders at once.
 * IMPORTANT! If you need all order to be updated to the same value you should use "updateManyWorkOrders"
 */
async function updateSeveralWorkOrders(parent, args, context: Context, info) {
  const { orders } = args;

  for await (let order of orders) {
    await context.prismaClient.updateWorkOrder({
      where: {
        code: order.code,
      },
      data: order
    });
  }

  return {
    status: 'ok'
  }
}

export default {
  updateSeveralWorkOrders
}

import {shield, or, rule} from 'graphql-shield';
import {
  isCustomer,
  isEmployee,
  isAdmin,
  isService,
  isIntrospection,
  isQA
} from "../lib/dakota-services-common/helpers/role";

export default shield({
  Query: {
    "*": or(isCustomer, isEmployee, isAdmin, isQA),
    _service: isIntrospection, // For introspection
    serviceOrderUpdateNotificationJson: rule({ cache: 'contextual' })(() => true), // For tracking
  },
  Mutation: {
    "*": or(isEmployee, isAdmin, isQA),
    updateServiceOrderStatus: isService,
    askQuestion: isService,
    createCustomerFeedback: isService,
    lockEntityRecord: isService,
    unlockEntityRecord: isService,
  }
}, {
  fallbackRule: or(isService, isIntrospection),
});

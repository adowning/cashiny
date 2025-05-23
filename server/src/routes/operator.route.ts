// apps/server/src/routes/operator.route.ts
// import { PrismaClient } from '@cashflow/database';
// Or your specific import if using a central instance
// import { ZodError } from 'zod';
import { PrismaClient } from '@cashflow/database'
import { NETWORK_CONFIG } from '@cashflow/types'

import { createErrorResponse, createSuccessResponse } from '.'
import createRouter from '../rest.router'
import { OperatorService } from '../services/operator.service'

//
const router = createRouter()

// import {
//   OperatorAcceptInvitationPayload,
//   OperatorAssignRolePayload,
//   OperatorCreatePayload,
//   OperatorInvitePayload,
//   OperatorUpdatePayload,
//   operatorSchema,
// } from './schema';

// --- Authentication Placeholder ---
// In a real app, this would verify a token (e.g., JWT) from the Authorization header
// // and return the authenticated user's ID.
// class AuthError extends Error {
//   constructor(message: string) {
//     super(message);
//     this.name = 'AuthError';
//   }
// }

// async function getAuthenticatedUserId(request: Request): Promise<string> {
//   const userId = request.headers.get('X-User-ID'); // Example: Get user ID from a custom header
//   if (!userId) {
//     // In a real app, you might throw AuthError if no valid token/session is found.
//     // For development, we can use a default or throw if not provided.
//     // throw new AuthError('User authentication required. X-User-ID header missing.');
//     console.warn(
//       "DEVELOPMENT: X-User-ID header not found. Using mock 'dev-user-id'. Ensure this is set for authenticated routes.",
//     );
//     return 'dev-user-id'; // Fallback for development if no header is set.
//   }
//   return userId;
// }
// // --- End Authentication Placeholder ---

// // --- Prisma Client Initialization ---
// // It's highly recommended to instantiate PrismaClient once and share it across your application.
// // Create a `prisma.service.ts` like this:
// // ```ts
// // // apps/server/src/services/prisma.service.ts
// // import { PrismaClient } from '@prisma/client';
// // const prisma = new PrismaClient();
// // export default prisma;
// // ```
// // Then import it here: `import prisma from '../services/prisma.service';`

// // More robust parameter extraction is recommended for complex apps (e.g., URLPattern or a router)
// function extractRouteParams(pathname: string, routePattern: string): Record<string, string> | null {
//   const params: Record<string, string> = {};
//   const pathSegments = pathname.split('/').filter(Boolean); // e.g. ['operator', 'op123', 'users', 'user456']
//   const patternSegments = routePattern.split('/').filter(Boolean); // e.g. ['operator', ':operatorId', 'users', ':userId']

//   if (pathSegments.length !== patternSegments.length) {
//     return null;
//   }

//   for (let i = 0; i < patternSegments.length; i++) {
//     if (patternSegments[i].startsWith(':')) {
//       params[patternSegments[i].substring(1)] = pathSegments[i];
//     } else if (pathSegments[i] !== patternSegments[i]) {
//       return null; // Segments don't match
//     }
//   }
//   return params;
// }

// export async function handleOperatorRequest(request: Request): Promise<Response> {
//   const url = new URL(request.url);
//   const path = url.pathname; // e.g., /operator/create, /operator/opId123
//   const method = request.method;
//   let params: Record<string, string> | null;
//   let currentUserId: string;

//   try {
//     // Authenticate user for most routes (adjust as needed if some routes are public)
//     // For simplicity, authenticating once here. Specific routes might have different auth requirements.
//     // Public routes like 'acceptInvitation' via token might not need a pre-existing user session token
//     // but will validate the invitation token itself.
//     // if (path !== '/operator/accept-invitation') {
//     //   // Example: accept-invitation doesn't require a current session user ID initially
//     //   // currentUserId = await getAuthenticatedUserId(request);
//     // }

//     // POST /operator/create
//     // if (method === 'POST' && path === '/operator/create') {
//     //   currentUserId = await getAuthenticatedUserId(request);
//     //   const body = await request.json();
//     //   const validatedBody = operatorSchema.create.parse(body) as OperatorCreatePayload;
//     //   const data = await operatorService.createOperator(validatedBody, currentUserId);
//     //   return createSuccessResponse(data, 201); // 201 Created is more appropriate
//     // }

//     // POST /operator/invite
//     // if (method === 'POST' && path === '/operator/invite') {
//     //   currentUserId = await getAuthenticatedUserId(request);
//     //   const body = await request.json();
//     //   const validatedBody = operatorSchema.invite.parse(body) as OperatorInvitePayload;
//     //   const data = await operatorService.inviteUsersToOperator(validatedBody, currentUserId);
//     //   return createSuccessResponse(data);
//     // }

//     // POST /operator/accept-invitation
//     // This route might be accessed by a new user who doesn't have a session yet,
//     // but has an invitation token. The `acceptingUserId` might be determined
//     // after they sign up/log in as part of the acceptance flow, or if the token
//     // is tied to an email that allows pre-association with a user record.
//     // The service method takes `acceptingUserId` which should be the ID of the user confirming.
//     // if (method === 'POST' && path === '/operator/accept-invitation') {
//     //   // Assuming the user logs in or signs up, and then this endpoint is hit with their new userId.
//     //   currentUserId = await getAuthenticatedUserId(request); // User must be identifiable to accept.
//     //   const body = await request.json();
//     //   const { invitationToken } = operatorSchema.acceptInvitation.parse(
//     //     body,
//     //   ) as OperatorAcceptInvitationPayload;
//     //   const data = await operatorService.acceptInvitation(invitationToken, currentUserId);
//     //   return createSuccessResponse(data);
//     // }

//     // GET /operator/user/:userId (Get all operators for a specific user)
//     // This :userId usually refers to the authenticated user themselves, or an admin querying.
//     // Let's assume it means "operators for the user specified in the path".
//     // The service method `getAllOperators` takes the `userId` for whom to fetch operators.
//     params = extractRouteParams(path, '/operator/user/:targetUserId');
//     if (method === 'GET' && params?.targetUserId) {
//       currentUserId = await getAuthenticatedUserId(request); // User making the request
//       // Add authorization: Does currentUserId have permission to see targetUserId's operators?
//       // For simplicity, let's assume users can only see their own, or an admin can see any.
//       // If targetUserId is not currentUserId, an admin check would be needed.
//       // For this example, we'll pass targetUserId from path.
//       console.log('here i am');
//       const operators = await operatorService.getAllOperators(params.targetUserId);
//       return createSuccessResponse(operators);
//     }

//     // PUT /operator/deactivate/:id (Original: Organization user deactivation)
//     // Assuming this refers to deactivating a UserOperator link.
//     // Path could be /operator/:operatorId/users/:userIdToDeactivate/deactivate
//     // The original /deactivate/:id is ambiguous. Let's assume :id is a UserOperator record ID for now.
//     // Or, more likely, it implies an operator context and a user ID to deactivate.
//     // For the sake of conversion, let's use a more explicit path:
//     // PUT /operator/:operatorId/users/:userIdToDeactivate/deactivate
//     // params = extractRouteParams(path, '/operator/:operatorId/users/:userIdToDeactivate/deactivate');
//     // if (method === 'PUT' && params?.operatorId && params?.userIdToDeactivate) {
//     //   currentUserId = await getAuthenticatedUserId(request);
//     //   // Service method: deactivateUser(operatorId, userIdToDeactivate, performingUserId)
//     //   const data = await operatorService.deactivateUser(
//     //     params.operatorId,
//     //     params.userIdToDeactivate,
//     //     currentUserId,
//     //   );
//     //   return createSuccessResponse(data);
//     // }

//     // GET /operator/:operatorId/users/:userId/role
//     params = extractRouteParams(path, '/operator/:operatorId/users/:targetUserId/role');
//     if (method === 'GET' && params?.operatorId && params?.targetUserId) {
//       currentUserId = await getAuthenticatedUserId(request);
//       const data = await operatorService.getProfilesRole(
//         // params.operatorId,
//         params.targetUserId,
//         // currentUserId,
//       );
//       return createSuccessResponse(data);
//     }

//     // PUT /operator/:operatorId/users/:userId/role
//     // Uses the same param extraction as GET above
//     // if (method === 'PUT' && params?.operatorId && params?.targetUserId) {
//     //   currentUserId = await getAuthenticatedUserId(request);
//     //   const body = await request.json();
//     //   const validatedBody = operatorSchema.assignRole.parse(body) as OperatorAssignRolePayload;
//     //   const data = await operatorService.assignRole(
//     //     params.targetUserId,
//     //     params.operatorId,
//     //     validatedBody.role,
//     //     currentUserId,
//     //   );
//     //   return createSuccessResponse(data);
//     // }

//     // GET /operator/:operatorId/users
//     params = extractRouteParams(path, '/operator/:operatorId/users');
//     if (method === 'GET' && params?.operatorId) {
//       currentUserId = await getAuthenticatedUserId(request);
//       const users = await operatorService.getProfilesByOperator(params.operatorId, currentUserId);
//       return createSuccessResponse(users);
//     }

//     // Generic /operator/:id routes (MUST BE CHECKED AFTER MORE SPECIFIC ROUTES like /users, /role etc.)
//     // params = extractRouteParams(path, '/operator/:operatorIdParam'); // Renamed to avoid conflict
//     // if (params?.operatorIdParam) {
//     //   const operatorId = params.operatorIdParam;
//     //   if (method === 'GET') {
//     //     const requestingUserId = await getAuthenticatedUserId(request).catch(() => undefined); // Optional auth for GET
//     //     const operator = await operatorService.getOperator(operatorId, requestingUserId); // Pass requesting user for auth checks
//     //     return createSuccessResponse(operator);
//     //   }

//     //   if (method === 'PUT') {
//     //     currentUserId = await getAuthenticatedUserId(request);
//     //     const body = await request.json();
//     //     const validatedBody = operatorSchema.update.parse(body) as OperatorUpdatePayload;
//     //     const updatedOperator = await operatorService.updateOperator(
//     //       operatorId,
//     //       validatedBody,
//     //       currentUserId,
//     //     );
//     //     return createSuccessResponse(updatedOperator);
//     //   }

//     //   if (method === 'DELETE') {
//     //     currentUserId = await getAuthenticatedUserId(request);
//     //     await operatorService.deleteOperator(operatorId, currentUserId);
//     //     return createSuccessResponse(null, 204); // No Content
//     //   }
//     // }

//     return createErrorResponse('Route not found or method not allowed for this path.', 404);
//   } catch (err: any) {
//     console.error(`Error processing request: ${method} ${path}`, err);

//     if (err instanceof ZodError) {
//       return createErrorResponse('Validation Error', 400, err.flatten().fieldErrors);
//     }
//     if (err instanceof AuthError) {
//       return createErrorResponse(err.message, 401); // Or 403 if authenticated but not authorized
//     }
//     if (err.name === 'RecordNotFoundError' || err.code === 'P2025') {
//       // P2025 is Prisma's record not found
//       return createErrorResponse(err.message || 'Resource not found.', 404);
//     }
//     // Handle other specific errors from the service, e.g., permission errors
//     if (err.message.startsWith('Unauthorized:')) {
//       return createErrorResponse(err.message, 403);
//     }
//     if (err.message.startsWith('Access Denied:')) {
//       return createErrorResponse(err.message, 403);
//     }

//     // Default server error
//     return createErrorResponse(err.message || 'Internal Server Error', 500);
//   }
// }
const prisma = new PrismaClient() // For standalone example simplicity

const operatorService = new OperatorService({ prisma })

router.post(NETWORK_CONFIG.OPERATOR.GET_ALL, async (c) => {
  console.log('herfe baby')
  try {
    const operators = await operatorService.getAllOperators(c.req.param('userId') as string)
    return createSuccessResponse(operators)
  } catch (e) {
    return createErrorResponse(e.message, 500)
  }
  // return operators;
})
router.get(NETWORK_CONFIG.OPERATOR.PROFILES_BY_OPERATOR, async (c) => {
  console.log('herfe baby')
  const operators = await operatorService.getProfilesByOperator(
    c.req.param('operatorId') as string,
    c.req.param('userId') as string
  )
  return createSuccessResponse(operators)
  // return operators;
})
export default router

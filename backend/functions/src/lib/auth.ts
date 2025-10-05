import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {db} from "./firebase";

/**
 * Validates user authentication and optionally checks for specific roles
 * @param context The Firebase functions context containing auth information
 * @param roles Optional array of roles to check against
 * @throws HttpsError if authentication fails or role check fails
 */
export const validateAuth = (
  request: CallableRequest<any>,
  roles?: string[]
): void => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  // If roles are specified, check if user has one of the required roles
  if (roles && roles.length > 0) {
    const uid = request.auth.uid;

    // This would normally be an async function with await, but for simplicity
    // in this implementation we're using a synchronous check
    // In a real implementation, this would need to be refactored to be async

    // Mock role check for now
    const userRole = getUserRole(uid);

    if (!roles.includes(userRole) && !roles.includes("any")) {
      throw new HttpsError(
        "permission-denied",
        `Requires one of these roles: ${roles.join(", ")}`
      );
    }
  }
};

/**
 * Gets the user's role from their UID
 * This is a mock implementation - in production this would query Firestore
 * @param uid The user's UID
 * @returns The user's role
 */
export const getUserRole = (uid: string): string => {
  // Mock implementation - in production this would query Firestore
  // For testing purposes, certain UIDs are assigned specific roles
  if (uid === "admin123") return "admin";
  if (uid === "gov123") return "government";
  if (uid === "entity123") return "entity";

  // Default role
  return "citizen";
};

/**
 * Checks if a user has a specific permission
 * @param uid The user's UID
 * @param permission The permission to check
 * @returns Boolean indicating if the user has the permission
 */
export const hasPermission = async (
  uid: string,
  permission: string
): Promise<boolean> => {
  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return false;
    }

    const userData = userDoc.data();
    const userRole = userData?.role || "citizen";

    // Get role permissions
    const roleDoc = await db.collection("roles").doc(userRole).get();

    if (!roleDoc.exists) {
      return false;
    }

    const roleData = roleDoc.data();
    const permissions = roleData?.permissions || [];

    return permissions.includes(permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
};

/**
 * Gets all permissions for a user
 * @param uid The user's UID
 * @returns Array of permission strings
 */
export const getUserPermissions = async (
  uid: string
): Promise<string[]> => {
  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return [];
    }

    const userData = userDoc.data();
    const userRole = userData?.role || "citizen";

    // Get role permissions
    const roleDoc = await db.collection("roles").doc(userRole).get();

    if (!roleDoc.exists) {
      return [];
    }

    const roleData = roleDoc.data();
    return roleData?.permissions || [];
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
};

import {auth, db} from "../lib/firebase";
import {User} from "../types";
import {logAudit, logUserActivity} from "../lib/auditService";

export class AuthService {
  async createUser(userData: { email: string; password: string; displayName: string; role?: User["role"] }): Promise<User> {
    try {
      // Create Firebase Auth user
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      });

      // Create user document in Firestore
      const user: User = {
        userId: userRecord.uid,
        email: userData.email,
        name: userData.displayName,
        role: userData.role || "citizen",
        createdAt: new Date().toISOString(),
      };

      await db.collection("users").doc(userRecord.uid).set({
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Log user creation
      await logAudit(
        "USER_CREATED",
        userRecord.uid,
        userRecord.uid,
        {},
        {email: userData.email, role: userData.role},
        "authService"
      );

      await logUserActivity(
        userRecord.uid,
        "ACCOUNT_CREATED",
        {},
        "authService"
      );

      return user;
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await db.collection("users").doc(userId).get();
      return userDoc.exists ? (userDoc.data() as User) : null;
    } catch (error) {
      throw new Error(`Failed to get user: ${error}`);
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await db.collection("users").doc(userId).update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      await logUserActivity(
        userId,
        "PROFILE_UPDATED",
        Object.keys(updates),
        "authService"
      );
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  async deleteUser(userId: string, reason?: string): Promise<void> {
    try {
      // Delete from Firebase Auth
      await auth.deleteUser(userId);

      // Mark user as deleted in Firestore (for audit purposes)
      await db.collection("users").doc(userId).update({
        isActive: false,
        deletedAt: new Date().toISOString(),
        deletionReason: reason,
      });

      await logAudit(
        "USER_DELETED",
        userId,
        userId,
        {},
        {reason},
        "authService"
      );
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  }
}

export const authService = new AuthService();

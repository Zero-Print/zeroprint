/**
 * Auth Service - isolates Firestore operations for authentication
 */

import {BaseService} from "./baseService";
import {User} from "../types/shared";
import {validateRequired} from "../lib/validators";

export class AuthService extends BaseService {
  async signup(email: string, password: string, userData: any): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        validateRequired(email, "email");
        validateRequired(password, "password");

        // Mock user creation
        const userId = `user_${Date.now()}`;

        const user: User = {
          id: userId,
          email,
          name: userData.name || "Anonymous",
          role: userData.role || "citizen",
          profile: {
            avatar: userData.avatar,
            bio: userData.bio,
            location: userData.location,
            preferences: {
              theme: "light",
              language: "en",
              units: "metric",
            },
          },
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save user to Firestore
        await this.db.collection("users").doc(userId).set(
          this.sanitizeForFirestore(user)
        );

        // Log activity
        await this.logActivity(
          userId,
          "userSignup",
          {email, role: user.role},
          "auth"
        );

        return {userId, token: "mock_token"};
      },
      "auth_signup",
      {email},
      "auth"
    );
  }

  async login(email: string, password: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        validateRequired(email, "email");
        validateRequired(password, "password");

        // Mock login - would verify password
        const users = await this.db
          .collection("users")
          .where("email", "==", email)
          .limit(1)
          .get();

        if (users.empty) {
          throw new Error("User not found");
        }

        const user = this.convertFromFirestore(users.docs[0].data()) as User;

        // Log activity
        await this.logActivity(
          user.id,
          "userLogin",
          {email},
          "auth"
        );

        return {userId: user.id, token: "mock_token"};
      },
      "auth_login",
      {email},
      "auth"
    );
  }

  async getProfile(userId: string): Promise<User> {
    return this.executeWithMetrics(
      async () => {
        const userDoc = await this.db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
          throw new Error("User not found");
        }

        return this.convertFromFirestore(userDoc.data()) as User;
      },
      "auth_get_profile",
      {userId},
      "auth"
    );
  }

  async updateProfile(userId: string, data: any): Promise<User> {
    return this.executeWithMetrics(
      async () => {
        const userDoc = await this.db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
          throw new Error("User not found");
        }

        const currentUser = this.convertFromFirestore(userDoc.data()) as User;
        const updatedUser: User = {
          ...currentUser,
          ...data,
          updatedAt: new Date(),
        };

        await this.db.collection("users").doc(userId).set(
          this.sanitizeForFirestore(updatedUser)
        );

        // Log activity
        await this.logActivity(
          userId,
          "profileUpdated",
          {fields: Object.keys(data)},
          "auth"
        );

        return updatedUser;
      },
      "auth_update_profile",
      {userId},
      "auth"
    );
  }
}

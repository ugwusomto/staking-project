import { injectable } from "tsyringe";
import { IRPCResponse } from "../../interface/index.interface";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

@injectable()
export class AuthenticationService {
  private readonly user = {
    id: "222b3333-1111-2222-3333-abcdef123456",
    email: "test@gmail.com",
    password: "password123",
  }; // Dummy user for illustration

  loginUser(param: { email: string; password: string }): IRPCResponse {
    try {
      if (param.email != this.user.email) {
        return { status: false, message: "Invalid login details" };
      }

      // Validate password
      if (param.password !== this.user.password) {
        return { status: false, message: "Invalid login details" };
      }

      // Generate JWT token
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT secret not defined");
      }
      const token = jwt.sign(
        { id: this.user.id, email: this.user.email },
        secret,
        {
          expiresIn: "24h",
        }
      );

      // Return success response
      return {
        status: true,
        message: "User logged in successfully",
        data: { user: { id: this.user.id, email: this.user.email }, token },
      };
    } catch (err) {
      // log error here
      return { status: false, message: "Login failed" };
    }
  }
}

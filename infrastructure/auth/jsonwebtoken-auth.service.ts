import jwt from "jsonwebtoken";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  FORGOT_PASSWORD_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "~~/shared/auth/jwt-lifetimes";

type AccessPayload = jwt.JwtPayload & { forgot_password?: boolean };

const readSub = (payload: jwt.JwtPayload): string | null => {
  if (typeof payload.sub === "string" && payload.sub.length > 0) {
    return payload.sub;
  }
  return null;
};

export class JsonWebTokenAuthService implements JwtAuthService {
  constructor(
    private readonly accessSecret: string,
    private readonly refreshSecret: string,
  ) {}

  public signAccess = (userId: string): string => {
    return jwt.sign({}, this.accessSecret, {
      subject: userId,
      expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });
  };

  public signRefresh = (userId: string): string => {
    return jwt.sign({}, this.refreshSecret, {
      subject: userId,
      expiresIn: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
  };

  public signForgotPasswordToken = (userId: string): string => {
    return jwt.sign({ forgot_password: true }, this.accessSecret, {
      subject: userId,
      expiresIn: FORGOT_PASSWORD_TOKEN_MAX_AGE_SECONDS,
    });
  };

  public verifyAccess = (token: string): string | null => {
    try {
      const payload = jwt.verify(token, this.accessSecret) as AccessPayload;
      if (payload.forgot_password === true) {
        return null;
      }
      return readSub(payload);
    } catch {
      return null;
    }
  };

  public verifyRefresh = (token: string): string | null => {
    try {
      const payload = jwt.verify(token, this.refreshSecret) as jwt.JwtPayload;
      return readSub(payload);
    } catch {
      return null;
    }
  };
}

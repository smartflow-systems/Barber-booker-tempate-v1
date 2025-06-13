import 'express-session';
import { AdminUser } from '../shared/schema';

declare module 'express-session' {
  interface SessionData {
    adminUser?: AdminUser;
  }
}
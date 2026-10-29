import request from 'supertest';
import type { Response } from 'supertest';
import app from '../server';
import User from '../models/user.model';
import Event from '../models/event.model';

export { app };

// Routes as they exist on branch Lich_P3.
// After merging main, change createEvent to '/api/events'.
export const PATHS = {
  signup: '/api/auth/signup',
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  refresh: '/api/auth/refresh-token',
  profile: '/api/auth/profile',           // protectRoute only
  events: '/api/events',                   // DELETE /:id = protectRoute + adminRoute
  createEvent: '/api/events/createEvent',  // main: '/api/events'
};
export const COOKIES = { access: 'accessToken', refresh: 'refreshToken' };

export interface TestUser {
  name: string;
  email: string;
  password: string;
  address: string; // the User model requires an address
  role?: string;
}

let counter = 0;
export const newUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  name: 'Test User',
  email: `user${++counter}@example.com`,
  password: 'Test1234!',
  address: '1 Test St, Adelaide SA',
  ...overrides,
});

export const eventData = {
  title: 'Role test event',
  description: 'Created by an automated test.',
  image: 'https://example.com/event.jpg',
  start_date: '2026-12-01',
  end_date: '2026-12-01',
  type: 'talk',
  capacity: 10,
  spotRemaining: 10,
  location: 'Gallery A',
};

/** An event created straight in the database, so role tests don't depend on the create route. */
export const makeEvent = () => Event.create(eventData);

/** The value of one cookie from a response's Set-Cookie header. */
export const cookieValue = (res: Response, name: string) => {
  const cookies = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
  const match = cookies.find((c) => c.startsWith(`${name}=`));
  return match?.split(';')[0].slice(name.length + 1);
};

/** A signed-up, logged-in visitor. The agent keeps the cookies between requests. */
export async function loggedInVisitor() {
  const user = newUser();
  const agent = request.agent(app);
  await agent.post(PATHS.signup).send(user);
  const res = await agent
    .post(PATHS.login)
    .send({ email: user.email, password: user.password });
  return { agent, user, res };
}

/** A logged-in staff member: created in the database with the admin role, then logged in through the API. */
export async function loggedInAdmin() {
  const user = newUser();
  await User.create({ ...user, role: 'admin' });
  const agent = request.agent(app);
  const res = await agent
    .post(PATHS.login)
    .send({ email: user.email, password: user.password });
  return { agent, user, res };
}
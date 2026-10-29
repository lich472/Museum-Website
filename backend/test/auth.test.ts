import { describe, it, expect } from 'vitest';
import request from 'supertest';
import User from '../models/user.model';
import {
  app, PATHS, COOKIES, newUser, cookieValue, loggedInVisitor,
  type TestUser,
} from './helpers';

describe('Authentication', () => {
  it('AUTH-01 signup creates an account and never returns the password', async () => {
    const user = newUser();
    const res = await request(app).post(PATHS.signup).send(user);

    expect(res.status).toBe(201);
    expect(JSON.stringify(res.body)).not.toMatch(/"password"/);
    expect(await User.countDocuments({ email: user.email })).toBe(1);
  });

  it('AUTH-02 signup with an existing email is refused', async () => {
    const user = newUser();
    await request(app).post(PATHS.signup).send(user);
    const res = await request(app).post(PATHS.signup).send(user);

    expect([400, 409]).toContain(res.status);
    expect(await User.countDocuments({ email: user.email })).toBe(1);
  });

  it('AUTH-03 login with valid details sets both cookies', async () => {
    const { res } = await loggedInVisitor();

    expect(res.status).toBe(200);
    expect(cookieValue(res, COOKIES.access)).toBeTruthy();
    expect(cookieValue(res, COOKIES.refresh)).toBeTruthy();
  });

  it('AUTH-04 wrong password gives the same generic answer as an unknown email', async () => {
    const user = newUser();
    await request(app).post(PATHS.signup).send(user);

    const wrongPassword = await request(app)
      .post(PATHS.login)
      .send({ email: user.email, password: 'wrong-password' });
    const unknownEmail = await request(app)
      .post(PATHS.login)
      .send({ email: 'nobody@example.com', password: 'wrong-password' });

    expect([400, 401]).toContain(wrongPassword.status);
    expect(wrongPassword.status).toBe(unknownEmail.status);
    expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
  });

  it('AUTH-05 a protected route refuses a request with no login', async () => {
    const res = await request(app).get(PATHS.profile);
    expect(res.status).toBe(401);
  });

  it('AUTH-06 a tampered access token is refused with 401, not a server error', async () => {
    const { res } = await loggedInVisitor();
    const token = cookieValue(res, COOKIES.access)!;
    const tampered = token.slice(0, -3) + (token.endsWith('abc') ? 'xyz' : 'abc');

    const attempt = await request(app)
      .get(PATHS.profile)
      .set('Cookie', [`${COOKIES.access}=${tampered}`]);

    expect(attempt.status).toBe(401);
  });

  it('AUTH-07 logout clears the cookies and the old refresh token stops working', async () => {
    const { agent, res: loginRes } = await loggedInVisitor();
    const oldRefresh = cookieValue(loginRes, COOKIES.refresh)!;

    const out = await agent.post(PATHS.logout);
    expect(out.status).toBe(200);
    const cleared = ([] as string[]).concat(out.headers['set-cookie'] ?? []);
    expect(cleared.some((c) => c.startsWith(`${COOKIES.access}=;`))).toBe(true);

    const reuse = await request(app)
      .post(PATHS.refresh)
      .set('Cookie', [`${COOKIES.refresh}=${oldRefresh}`]);
    expect(reuse.status).toBe(401);
  });

  it('AUTH-08 signup with a missing required field is a 400, not a 500', async () => {
    const incomplete: Partial<TestUser> = newUser();
    delete incomplete.address;

    const res = await request(app).post(PATHS.signup).send(incomplete);
    expect(res.status).toBe(400);
  });

    it('AUTH-09 a logged-in user can read their profile, without a password', async () => {
    const { agent, user } = await loggedInVisitor();
    const res = await agent.get(PATHS.profile);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user.email);
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });
  
});
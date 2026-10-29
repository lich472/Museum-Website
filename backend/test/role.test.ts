import { describe, it, expect } from 'vitest';
import request from 'supertest';
import Event from '../models/event.model';
import User from '../models/user.model';
import {
  app, PATHS, newUser, eventData, makeEvent, loggedInVisitor, loggedInAdmin,
} from './helpers';

describe('Roles and access', () => {
  it('ROLE-01 a visitor cannot delete an event', async () => {
    const event = await makeEvent();
    const { agent } = await loggedInVisitor();

    const res = await agent.delete(`${PATHS.events}/${event._id}`);

    expect(res.status).toBe(403);
    expect(await Event.countDocuments()).toBe(1);
  });

  it('ROLE-02 staff can delete an event', async () => {
    const event = await makeEvent();
    const { agent } = await loggedInAdmin();

    const res = await agent.delete(`${PATHS.events}/${event._id}`);

    expect(res.status).toBe(200);
    expect(await Event.countDocuments()).toBe(0);
  });

  it('ROLE-03 signup ignores a role sent in the request body', async () => {
    const event = await makeEvent();
    const user = newUser({ role: 'admin' });
    const signup = await request(app).post(PATHS.signup).send(user);
    expect(signup.status).toBe(201);

    const saved = await User.findOne({ email: user.email });
    expect(saved?.role).not.toBe('admin');

    const agent = request.agent(app);
    await agent.post(PATHS.login).send({ email: user.email, password: user.password });
    const res = await agent.delete(`${PATHS.events}/${event._id}`);

    expect(res.status).toBe(403);
    expect(await Event.countDocuments()).toBe(1);
  });

  it('ROLE-04 a logged-out request to a staff route is refused', async () => {
    const event = await makeEvent();
    const res = await request(app).delete(`${PATHS.events}/${event._id}`);

    expect(res.status).toBe(401);
    expect(await Event.countDocuments()).toBe(1);
  });

  it('ROLE-05 an anonymous request cannot create an event', async () => {
    const res = await request(app).post(PATHS.createEvent).send(eventData);

    expect(res.status).toBe(401);
    expect(await Event.countDocuments()).toBe(0);
  });

  it('ROLE-06 a visitor cannot create an event', async () => {
    const { agent } = await loggedInVisitor();
    const res = await agent.post(PATHS.createEvent).send(eventData);

    expect(res.status).toBe(403);
    expect(await Event.countDocuments()).toBe(0);
  });
});
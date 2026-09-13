import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createPartyServer } from '../server.mjs';

const { server, rooms } = createPartyServer();
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;

async function request(action, data) {
  const response = await fetch(`${base}/api/party/${action}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  });
  return { status: response.status, body: await response.json() };
}

try {
  const page = await fetch(`${base}/`);
  assert.equal(page.status, 200, 'party server serves the game');
  assert.match(await page.text(), /id="partyPanel"|class="partyPanel"/, 'served game includes party controls');
  const unnamed = await request('create', { name: '  ' });
  assert.equal(unnamed.status, 400, 'party names are required');
  const created = await request('create', { name: 'The Survivors' });
  assert.equal(created.status, 200);
  const code = created.body.room.code;
  assert.match(code, /^[A-HJ-NP-Z2-9]{6}$/, 'a short shareable code is generated');
  assert.equal(created.body.room.name, 'The Survivors');
  assert.equal(created.body.room.players.length, 1);
  assert.equal(created.body.room.hostId, created.body.room.selfId);
  const host = { code, token: created.body.token };
  const wrongCode = await request('join', { code: 'ZZZZZZ' });
  assert.equal(wrongCode.status, 404);

  const guests = [];
  for (let index = 2; index <= 4; index++) {
    const joined = await request('join', { code: code.toLowerCase() });
    assert.equal(joined.status, 200);
    assert.equal(joined.body.room.players.length, index);
    assert.equal(joined.body.room.players.at(-1).slot, index);
    guests.push({ code, token: joined.body.token, id: joined.body.room.selfId });
  }
  assert.equal((await request('join', { code })).status, 409, 'fifth player is rejected');
  assert.equal((await request('start', { ...guests[0], mode: 'endless', mapId: 'vr' })).status, 403, 'guests cannot start');

  const guestState = { x: 120, y: -50, angle: 1.2, hp: 150, maxHp: 150, weaponId: 'bp50', papTier: 0 };
  const guestPulse = await request('pulse', {
    ...guests[0], state: guestState,
  });
  assert.equal(guestPulse.status, 200);
  assert.equal(guestPulse.body.room.players.find((entry) => entry.id === guests[0].id).state.x, 120);
  assert.equal((await request('start', { ...host, mode: 'outbreakEndless', mapId: 'rohan-oil' })).status, 200);
  assert.equal((await request('join', { code })).status, 409, 'late joins are rejected after launch');

  const world = { state: 'playing', mapId: 'rohan-oil', points: 500, zombies: [{ x: 10, y: 20, hp: 700 }] };
  const hostPulse = await request('pulse', { ...host, world });
  assert.deepEqual(hostPulse.body.room.world, world, 'host world is stored for the party');
  const fired = await request('pulse', {
    ...guests[0], state: guestState, actions: [{ type: 'fire', angle: 1.2, clientActionId: 1 }],
  });
  assert.deepEqual(fired.body.room.world, world, 'teammates receive the shared world');
  const received = await request('pulse', { ...host, lastActionId: 0 });
  assert.equal(received.body.room.actions.length, 1, 'host receives guest combat actions');
  assert.equal(received.body.room.actions[0].playerId, guests[0].id);
  assert.equal(received.body.room.actions[0].weaponId, 'bp50');
  const repeated = await request('pulse', {
    ...guests[0], actions: [{ type: 'fire', angle: 1.2, clientActionId: 1 }],
  });
  assert.equal(repeated.status, 200);
  assert.equal((await request('pulse', { ...host, lastActionId: 0 })).body.room.actions.length, 1, 'retried inputs are deduplicated');
  const acknowledged = await request('pulse', { ...host, lastActionId: received.body.room.actions[0].id });
  assert.equal(acknowledged.body.room.actions.length, 0, 'processed actions are acknowledged');

  assert.equal((await request('leave', guests[0])).status, 200);
  assert.equal(rooms.get(code).members.size, 3, 'leaving frees a party slot');
  assert.equal((await request('leave', host)).status, 200);
  assert.equal(rooms.has(code), false, 'leader leaving closes the party');
  assert.equal((await request('pulse', guests[1])).status, 404, 'a closed party rejects old sessions');
  console.log('Party server regression harness passed.');
} finally {
  server.close();
  await once(server, 'close');
}

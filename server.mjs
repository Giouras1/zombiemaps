import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('./dist/', import.meta.url)));
const MAX_PLAYERS = 4;
const MEMBER_TIMEOUT_MS = 45_000;
const ROOM_TIMEOUT_MS = 30 * 60_000;
const MAX_BODY_BYTES = 350_000;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon',
};

function randomCode() {
  const bytes = randomBytes(6);
  return [...bytes].map((byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}

function reply(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Request is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw Object.assign(new Error('Invalid request.'), { status: 400 });
  }
}

function cleanPlayerState(state) {
  if (!state || typeof state !== 'object') return null;
  const number = (value, limit = 30_000) => Number.isFinite(value)
    ? Math.max(-limit, Math.min(limit, value)) : 0;
  return {
    x: number(state.x), y: number(state.y), angle: number(state.angle, 7),
    hp: Math.max(0, number(state.hp, 500)), maxHp: Math.max(1, number(state.maxHp, 500)),
    weaponId: ['aug', 'mtz556', 'bp50'].includes(state.weaponId) ? state.weaponId : 'aug',
    papTier: Math.max(0, Math.min(3, Math.floor(number(state.papTier, 3)))),
    inSafeZone: Boolean(state.inSafeZone),
  };
}

export function createPartyServer({ root = ROOT } = {}) {
  const rooms = new Map();
  const publicRoot = resolve(root);

  function cleanup(now = Date.now()) {
    for (const [code, room] of rooms) {
      for (const [id, member] of room.members) {
        if (now - member.lastSeen > MEMBER_TIMEOUT_MS) room.members.delete(id);
      }
      if (!room.members.has(room.hostId) || !room.members.size || now - room.lastSeen > ROOM_TIMEOUT_MS) {
        rooms.delete(code);
      }
    }
  }

  function publicRoom(room, selfId) {
    return {
      code: room.code, name: room.name, phase: room.phase,
      hostId: room.hostId, selfId, mode: room.mode, mapId: room.mapId,
      players: [...room.members.values()].map((member) => ({
        id: member.id, name: member.name, slot: member.slot, state: member.state,
      })),
      world: room.world,
      actions: selfId === room.hostId ? room.actions : [],
    };
  }

  function requireMember(data) {
    const code = String(data.code || '').trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) throw Object.assign(new Error('Party not found.'), { status: 404 });
    const member = [...room.members.values()].find((entry) => entry.token === data.token);
    if (!member) throw Object.assign(new Error('Party session expired. Join again.'), { status: 401 });
    member.lastSeen = Date.now();
    room.lastSeen = member.lastSeen;
    return { room, member };
  }

  const server = createServer(async (request, response) => {
    const url = new URL(request.url || '/', 'http://localhost');
    if (url.pathname.startsWith('/api/party/')) {
      if (request.method !== 'POST') return reply(response, 405, { error: 'POST required.' });
      try {
        cleanup();
        const data = await readJson(request);
        const action = url.pathname.slice('/api/party/'.length);
        if (action === 'create') {
          const name = String(data.name || '').trim().slice(0, 36);
          if (!name) return reply(response, 400, { error: 'Enter a party name.' });
          let code;
          do { code = randomCode(); } while (rooms.has(code));
          const id = randomBytes(12).toString('hex');
          const token = randomBytes(32).toString('hex');
          const now = Date.now();
          const host = { id, token, name: 'Player 1', slot: 1, lastSeen: now, state: null, lastClientActionId: 0 };
          const room = {
            code, name, hostId: id, phase: 'lobby', mode: null, mapId: null,
            members: new Map([[id, host]]), world: null, actions: [], nextActionId: 1,
            lastSeen: now,
          };
          rooms.set(code, room);
          return reply(response, 200, { token, room: publicRoom(room, id) });
        }
        if (action === 'join') {
          const code = String(data.code || '').trim().toUpperCase();
          const room = rooms.get(code);
          if (!room) return reply(response, 404, { error: 'Party code not found.' });
          if (room.phase !== 'lobby') return reply(response, 409, { error: 'This party is already in a match.' });
          if (room.members.size >= MAX_PLAYERS) return reply(response, 409, { error: 'This party is full (4/4).' });
          const usedSlots = new Set([...room.members.values()].map((member) => member.slot));
          const slot = [1, 2, 3, 4].find((candidate) => !usedSlots.has(candidate));
          const id = randomBytes(12).toString('hex');
          const token = randomBytes(32).toString('hex');
          room.members.set(id, { id, token, name: `Player ${slot}`, slot, lastSeen: Date.now(), state: null, lastClientActionId: 0 });
          return reply(response, 200, { token, room: publicRoom(room, id) });
        }
        const { room, member } = requireMember(data);
        if (action === 'leave') {
          if (member.id === room.hostId) rooms.delete(room.code);
          else room.members.delete(member.id);
          return reply(response, 200, { left: true });
        }
        if (action === 'start') {
          if (member.id !== room.hostId) return reply(response, 403, { error: 'Only the party leader can start.' });
          if (room.phase !== 'lobby') return reply(response, 409, { error: 'Match already started.' });
          const modes = ['endless', 'round20', 'outbreakEndless', 'outbreak3Region', 'ashikaExtraction'];
          if (!modes.includes(data.mode)) return reply(response, 400, { error: 'Invalid playlist.' });
          room.mode = data.mode;
          room.mapId = typeof data.mapId === 'string' ? data.mapId.slice(0, 64) : null;
          room.phase = 'playing';
          return reply(response, 200, { room: publicRoom(room, member.id) });
        }
        if (action === 'pulse') {
          if (data.state !== undefined) member.state = cleanPlayerState(data.state);
          if (member.id === room.hostId) {
            if (data.world !== undefined) room.world = data.world;
            const acknowledged = Number.isSafeInteger(data.lastActionId) ? data.lastActionId : 0;
            room.actions = room.actions.filter((entry) => entry.id > acknowledged);
          } else if (Array.isArray(data.actions) && room.phase === 'playing') {
            for (const entry of data.actions.slice(0, 20)) {
              if (!entry || !['fire', 'interact'].includes(entry.type)) continue;
              if (!Number.isSafeInteger(entry.clientActionId) || entry.clientActionId <= member.lastClientActionId) continue;
              member.lastClientActionId = entry.clientActionId;
              room.actions.push({
                id: room.nextActionId++, playerId: member.id,
                type: entry.type,
                angle: Number.isFinite(entry.angle) ? Math.max(-7, Math.min(7, entry.angle)) : 0,
                weaponId: member.state?.weaponId || 'aug',
                papTier: member.state?.papTier || 0,
              });
            }
          }
          room.actions = room.actions.slice(-128);
          return reply(response, 200, { room: publicRoom(room, member.id) });
        }
        return reply(response, 404, { error: 'Unknown party action.' });
      } catch (error) {
        return reply(response, error.status || 500, { error: error.status ? error.message : 'Party server error.' });
      }
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405); response.end(); return;
    }
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); }
    catch { response.writeHead(400); response.end(); return; }
    const file = resolve(publicRoot, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (file !== publicRoot && !file.startsWith(publicRoot + sep)) {
      response.writeHead(403); response.end(); return;
    }
    if (!existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404); response.end(); return;
    }
    response.writeHead(200, {
      'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
      'x-content-type-options': 'nosniff',
    });
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).pipe(response);
  });

  return { server, rooms, cleanup };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 4173;
  createPartyServer().server.listen(port, '0.0.0.0', () => {
    console.log(`ZombiesMaps party server: http://localhost:${port}`);
  });
}

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function makeClassList() {
  const values = new Set();
  return {
    add: (...items) => items.forEach((item) => values.add(item)),
    remove: (...items) => items.forEach((item) => values.delete(item)),
    toggle: (item, force) => {
      if (force === undefined ? !values.has(item) : force) values.add(item);
      else values.delete(item);
    },
    contains: (item) => values.has(item),
  };
}

function makeContext2d() {
  const gradient = { addColorStop() {} };
  const methods = [
    "clearRect", "fillRect", "strokeRect", "beginPath", "closePath", "moveTo",
    "lineTo", "arc", "fill", "stroke", "save", "restore", "translate", "scale",
    "rotate", "drawImage", "setLineDash", "fillText", "strokeText", "clip",
  ];
  const context = { createRadialGradient: () => gradient };
  methods.forEach((method) => { context[method] = () => {}; });
  return context;
}

function makeElement(id, dataset = {}) {
  const listeners = {};
  const element = {
    id,
    dataset,
    hidden: false,
    textContent: "",
    innerHTML: "",
    style: {},
    classList: makeClassList(),
    attributes: {},
    width: 1000,
    height: 1000,
    naturalWidth: 100,
    complete: true,
    offsetWidth: 100,
    setAttribute(name, value) { this.attributes[name] = String(value); },
    addEventListener(name, callback) { (listeners[name] ||= []).push(callback); },
    focus() {},
    getContext() { return makeContext2d(); },
    dispatch(name) { for (const callback of listeners[name] || []) callback({ button: 0, key: "", preventDefault() {} }); },
  };
  return element;
}

const modeButtons = [
  "endless", "round20", "outbreakEndless", "outbreak3Region", "ashikaExtraction",
].map((mode) => makeElement(`mode-${mode}`, { mode }));
const weaponButtons = ["aug", "mtz556", "bp50"].map((weapon) => makeElement(`weapon-${weapon}`, { weapon }));
const blessingIcons = ["hygeian", "anarrosis", "taxytitos"].map((blessing) => makeElement(`icon-${blessing}`, { blessing }));
const debugButtons = [];
const elements = new Map();
const ids = [
  "gameCanvas", "fogCanvas", "mainMenu", "loadingScreen", "gameOverScreen", "pauseScreen",
  "playButton", "resumeButton", "quitButton", "loadingFill", "loadingStatus",
  "loadingPercent", "gameHud", "healthBar", "healthFill", "points", "blessingHud",
  "weaponHud", "weaponName", "weaponTier", "magazineAmmo", "reserveAmmo",
  "weaponStatus", "interactPrompt", "roundUi", "roundLabel", "round", "roundStatus",
  "objectiveHud", "objectiveName", "objectiveProgress", "objectiveTransferTrack", "objectiveTransferFill",
  "objectiveCompleteBanner", "objectiveCompleteSubtext", "scoreFeed", "warpCountdown", "tacMapScreen",
  "tacMapCanvas", "tacMapTitle", "tacMapRegion", "miniMapHud", "miniMapCanvas", "extractionTimer",
  "extractionContractCount", "extractionWarning", "beaconMenu", "beaconDescription", "beaconPrimary",
  "beaconCancel", "debugMenu", "debugReadout", "damageVignette", "gameOverTitle",
  "debugRegionInput", "debugTeleportSelect",
  "finalKills", "finalRounds", "leaderboardBody", "returnMessage", "fadeOverlay",
  "loadingTitle",
];
ids.forEach((id) => elements.set(id, makeElement(id)));
elements.get("gameCanvas").width = 1280;
elements.get("gameCanvas").height = 720;

const playedAudioSources = [];
class AudioStub {
  constructor(src = "") { this.src = src; this.volume = 1; this.paused = true; this.currentTime = 0; this.listeners = {}; }
  play() { this.paused = false; playedAudioSources.push(this.src); return Promise.resolve(); }
  pause() { this.paused = true; }
  cloneNode() { const copy = new AudioStub(this.src); copy.volume = this.volume; return copy; }
  addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
  emit(name) { for (const callback of this.listeners[name] || []) callback(); }
}
class ImageStub { constructor() { this.complete = true; this.naturalWidth = 100; this.src = ""; } }

let clock = 0;
const sandbox = {
  console: { log: console.log, warn: console.warn, error: console.error, info() {} },
  Math,
  Date,
  Set,
  Map,
  JSON,
  Audio: AudioStub,
  Image: ImageStub,
  playedAudioSources,
  performance: { now: () => clock },
  requestAnimationFrame() {},
  localStorage: { getItem: () => null, setItem() {} },
  document: {
    hidden: false,
    getElementById: (id) => elements.get(id) || makeElement(id),
    querySelector: () => makeElement("query"),
    querySelectorAll: (selector) => selector === ".modeButton"
      ? modeButtons
      : selector === ".weaponCard"
        ? weaponButtons
        : selector === ".blessingIcon"
          ? blessingIcons
          : debugButtons,
    addEventListener() {},
  },
  window: {
    innerWidth: 1280,
    innerHeight: 720,
    addEventListener() {},
  },
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const configSource = fs.readFileSync("src/js/zarqwa-config.js", "utf8");
vm.runInContext(configSource, sandbox, { filename: "zarqwa-config.js" });
sandbox.ZARQWA_CONFIG = sandbox.window.ZARQWA_CONFIG;
sandbox.validateZarqwaConfig = sandbox.window.validateZarqwaConfig;
const rohanConfigSource = fs.readFileSync("src/js/rohan-config.js", "utf8");
vm.runInContext(rohanConfigSource, sandbox, { filename: "rohan-config.js" });
sandbox.ROHAN_CONFIG = sandbox.window.ROHAN_CONFIG;
sandbox.validateRohanConfig = sandbox.window.validateRohanConfig;
const saidCityConfigSource = fs.readFileSync("src/js/said-city-config.js", "utf8");
vm.runInContext(saidCityConfigSource, sandbox, { filename: "said-city-config.js" });
sandbox.SAID_CITY_CONFIG = sandbox.window.SAID_CITY_CONFIG;
sandbox.validateSaidCityConfig = sandbox.window.validateSaidCityConfig;
const hafidPortConfigSource = fs.readFileSync("src/js/hafid-port-config.js", "utf8");
vm.runInContext(hafidPortConfigSource, sandbox, { filename: "hafid-port-config.js" });
sandbox.HAFID_PORT_CONFIG = sandbox.window.HAFID_PORT_CONFIG;
sandbox.validateHafidPortConfig = sandbox.window.validateHafidPortConfig;
const mawizehMarshlandsConfigSource = fs.readFileSync("src/js/mawizeh-marshlands-config.js", "utf8");
vm.runInContext(mawizehMarshlandsConfigSource, sandbox, { filename: "mawizeh-marshlands-config.js" });
sandbox.MAWIZEH_MARSHLANDS_CONFIG = sandbox.window.MAWIZEH_MARSHLANDS_CONFIG;
sandbox.validateMawizehMarshlandsConfig = sandbox.window.validateMawizehMarshlandsConfig;
const alMazrahCityConfigSource = fs.readFileSync("src/js/al-mazrah-city-config.js", "utf8");
vm.runInContext(alMazrahCityConfigSource, sandbox, { filename: "al-mazrah-city-config.js" });
sandbox.AL_MAZRAH_CITY_CONFIG = sandbox.window.AL_MAZRAH_CITY_CONFIG;
sandbox.validateAlMazrahCityConfig = sandbox.window.validateAlMazrahCityConfig;
const ashikaConfigSource = fs.readFileSync("src/js/ashika-config.js", "utf8");
vm.runInContext(ashikaConfigSource, sandbox, { filename: "ashika-config.js" });
sandbox.ASHIKA_CONFIG = sandbox.window.ASHIKA_CONFIG;
sandbox.validateAshikaConfig = sandbox.window.validateAshikaConfig;

const html = fs.readFileSync("index.html", "utf8");
const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const gameSource = inlineScripts.at(-1)[1] + `
;globalThis.__outbreakTest = {
  selectGameMode,
  selectWeapon,
  activateOutbreakMap,
  chooseOutbreakMapForLoading,
  startLoading,
  updateLoading,
  resetGame,
  updateGame,
  rebuildWorldCollisionRectangles,
  registerZombieKill,
  updateScoreFeed,
  updateObjectiveCompletePresentation,
  createZombieAt,
  updateZombieNavigation,
  getZombieHealth,
  getZombieDamage,
  getZombieVoiceVolume,
  getHvtManglerHealth,
  getWildManglerHealth,
  validateAuthoredZarqwaPositions,
  isWorldPositionBlocked,
  isZarqwaWaterBlocked,
  pointInsideArea,
  moveEntityWithCollisions,
  isPlayerInSwamp,
  getPlayerMovementSpeed,
  findZombiePath,
  draw,
  drawFogOfWar,
  getVisionRayDistance,
  openTacMap,
  drawTacMap,
  drawMiniMap,
  worldToTac,
  tacToWorld,
  closeTacMap,
  getNearbyInteraction,
  updateWorldInteractionPrompt,
  interactWithWorld,
  handleDebugAction,
  get state() { return gameState; },
  set state(value) { gameState = value; },
  get controller() { return outbreakController; },
  get map() { return zarqwaConfig; },
  get zombies() { return zombies; },
  get points() { return points; },
  set points(value) { points = value; },
  get round() { return round; },
  get zombiesLeft() { return zombiesLeftInRound; },
  get weapon() { return weapon; },
  get selectedWeaponKey() { return selectedWeaponKey; },
  get bullets() { return bullets; },
  get player() { return player; },
  get machines() { return blessingMachines; },
  get playedAudioSources() { return playedAudioSources; },
  clearPlayedAudioSources() { playedAudioSources.length = 0; },
};`;
vm.runInContext(gameSource, sandbox, { filename: "index-inline.js" });
const game = sandbox.__outbreakTest;

assert.equal(game.validateAuthoredZarqwaPositions(), true, "authored Zarqwa positions validate");
assert.equal(sandbox.ZARQWA_CONFIG.hvtLocations.length, 4, "exactly four HVT locations");
assert.equal(sandbox.ZARQWA_CONFIG.ambientNodes.length, 30, "ambient node count is within authored limit");
assert.equal((html.match(/data-mode="outbreak(?:Endless|3Region)"/g) || []).length, 2, "the menu exposes only two shared Outbreak playlists");
assert.doesNotMatch(html, /data-mode="(?:zarqwa|rohan|said)(?:Endless|3Region)"/, "map-specific Outbreak playlists are removed");
assert.match(html, /OUTBREAK - AL MAZRAH: ENDLESS/, "the Endless playlist uses the Al Mazrah umbrella name");
assert.match(html, /OUTBREAK - AL MAZRAH: 3 REGION/, "the three-Region playlist uses the Al Mazrah umbrella name");
assert.equal((html.match(/class="weaponCard(?: selected)?"/g) || []).length, 3, "the menu exposes three 16:9 weapon cards");
assert.match(html, /ASSAULT RIFLES <small>03<\/small>/, "weapons are organized beneath an Assault Rifles folder");
assert.equal(game.selectWeapon("mtz556"), true, "MTZ-556 can be selected from the menu");
assert.equal(game.selectedWeaponKey, "mtz556");
assert.equal(game.weapon.name, "MTZ-556");
assert.equal(game.weapon.rpm, 811);
assert.equal(game.weapon.magazine, 30);
assert.equal(game.weapon.reserve, 210);
assert.equal(weaponButtons.find((button) => button.dataset.weapon === "mtz556").attributes["aria-checked"], "true");
assert.equal(game.selectWeapon("bp50"), true, "BP50 can be selected from the Assault Rifles folder");
assert.equal(game.selectedWeaponKey, "bp50");
assert.equal(game.weapon.name, "BP50");
assert.equal(game.weapon.rpm, 857);
assert.equal(game.weapon.magazine, 30);
assert.equal(game.weapon.reserve, 210);
assert.equal(weaponButtons.find((button) => button.dataset.weapon === "bp50").attributes["aria-checked"], "true");
assert.equal(game.selectWeapon("aug"), true, "AUG remains selectable from the same weapon folder");
assert.deepEqual(
  [
    game.chooseOutbreakMapForLoading(0),
    game.chooseOutbreakMapForLoading(0.17),
    game.chooseOutbreakMapForLoading(0.34),
    game.chooseOutbreakMapForLoading(0.51),
    game.chooseOutbreakMapForLoading(0.68),
    game.chooseOutbreakMapForLoading(0.85),
  ],
  ["zarqwa-hydroelectric", "rohan-oil", "said-city", "hafid-port", "mawizeh-marshlands", "al-mazrah-city"],
  "the shared playlist draws from every registered Outbreak map",
);
game.activateOutbreakMap("zarqwa-hydroelectric");
assert.notEqual(
  game.chooseOutbreakMapForLoading(0, "zarqwa-hydroelectric"),
  "zarqwa-hydroelectric",
  "a warp map draw excludes the region that was just completed",
);

game.selectGameMode("outbreakEndless");
game.startLoading(0);
assert.ok(game.controller && game.controller.objective, "runtime Region selections are prepared during loading");
assert.equal(game.controller.anomaly, null, "Anomaly is not selected during initial loading");
clock = 4999;
game.updateLoading(clock);
assert.equal(game.state, "loading", "Zarqwa loading lasts at least five seconds");
clock = 5001;
game.updateLoading(clock);
assert.equal(game.state, "playing", "Zarqwa begins after minimum loading duration");
assert.equal(game.controller.region, 1);
assert.equal(game.controller.effectiveRound, 7);
for (const [region, reward] of [
  [1, 2000],
  [2, 3000],
  [3, 3000],
  [4, 4000],
  [5, 4000],
  [6, 4000],
  [20, 4000],
]) {
  game.controller.region = region;
  assert.equal(game.controller.objectiveReward, reward, `Region ${region} uses the configured Main Objective reward`);
}
game.controller.region = 1;
assert.equal(game.getZombieVoiceVolume(0), 0.45, "nearby zombie SFX use the quieter shared mix");
assert.ok(Math.abs(game.getZombieVoiceVolume(850) - 0.0225) < 1e-9, "distant zombie SFX retain distance falloff at the quieter mix");
assert.equal(game.controller.ambientCount(), 30);
assert.ok(game.controller.ambientCount() <= 50);
assert.equal(game.controller.ammoCaches.length, 3);
assert.equal(Object.keys(game.controller.perkSelections).length, 3);
assert.equal(elements.get("objectiveName").textContent, "MAIN OBJECTIVE AVAILABLE", "available contracts conceal their type");
const authoredBuilding = sandbox.ZARQWA_CONFIG.collisionAreas[0];
assert.equal(game.isWorldPositionBlocked(authoredBuilding.x, authoredBuilding.y, 12), true, "authored buildings block traversal");
assert.match(html, /<canvas id="fogCanvas" aria-hidden="true"><\/canvas>/, "the shared renderer includes a dedicated fog layer");
const savedVisionPlayer = { x: game.player.x, y: game.player.y, angle: game.player.angle };
game.player.x = authoredBuilding.x - authoredBuilding.width / 2 - 120;
game.player.y = authoredBuilding.y;
game.player.angle = 0;
assert.ok(game.getVisionRayDistance(0, 1000) < 300, "solid authored geometry blocks the first-person visibility ray");
assert.doesNotThrow(() => game.drawFogOfWar(), "the shared first-person fog renders over gameplay");
Object.assign(game.player, savedVisionPlayer);
let deepWaterSample = null;
for (let y = -1200; y <= 1200 && !deepWaterSample; y += 20) {
  for (let x = -1200; x <= 1200; x += 20) {
    if (game.isZarqwaWaterBlocked(x, y, 12)) {
      deepWaterSample = { x, y };
      break;
    }
  }
}
assert.ok(deepWaterSample, "the rebuilt map retains non-playable water");
assert.equal(game.isWorldPositionBlocked(deepWaterSample.x, deepWaterSample.y, 12), true, "water blocks traversal");
assert.equal(game.isWorldPositionBlocked(1600, 0, 12), true, "map boundary blocks traversal");
assert.equal(game.isWorldPositionBlocked(game.player.x, game.player.y, game.player.radius), false, "selected player spawn is traversable");
const mainBridge = sandbox.ZARQWA_CONFIG.bridgeAreas.find((bridge) => bridge.id === sandbox.ZARQWA_CONFIG.scale.mainBridgeId);
assert.ok(mainBridge, "the authoritative hydroelectric bridge exists");
assert.ok(Math.abs(mainBridge.length / sandbox.ZARQWA_CONFIG.scale.worldUnitsPerMeter - 94) < 0.001, "main bridge establishes the 94 meter world scale");
const bridgePathVisualizations = [];
for (const bridge of sandbox.ZARQWA_CONFIG.bridgeAreas) {
  const deltaX = bridge.end.x - bridge.start.x;
  const deltaY = bridge.end.y - bridge.start.y;
  const length = Math.hypot(deltaX, deltaY);
  const directionX = deltaX / length;
  const directionY = deltaY / length;
  const normalX = -directionY;
  const normalY = directionX;
  const inset = 30;
  const start = { x: bridge.start.x + directionX * inset, y: bridge.start.y + directionY * inset };
  const end = { x: bridge.end.x - directionX * inset, y: bridge.end.y - directionY * inset };
  const midpoint = { x: (bridge.start.x + bridge.end.x) / 2, y: (bridge.start.y + bridge.end.y) / 2 };
  assert.equal(game.isWorldPositionBlocked(start.x, start.y, 10), false, `${bridge.id} has a traversable entrance`);
  assert.equal(game.isWorldPositionBlocked(end.x, end.y, 10), false, `${bridge.id} has a traversable exit`);
  const testPlayer = { x: start.x, y: start.y };
  game.moveEntityWithCollisions(testPlayer, end.x - start.x, end.y - start.y, 10);
  assert.ok(Math.hypot(testPlayer.x - end.x, testPlayer.y - end.y) < 8, `${bridge.id} can be crossed with player collision movement`);
  const zombiePath = game.findZombiePath(start.x, start.y, end.x, end.y, 10);
  assert.ok(zombiePath?.length, `${bridge.id} can be crossed by the existing A*`);
  assert.ok(zombiePath.some((waypoint) => Math.hypot(waypoint.x - midpoint.x, waypoint.y - midpoint.y) < bridge.width), `${bridge.id} A* path uses the bridge deck`);
  bridgePathVisualizations.push({ start, zombiePath });
  const flankingWater = [-1, 1].map((side) => ({
    x: midpoint.x + normalX * (bridge.width / 2 + 30) * side,
    y: midpoint.y + normalY * (bridge.width / 2 + 30) * side,
  })).filter((sample) => game.isZarqwaWaterBlocked(sample.x, sample.y, 10));
  assert.ok(flankingWater.length > 0, `${bridge.id} crosses blocked water rather than decorative terrain`);
  assert.ok(flankingWater.every((sample) => game.isWorldPositionBlocked(sample.x, sample.y, 10)), `${bridge.id} does not make surrounding water traversable`);
}
bridgePathVisualizations.forEach((entry, index) => {
  Object.assign(game.zombies[index], { x: entry.start.x, y: entry.start.y, path: entry.zombiePath, pathIndex: 0 });
});
game.handleDebugAction("togglePaths", clock);
assert.equal(game.controller.debugPaths, true, "debug path visualization enables for rebuilt bridge routes");
game.draw();
game.handleDebugAction("togglePaths", clock);
const mapRoundTrip = game.tacToWorld(game.worldToTac({ x: 431, y: -782 }));
assert.ok(Math.abs(mapRoundTrip.x - 431) < 0.001 && Math.abs(mapRoundTrip.y + 782) < 0.001, "Tac-Map transform round-trips world coordinates");
game.openTacMap();
game.drawTacMap();
game.closeTacMap();
elements.get("debugRegionInput").value = "10";
game.handleDebugAction("setRegion", clock);
assert.equal(game.controller.region, 10, "developer mode can set an arbitrary Endless region");
assert.equal(game.controller.effectiveRound, 70, "developer region changes recalculate effective RBZ round");
game.handleDebugAction("setRegion1", clock);
const outbreakKillPoints = game.points;
game.registerZombieKill(clock, { category: "ambient", groupId: null });
assert.equal(game.points, outbreakKillPoints + 35, "Outbreak normal kills award 35 points");
assert.match(elements.get("scoreFeed").innerHTML, /\+35 Zombie Elimination/, "normal elimination points appear beside the crosshair");
let previousDeployment = game.controller.previousSpawnId;
for (let generation = 0; generation < 20; generation++) {
  clock += 10;
  game.controller.generateRegion(clock, true);
  assert.notEqual(game.controller.previousSpawnId, previousDeployment, "deployment does not repeat on consecutive regions");
  previousDeployment = game.controller.previousSpawnId;
  assert.equal(game.controller.ambientCount(), 30, "every region reaches the ambient target");
  assert.ok(game.controller.ambientCount() <= 50, "ambient population never exceeds its hard cap");
  assert.ok(
    game.zombies.filter((zombie) => zombie.category === "ambient").every((zombie) => Math.hypot(zombie.x - game.player.x, zombie.y - game.player.y) >= 360),
    "ambient enemies respect the safe spawn radius",
  );
  assert.ok(Math.hypot(game.controller.objective.location.x - game.player.x, game.controller.objective.location.y - game.player.y) >= 260);
  assert.equal(new Set(game.controller.ammoCaches.map((cache) => cache.id)).size, game.controller.ammoCaches.length);
}
const firstGroupId = game.zombies.find((zombie) => zombie.category === "ambient").groupId;
const clearedGroup = game.zombies.filter((zombie) => zombie.groupId === firstGroupId);
for (const zombie of clearedGroup) game.zombies.splice(game.zombies.indexOf(zombie), 1);
clearedGroup.forEach((zombie) => game.controller.onZombieKilled(zombie, clock));
assert.equal(game.controller.pendingAmbientSpawns.length, 1, "a cleared group schedules one replacement wave");
game.controller.update(clock + 5001, 0.016);
assert.ok(game.controller.ambientCount() <= 50, "replacement groups respect ambient cap");

const pointsBeforeReward = game.points;
game.clearPlayedAudioSources();
assert.equal(game.controller.completeObjective(6000, true), true);
assert.equal(game.controller.completeObjective(6001), false, "objective cannot complete twice");
assert.equal(game.points, pointsBeforeReward + 2000, "Region 1 objective reward is exactly once");
assert.ok(game.controller.anomaly, "anomaly activates after objective completion");
assert.ok(
  game.playedAudioSources.some((source) => /src\/music\/saba_contract_complete_[123]\.wav$/.test(source)),
  "objective completion plays one of the three Saba contract stingers",
);
assert.equal(elements.get("objectiveCompleteBanner").hidden, false, "objective completion reveals the animated banner");
assert.equal(elements.get("objectiveCompleteBanner").classList.contains("active"), true, "objective banner animation is active");
assert.match(elements.get("scoreFeed").innerHTML, /\+2,000 Main Objective Complete/, "objective rewards join the stacked point feed");

game.controller.forcedObjectiveType = "hvt";
game.controller.resetObjective(7000);
assert.equal(game.controller.objective.type, "hvt");
assert.equal(elements.get("objectiveName").textContent, "MAIN OBJECTIVE AVAILABLE", "rerolled contracts remain concealed before activation");
game.controller.startObjective(7001);
assert.equal(elements.get("objectiveName").textContent, "ELIMINATE THE MANGLER", "active contracts reveal the required task");
const mangler = game.zombies.find((zombie) => zombie.mangler);
assert.ok(mangler && mangler.hp === 928 * 60, "Region 1 HVT Mangler takes exactly 60 base-weapon bullets");
for (const weaponKey of ["aug", "mtz556", "bp50"]) {
  game.selectWeapon(weaponKey);
  assert.equal(mangler.hp / game.weapon.baseDamage, 60, `${game.weapon.name} needs 60 un-Packed body shots for a Region 1 HVT`);
}
game.selectWeapon("aug");
assert.equal(mangler.manglerVariant, "hvt", "HVT Manglers retain a distinct boss identity");
assert.ok(game.getHvtManglerHealth(2) > game.getHvtManglerHealth(1), "HVT health follows effective-round progression");
const nonHvtMangler = game.createZombieAt(mangler.x + 60, mangler.y, 7001, {
  category: "ambient", mangler: true, manglerVariant: "wild", hp: 3500,
});
game.zombies.splice(game.zombies.indexOf(nonHvtMangler), 1);
const specialKillPoints = game.points;
game.registerZombieKill(7002, nonHvtMangler);
assert.equal(game.points, specialKillPoints + 100, "wild Manglers award the special-enemy bonus");
assert.match(elements.get("scoreFeed").innerHTML, /\+100 Special Zombie Elimination/, "special eliminations use a distinct stacked notification");
assert.equal(game.controller.objective.state, "active", "a wild Mangler never completes the HVT contract");
game.zombies.splice(game.zombies.indexOf(mangler), 1);
game.registerZombieKill(7003, mangler);
assert.equal(game.controller.objective.state, "complete");
assert.ok((elements.get("scoreFeed").innerHTML.match(/scoreFeedEntry/g) || []).length >= 3, "rapid rewards stack instead of replacing one another");
game.updateScoreFeed(8254);
assert.equal(elements.get("scoreFeed").innerHTML, "", "point notifications clear after their short fade");
game.updateObjectiveCompletePresentation(10404);
assert.equal(elements.get("objectiveCompleteBanner").hidden, true, "the completion banner clears after its animation");

game.controller.forcedObjectiveType = "cargo";
game.controller.resetObjective(8000);
game.controller.startObjective(8001);
const cargo = game.controller.objective;
cargo.truck.x = cargo.destination.x;
cargo.truck.y = cargo.destination.y;
game.controller.updateTruck(0, 0, 0.016, 8002);
assert.equal(cargo.state, "complete", "Cargo completes at its authored destination");

game.controller.forcedObjectiveType = "frenzy";
game.controller.resetObjective(9000);
game.controller.startObjective(9001);
const firstFrenzyZombie = game.zombies.find((zombie) => zombie.objectiveTag === "frenzy");
game.zombies.splice(game.zombies.indexOf(firstFrenzyZombie), 1);
game.controller.onZombieKilled(firstFrenzyZombie, 9002);
assert.equal(game.zombies.filter((zombie) => zombie.objectiveTag === "frenzy").length, 9, "Frenzy does not refill immediately after a kill");
game.controller.update(11500, 0.016);
assert.equal(game.zombies.filter((zombie) => zombie.objectiveTag === "frenzy").length, 9, "Frenzy waits the full 2.5-second check interval");
game.controller.update(11501, 0.016);
assert.equal(game.zombies.filter((zombie) => zombie.objectiveTag === "frenzy").length, 10, "Frenzy refills pressure on its 2.5-second cadence");
for (let kill = 1; kill < 100; kill++) game.controller.onZombieKilled({ objectiveTag: "frenzy", category: "objective" }, 11501 + kill);
assert.equal(game.controller.objective.kills, 100);
assert.equal(game.controller.objective.state, "complete", "Frenzy completes at exactly 100 legitimate objective kills");

game.controller.forcedObjectiveType = "dataHeist";
game.controller.resetObjective(10000);
const dataHeist = game.controller.objective;
assert.equal(dataHeist.type, "dataHeist", "Data Heist participates in the shared objective controller");
assert.equal(dataHeist.state, "available");
assert.ok(
  Math.hypot(dataHeist.hardDrive.x - dataHeist.searchCenter.x, dataHeist.hardDrive.y - dataHeist.searchCenter.y) > 50,
  "the Tac-Map search center does not reveal the exact Hard Drive position",
);
assert.ok(
  Math.hypot(dataHeist.hardDrive.x - dataHeist.searchCenter.x, dataHeist.hardDrive.y - dataHeist.searchCenter.y) < dataHeist.searchRadius,
  "the authored Hard Drive remains inside its rough search radius",
);
assert.ok(
  Math.hypot(dataHeist.uploadStation.x - dataHeist.hardDrive.x, dataHeist.uploadStation.y - dataHeist.hardDrive.y) > 1500,
  "the Upload Station selection favors the far side of the map",
);
game.player.x = dataHeist.hardDrive.x;
game.player.y = dataHeist.hardDrive.y;
game.updateWorldInteractionPrompt();
assert.match(elements.get("interactPrompt").innerHTML, /PRESS .*F.* TO TAKE HARD DRIVE/, "Hard Drive uses the requested pickup prompt");
game.interactWithWorld(10001);
assert.equal(dataHeist.phase, "carrying");
assert.equal(dataHeist.hardDriveCollected, true);
game.player.x = dataHeist.uploadStation.x + 86;
game.player.y = dataHeist.uploadStation.y;
game.updateWorldInteractionPrompt();
assert.match(elements.get("interactPrompt").innerHTML, /PRESS .*F.* TO BEGIN DATA TRANSFER/, "Upload Station uses the requested transfer prompt");
const dataHeistRewardStart = game.points;
const uploadStartedAt = 11000;
game.interactWithWorld(uploadStartedAt);
assert.equal(dataHeist.phase, "uploading");
assert.equal(dataHeist.uploadEndsAt - dataHeist.uploadStartedAt, 180000, "Data Heist defense lasts three minutes");
assert.equal(game.controller.completeObjective(uploadStartedAt + 1000), false, "Data Heist cannot be completed before its timer");
const dataSpawnDistances = [];
const dataSpawnHealths = [];
const dataSpawnBlocked = [];
const seenDataZombies = new Set();
let retainedDataZombie = null;
for (let elapsed = 0; elapsed < 180000; elapsed += 1000) {
  clock = uploadStartedAt + elapsed;
  game.controller.updateDataHeist(clock);
  const victims = game.zombies.filter((zombie) => zombie.objectiveTag === "dataHeist");
  for (const zombie of victims) {
    if (!seenDataZombies.has(zombie)) {
      seenDataZombies.add(zombie);
      dataSpawnDistances.push(Math.hypot(zombie.x - game.player.x, zombie.y - game.player.y));
      dataSpawnHealths.push(zombie.maxHp);
      dataSpawnBlocked.push(game.isWorldPositionBlocked(zombie.x, zombie.y, zombie.radius));
    }
    if (!retainedDataZombie && dataHeist.waveSpawned[2] > 0) retainedDataZombie = zombie;
    if (zombie === retainedDataZombie) continue;
    game.zombies.splice(game.zombies.indexOf(zombie), 1);
    game.controller.onZombieKilled(zombie, clock);
  }
  if (elapsed === 75000) {
    game.controller.updateHud(clock);
    assert.match(elements.get("objectiveProgress").textContent, /WAVE 2 \/ 3/, "upload HUD identifies the active sub-wave");
    assert.match(elements.get("objectiveTransferFill").style.width, /^4[01]%$/, "upload HUD exposes timed percentage progress");
  }
}
assert.equal(dataHeist.state, "active", "Data Heist cannot finish before the full transfer duration");
clock = uploadStartedAt + 180000;
game.controller.updateDataHeist(clock);
assert.deepEqual(Array.from(dataHeist.waveSpawned), [25, 25, 25], "Data Heist spawns three sub-waves of exactly 25");
assert.equal(dataHeist.kills, 74, "one surviving objective enemy remains after the timer");
assert.ok(dataSpawnDistances.every((distance) => distance >= 320), "objective zombies never spawn directly beside the player");
assert.ok(dataSpawnHealths.every((health) => health === game.getZombieHealth(7)), "objective zombies use current Region difficulty");
assert.ok(dataSpawnBlocked.every((blocked) => blocked === false), "objective zombies spawn only at valid exterior positions");
assert.equal(dataHeist.state, "active", "a finished timer waits for remaining objective enemies");
game.zombies.splice(game.zombies.indexOf(retainedDataZombie), 1);
game.controller.onZombieKilled(retainedDataZombie, clock + 1);
assert.equal(dataHeist.kills, 75, "all 75 defense enemies are accounted for");
assert.equal(dataHeist.state, "complete", "transfer completes only after time and enemy-clear conditions are satisfied");
assert.equal(elements.get("objectiveName").textContent, "DATA TRANSFER COMPLETE");
assert.equal(game.points, dataHeistRewardStart + 2000, "Data Heist awards the normal Region 1 objective reward");
assert.ok(game.controller.anomaly, "Data Heist activates the existing Anomaly flow");

game.controller.region = 2;
game.controller.generateRegion(192000, true);
game.zombies.length = 0;
game.controller.ambientGroups.clear();
game.controller.random = () => 0;
game.controller.spawnAmbientGroup(game.map.ambientNodes[0], 5, 192001);
assert.equal(game.controller.wildManglerCount(), 0, "wild Manglers cannot appear before Region 3");
game.controller.region = 3;
game.controller.generateRegion(193000, true);
game.zombies.length = 0;
game.controller.ambientGroups.clear();
game.controller.random = () => 0;
game.controller.spawnAmbientGroup(game.map.ambientNodes[0], 5, 193001);
const wildMangler = game.zombies.find((zombie) => zombie.manglerVariant === "wild");
assert.ok(wildMangler, "Region 3 ambient groups can naturally roll a wild Mangler");
assert.equal(wildMangler.hp, 3500, "Region 3 wild Manglers start at 3,500 HP");
assert.ok(game.getWildManglerHealth(4) > game.getWildManglerHealth(3), "wild Mangler health follows effective-round progression");
assert.ok(game.controller.wildManglerCount() <= 2, "wild Manglers remain capped as rare ambient specials");

game.selectGameMode("outbreak3Region");
game.activateOutbreakMap("zarqwa-hydroelectric");
game.state = "playing";
game.resetGame(10000);
game.weapon.applyPackTier();
game.weapon.magazine = 47;
game.machines[0].purchased = true;
const persistedPoints = game.points;
let previousWarpMapId = game.map.id;
let previousWarpObjective = game.controller.objective;
for (let expectedRegion = 1; expectedRegion <= 2; expectedRegion++) {
  assert.equal(game.controller.region, expectedRegion);
  game.controller.completeObjective(11000 + expectedRegion * 1000, true);
  game.controller.enterSafeZone();
  game.controller.startWarp(12000 + expectedRegion * 1000);
  game.controller.finishWarp(23000 + expectedRegion * 1000);
  assert.notEqual(game.map.id, previousWarpMapId, "each warp deploys to a different Outbreak map");
  assert.equal(game.controller.map.id, game.map.id, "the shared controller adopts the newly selected map");
  assert.notEqual(game.controller.objective, previousWarpObjective, "the new map receives a newly generated contract");
  previousWarpMapId = game.map.id;
  previousWarpObjective = game.controller.objective;
  assert.equal(game.weapon.papTier, 1, "Pack-a-Punch tier persists across warps");
  assert.equal(game.weapon.magazine, 47, "ammunition persists across warps");
  assert.equal(game.machines[0].purchased, true, "purchased perks persist across warps");
  assert.ok(game.points >= persistedPoints, "points persist across warps");
}
assert.equal(game.controller.region, 3);
game.controller.completeObjective(30000, true);
game.controller.enterSafeZone();
game.controller.startWarp(30001);
assert.equal(game.controller.region, 3, "three-region playlist never creates Region 4");
assert.equal(game.state, "gameover", "Region 3 Beacon completes the run");
assert.equal(game.controller.objective, null, "completed/dead Outbreak runs clean objective state");
assert.equal(game.zombies.length, 0, "completed/dead Outbreak runs clean hostile state");

game.selectGameMode("outbreakEndless");
game.activateOutbreakMap("rohan-oil");
game.state = "playing";
game.resetGame(35000);
assert.equal(game.map.id, "rohan-oil", "Rohan Oil is selectable as a full Outbreak map");
assert.equal(game.controller.map.id, "rohan-oil", "Rohan uses the shared Outbreak controller");
assert.equal(elements.get("tacMapTitle").textContent, "ROHAN OIL // TAC-MAP", "Tac-Map title follows the selected map");
assert.equal(game.validateAuthoredZarqwaPositions(sandbox.ROHAN_CONFIG), true, "authored Rohan Oil positions validate");
assert.equal(sandbox.ROHAN_CONFIG.pipeWalkways.length, 6, "Rohan has authored copper traversal routes");
assert.equal(
  sandbox.ROHAN_CONFIG.collisionAreas.filter((area) => area.kind === "refinery").length,
  12,
  "Rohan includes twelve large circular oil refineries",
);
for (const refinery of sandbox.ROHAN_CONFIG.collisionAreas.filter((area) => area.kind === "refinery")) {
  assert.equal(game.isWorldPositionBlocked(refinery.x, refinery.y, 12), true, `${refinery.id} blocks its tank footprint`);
}
for (const pipe of sandbox.ROHAN_CONFIG.pipeWalkways) {
  for (const [x, y] of pipe.points) {
    assert.equal(game.isWorldPositionBlocked(x, y, 10), false, `${pipe.id} is a walkable copper route`);
  }
  const [startX, startY] = pipe.points[0];
  const [endX, endY] = pipe.points.at(-1);
  assert.ok(game.findZombiePath(startX, startY, endX, endY, 10)?.length, `${pipe.id} supports the existing zombie A*`);
}
const rohanTacSample = game.worldToTac({ x: 705, y: 400 });
const rohanWorldSample = game.tacToWorld(rohanTacSample);
assert.ok(Math.hypot(rohanWorldSample.x - 705, rohanWorldSample.y - 400) < 0.001, "Rohan world/Tac-Map transform round-trips");
assert.equal(game.controller.ambientCount(), 30, "Rohan reaches the standard Outbreak ambient population");
assert.equal(elements.get("objectiveName").textContent, "MAIN OBJECTIVE AVAILABLE", "Rohan also conceals contract type before activation");
game.handleDebugAction("forceDataHeist", 36000);
assert.equal(game.controller.objective.type, "dataHeist", "Data Heist is available from Rohan contract locations");
assert.match(game.controller.objective.hardDrive.id, /^rohan-data-drive-/);
assert.match(game.controller.objective.uploadStation.id, /^rohan-upload-/);
assert.ok(
  Math.hypot(
    game.controller.objective.uploadStation.x - game.controller.objective.hardDrive.x,
    game.controller.objective.uploadStation.y - game.controller.objective.hardDrive.y,
  ) > 1500,
  "Rohan also selects a distant upload destination",
);
game.handleDebugAction("spawnWildMangler", 36001);
assert.equal(game.controller.region, 1, "wild Mangler debug spawning does not mutate Region progression");
assert.ok(game.controller.wildManglerCount() >= 1, "wild Mangler debug control spawns the ambient variant independently");
assert.doesNotThrow(() => game.draw(), "Rohan world and Tac-Map render through the shared renderer");

game.selectGameMode("outbreakEndless");
game.activateOutbreakMap("said-city");
game.state = "playing";
game.resetGame(38000);
assert.equal(game.map.id, "said-city", "Sa'id City is selectable as a full Outbreak map");
assert.equal(game.controller.map.id, "said-city", "Sa'id City uses the shared Outbreak controller");
assert.equal(elements.get("tacMapTitle").textContent, "SA'ID CITY // TAC-MAP", "Sa'id Tac-Map title follows the selected map");
assert.equal(game.validateAuthoredZarqwaPositions(sandbox.SAID_CITY_CONFIG), true, "authored Sa'id City positions validate");
assert.equal(sandbox.SAID_CITY_CONFIG.ambientNodes.length, 30, "Sa'id City has a complete ambient spawn pool");
assert.equal(sandbox.SAID_CITY_CONFIG.hvtLocations.length, 4, "Sa'id City has authored HVT locations");
assert.equal(sandbox.SAID_CITY_CONFIG.frenzyLocations.length, 4, "Sa'id City has authored Frenzy locations");
assert.equal(sandbox.SAID_CITY_CONFIG.dataHeistHardDriveLocations.length, 4, "Sa'id City has authored Data Heist search locations");
assert.equal(sandbox.SAID_CITY_CONFIG.dataHeistUploadStations.length, 4, "Sa'id City has authored Upload Stations");
assert.equal(game.controller.ambientCount(), 30, "Sa'id City reaches the standard Outbreak ambient population");
assert.equal(game.controller.ammoCaches.length, 3, "Sa'id City selects three Ammo Caches per Region");
assert.equal(Object.keys(game.controller.perkSelections).length, 3, "Sa'id City selects all three perk machines");
for (const bridge of sandbox.SAID_CITY_CONFIG.bridgeAreas) {
  const deltaX = bridge.end.x - bridge.start.x;
  const deltaY = bridge.end.y - bridge.start.y;
  const length = Math.hypot(deltaX, deltaY);
  const directionX = deltaX / length;
  const directionY = deltaY / length;
  const start = { x: bridge.start.x + directionX * 28, y: bridge.start.y + directionY * 28 };
  const end = { x: bridge.end.x - directionX * 28, y: bridge.end.y - directionY * 28 };
  assert.equal(game.isWorldPositionBlocked(start.x, start.y, 10), false, `${bridge.id} has a traversable entrance`);
  assert.equal(game.isWorldPositionBlocked(end.x, end.y, 10), false, `${bridge.id} has a traversable exit`);
  const testPlayer = { x: start.x, y: start.y };
  game.moveEntityWithCollisions(testPlayer, end.x - start.x, end.y - start.y, 10);
  assert.ok(Math.hypot(testPlayer.x - end.x, testPlayer.y - end.y) < 8, `${bridge.id} supports player traversal`);
  assert.ok(game.findZombiePath(start.x, start.y, end.x, end.y, 10)?.length, `${bridge.id} supports the existing zombie A*`);
}
for (const [debugAction, expectedType] of [
  ["forceHvt", "hvt"],
  ["forceCargo", "cargo"],
  ["forceFrenzy", "frenzy"],
  ["forceDataHeist", "dataHeist"],
]) {
  game.handleDebugAction(debugAction, 38100);
  assert.equal(game.controller.objective.type, expectedType, `Sa'id City supports ${expectedType}`);
  assert.match(game.controller.objective.location.id, /^said-/, `${expectedType} selects a Sa'id-authored location`);
}
assert.ok(
  Math.hypot(
    game.controller.objective.uploadStation.x - game.controller.objective.hardDrive.x,
    game.controller.objective.uploadStation.y - game.controller.objective.hardDrive.y,
  ) > 1500,
  "Sa'id Data Heist selects a distant Upload Station",
);
const saidTacSample = game.worldToTac({ x: -350, y: 220 });
const saidWorldSample = game.tacToWorld(saidTacSample);
assert.ok(Math.hypot(saidWorldSample.x + 350, saidWorldSample.y - 220) < 0.001, "Sa'id world/Tac-Map transform round-trips");
game.openTacMap();
assert.doesNotThrow(() => game.drawTacMap(), "Sa'id Tac-Map renders through the shared renderer");
game.closeTacMap();
assert.doesNotThrow(() => game.draw(), "Sa'id City world renders through the shared renderer");

game.selectGameMode("outbreak3Region");
game.activateOutbreakMap("said-city");
game.state = "playing";
game.resetGame(39000);
assert.equal(game.controller.maxRegions, 3, "Sa'id City offers the standard 3 Region playlist");

game.selectGameMode("outbreakEndless");
game.activateOutbreakMap("hafid-port");
game.state = "playing";
game.resetGame(39500);
assert.equal(game.map.id, "hafid-port", "Hafid Port is available through the shared Outbreak playlist");
assert.equal(game.controller.map.id, "hafid-port", "Hafid Port uses the shared Outbreak controller");
assert.equal(elements.get("tacMapTitle").textContent, "HAFID PORT // TAC-MAP", "Hafid Port updates the Tac-Map title");
assert.equal(game.validateAuthoredZarqwaPositions(sandbox.HAFID_PORT_CONFIG), true, "authored Hafid Port positions validate");
assert.equal(sandbox.HAFID_PORT_CONFIG.ambientNodes.length, 30, "Hafid Port has a complete ambient spawn pool");
assert.equal(sandbox.HAFID_PORT_CONFIG.hvtLocations.length, 4, "Hafid Port has authored HVT locations");
assert.equal(sandbox.HAFID_PORT_CONFIG.frenzyLocations.length, 4, "Hafid Port has authored Frenzy locations");
assert.equal(sandbox.HAFID_PORT_CONFIG.dataHeistHardDriveLocations.length, 4, "Hafid Port has authored Data Heist locations");
assert.equal(sandbox.HAFID_PORT_CONFIG.dataHeistUploadStations.length, 4, "Hafid Port has authored Upload Stations");
assert.equal(sandbox.HAFID_PORT_CONFIG.cargoRoutes.length, 2, "Hafid Port has authored Cargo routes");
assert.equal(sandbox.HAFID_PORT_CONFIG.collisionAreas.filter((area) => area.kind === "refinery").length, 8, "Hafid Port includes its tank farm");
assert.equal(sandbox.HAFID_PORT_CONFIG.collisionAreas.filter((area) => area.kind === "container").length, 9, "Hafid Port includes its container yard");
assert.equal(game.controller.ambientCount(), 30, "Hafid Port reaches the standard ambient population");
assert.equal(game.controller.ammoCaches.length, 3, "Hafid Port selects three Ammo Caches");
assert.equal(Object.keys(game.controller.perkSelections).length, 3, "Hafid Port selects all three perk machines");
for (const bridge of sandbox.HAFID_PORT_CONFIG.bridgeAreas) {
  const deltaX = bridge.end.x - bridge.start.x;
  const deltaY = bridge.end.y - bridge.start.y;
  const length = Math.hypot(deltaX, deltaY);
  const directionX = deltaX / length;
  const directionY = deltaY / length;
  const start = { x: bridge.start.x + directionX * 28, y: bridge.start.y + directionY * 28 };
  const end = { x: bridge.end.x - directionX * 28, y: bridge.end.y - directionY * 28 };
  assert.equal(game.isWorldPositionBlocked(start.x, start.y, 10), false, `${bridge.id} has a traversable entrance`);
  assert.equal(game.isWorldPositionBlocked(end.x, end.y, 10), false, `${bridge.id} has a traversable end`);
  const testPlayer = { x: start.x, y: start.y };
  game.moveEntityWithCollisions(testPlayer, end.x - start.x, end.y - start.y, 10);
  assert.ok(Math.hypot(testPlayer.x - end.x, testPlayer.y - end.y) < 8, `${bridge.id} supports player traversal`);
  assert.ok(game.findZombiePath(start.x, start.y, end.x, end.y, 10)?.length, `${bridge.id} supports the existing zombie A*`);
}
for (const [debugAction, expectedType] of [
  ["forceHvt", "hvt"],
  ["forceCargo", "cargo"],
  ["forceFrenzy", "frenzy"],
  ["forceDataHeist", "dataHeist"],
]) {
  game.handleDebugAction(debugAction, 39600);
  assert.equal(game.controller.objective.type, expectedType, `Hafid Port supports ${expectedType}`);
  assert.match(game.controller.objective.location.id, /^hafid-/, `${expectedType} selects a Hafid-authored location`);
}
assert.ok(
  Math.hypot(
    game.controller.objective.uploadStation.x - game.controller.objective.hardDrive.x,
    game.controller.objective.uploadStation.y - game.controller.objective.hardDrive.y,
  ) > 1500,
  "Hafid Port Data Heist selects a distant Upload Station",
);
const hafidTacSample = game.worldToTac({ x: 100, y: 400 });
const hafidWorldSample = game.tacToWorld(hafidTacSample);
assert.ok(Math.hypot(hafidWorldSample.x - 100, hafidWorldSample.y - 400) < 0.001, "Hafid Port world/Tac-Map transform round-trips");
game.openTacMap();
assert.doesNotThrow(() => game.drawTacMap(), "Hafid Port Tac-Map renders through the shared renderer");
game.closeTacMap();
assert.doesNotThrow(() => game.draw(), "Hafid Port world renders through the shared renderer");

game.selectGameMode("outbreakEndless");
game.activateOutbreakMap("mawizeh-marshlands");
game.state = "playing";
game.resetGame(39700);
assert.equal(game.map.id, "mawizeh-marshlands", "Mawizeh Marshlands is available through the shared Outbreak playlist");
assert.equal(game.controller.map.id, "mawizeh-marshlands", "Mawizeh uses the shared Outbreak controller");
assert.equal(elements.get("tacMapTitle").textContent, "MAWIZEH MARSHLANDS // TAC-MAP", "Mawizeh updates the Tac-Map title");
assert.equal(game.validateAuthoredZarqwaPositions(sandbox.MAWIZEH_MARSHLANDS_CONFIG), true, "authored Mawizeh positions validate");
assert.equal(sandbox.MAWIZEH_MARSHLANDS_CONFIG.ambientNodes.length, 30, "Mawizeh has a complete ambient spawn pool");
assert.equal(sandbox.MAWIZEH_MARSHLANDS_CONFIG.hvtLocations.length, 4, "Mawizeh has authored HVT locations");
assert.equal(sandbox.MAWIZEH_MARSHLANDS_CONFIG.frenzyLocations.length, 4, "Mawizeh has authored Frenzy locations");
assert.equal(sandbox.MAWIZEH_MARSHLANDS_CONFIG.dataHeistHardDriveLocations.length, 4, "Mawizeh has authored Data Heist locations");
assert.equal(sandbox.MAWIZEH_MARSHLANDS_CONFIG.dataHeistUploadStations.length, 4, "Mawizeh has authored Upload Stations");
assert.equal(sandbox.MAWIZEH_MARSHLANDS_CONFIG.cargoRoutes.length, 2, "Mawizeh has authored Cargo routes");
assert.ok(sandbox.MAWIZEH_MARSHLANDS_CONFIG.swampAreas.length >= 6, "Mawizeh has authored swamp vegetation zones");
assert.equal(game.controller.ambientCount(), 30, "Mawizeh reaches the standard ambient population");
assert.equal(game.controller.ammoCaches.length, 3, "Mawizeh selects three Ammo Caches");
assert.equal(Object.keys(game.controller.perkSelections).length, 3, "Mawizeh selects all three perk machines");
for (const bridge of sandbox.MAWIZEH_MARSHLANDS_CONFIG.bridgeAreas) {
  const deltaX = bridge.end.x - bridge.start.x;
  const deltaY = bridge.end.y - bridge.start.y;
  const length = Math.hypot(deltaX, deltaY);
  const directionX = deltaX / length;
  const directionY = deltaY / length;
  const start = { x: bridge.start.x + directionX * 28, y: bridge.start.y + directionY * 28 };
  const end = { x: bridge.end.x - directionX * 28, y: bridge.end.y - directionY * 28 };
  assert.equal(game.isWorldPositionBlocked(start.x, start.y, 10), false, `${bridge.id} has a traversable entrance`);
  assert.equal(game.isWorldPositionBlocked(end.x, end.y, 10), false, `${bridge.id} has a traversable end`);
  const testPlayer = { x: start.x, y: start.y };
  game.moveEntityWithCollisions(testPlayer, end.x - start.x, end.y - start.y, 10);
  assert.ok(Math.hypot(testPlayer.x - end.x, testPlayer.y - end.y) < 8, `${bridge.id} supports player traversal`);
  assert.ok(game.findZombiePath(start.x, start.y, end.x, end.y, 10)?.length, `${bridge.id} supports the existing zombie A*`);
}
for (const [debugAction, expectedType] of [
  ["forceHvt", "hvt"],
  ["forceCargo", "cargo"],
  ["forceFrenzy", "frenzy"],
  ["forceDataHeist", "dataHeist"],
]) {
  game.handleDebugAction(debugAction, 39800);
  assert.equal(game.controller.objective.type, expectedType, `Mawizeh supports ${expectedType}`);
  assert.match(game.controller.objective.location.id, /^mawizeh-/, `${expectedType} selects a Mawizeh-authored location`);
}
assert.ok(
  Math.hypot(
    game.controller.objective.uploadStation.x - game.controller.objective.hardDrive.x,
    game.controller.objective.uploadStation.y - game.controller.objective.hardDrive.y,
  ) > 1500,
  "Mawizeh Data Heist selects a distant Upload Station",
);
game.player.x = -1300;
game.player.y = -250;
assert.equal(game.isPlayerInSwamp(), true, "Mawizeh swamp vegetation detects the player away from roads");
assert.equal(game.getPlayerMovementSpeed(), game.player.speed * 0.5, "Mawizeh swamp vegetation applies the 50% movement penalty");
game.player.x = -1100;
game.player.y = 0;
assert.equal(game.isPlayerInSwamp(), false, "authored roads through marshland remain full-speed surfaces");
assert.equal(game.getPlayerMovementSpeed(), game.player.speed, "road movement speed remains unchanged");
const mawizehTacSample = game.worldToTac({ x: 440, y: 730 });
const mawizehWorldSample = game.tacToWorld(mawizehTacSample);
assert.ok(Math.hypot(mawizehWorldSample.x - 440, mawizehWorldSample.y - 730) < 0.001, "Mawizeh world/Tac-Map transform round-trips");
game.openTacMap();
assert.doesNotThrow(() => game.drawTacMap(), "Mawizeh Tac-Map renders through the shared renderer");
game.closeTacMap();
assert.doesNotThrow(() => game.draw(), "Mawizeh world renders through the shared renderer");

game.selectGameMode("outbreakEndless");
game.activateOutbreakMap("al-mazrah-city");
game.state = "playing";
game.resetGame(39850);
assert.equal(game.map.id, "al-mazrah-city", "Al Mazrah City is available through the shared Outbreak playlist");
assert.equal(game.controller.map.id, "al-mazrah-city", "Al Mazrah City uses the shared Outbreak controller");
assert.equal(elements.get("tacMapTitle").textContent, "AL MAZRAH CITY // TAC-MAP", "Al Mazrah City updates the Tac-Map title");
assert.equal(game.validateAuthoredZarqwaPositions(sandbox.AL_MAZRAH_CITY_CONFIG), true, "authored Al Mazrah City positions validate");
assert.equal(sandbox.AL_MAZRAH_CITY_CONFIG.bounds.width, sandbox.ZARQWA_CONFIG.bounds.width * 2, "Al Mazrah City is twice the standard map width");
assert.equal(sandbox.AL_MAZRAH_CITY_CONFIG.bounds.height, sandbox.ZARQWA_CONFIG.bounds.height * 2, "Al Mazrah City is twice the standard map height");
assert.equal(sandbox.AL_MAZRAH_CITY_CONFIG.ambientNodes.length, 40, "Al Mazrah City has an expanded ambient spawn pool");
assert.equal(sandbox.AL_MAZRAH_CITY_CONFIG.hvtLocations.length, 6, "Al Mazrah City has authored HVT locations");
assert.equal(sandbox.AL_MAZRAH_CITY_CONFIG.frenzyLocations.length, 6, "Al Mazrah City has authored Frenzy locations");
assert.equal(sandbox.AL_MAZRAH_CITY_CONFIG.dataHeistHardDriveLocations.length, 6, "Al Mazrah City has authored Data Heist locations");
assert.equal(sandbox.AL_MAZRAH_CITY_CONFIG.dataHeistUploadStations.length, 6, "Al Mazrah City has authored Upload Stations");
assert.equal(sandbox.AL_MAZRAH_CITY_CONFIG.cargoRoutes.length, 3, "Al Mazrah City has three authored Cargo routes");
assert.equal(game.controller.ambientCount(), 30, "Al Mazrah City reaches the standard active ambient population");
assert.equal(game.controller.ammoCaches.length, 3, "Al Mazrah City selects three Ammo Caches");
assert.equal(Object.keys(game.controller.perkSelections).length, 3, "Al Mazrah City selects all three perk machines");
for (const bridge of sandbox.AL_MAZRAH_CITY_CONFIG.bridgeAreas) {
  const deltaX = bridge.end.x - bridge.start.x;
  const deltaY = bridge.end.y - bridge.start.y;
  const length = Math.hypot(deltaX, deltaY);
  const directionX = deltaX / length;
  const directionY = deltaY / length;
  const start = { x: bridge.start.x + directionX * 32, y: bridge.start.y + directionY * 32 };
  const end = { x: bridge.end.x - directionX * 32, y: bridge.end.y - directionY * 32 };
  assert.equal(game.isWorldPositionBlocked(start.x, start.y, 10), false, `${bridge.id} has a traversable entrance`);
  assert.equal(game.isWorldPositionBlocked(end.x, end.y, 10), false, `${bridge.id} has a traversable end`);
  const testPlayer = { x: start.x, y: start.y };
  game.moveEntityWithCollisions(testPlayer, end.x - start.x, end.y - start.y, 10);
  assert.ok(Math.hypot(testPlayer.x - end.x, testPlayer.y - end.y) < 8, `${bridge.id} supports player traversal`);
  assert.ok(game.findZombiePath(start.x, start.y, end.x, end.y, 10)?.length, `${bridge.id} supports the existing zombie A*`);
}
for (const [debugAction, expectedType] of [
  ["forceHvt", "hvt"],
  ["forceCargo", "cargo"],
  ["forceFrenzy", "frenzy"],
  ["forceDataHeist", "dataHeist"],
]) {
  game.handleDebugAction(debugAction, 39875);
  assert.equal(game.controller.objective.type, expectedType, `Al Mazrah City supports ${expectedType}`);
  assert.match(game.controller.objective.location.id, /^almazrah-/, `${expectedType} selects an Al Mazrah-authored location`);
}
assert.ok(
  Math.hypot(
    game.controller.objective.uploadStation.x - game.controller.objective.hardDrive.x,
    game.controller.objective.uploadStation.y - game.controller.objective.hardDrive.y,
  ) > 3000,
  "Al Mazrah Data Heist uses the larger map for a distant Upload Station",
);
const alMazrahTacSample = game.worldToTac({ x: 690, y: 1370 });
const alMazrahWorldSample = game.tacToWorld(alMazrahTacSample);
assert.ok(Math.hypot(alMazrahWorldSample.x - 690, alMazrahWorldSample.y - 1370) < 0.001, "Al Mazrah world/Tac-Map transform round-trips");
game.openTacMap();
assert.doesNotThrow(() => game.drawTacMap(), "Al Mazrah Tac-Map renders through the shared renderer");
game.closeTacMap();
assert.doesNotThrow(() => game.draw(), "Al Mazrah City world renders through the shared renderer");

assert.match(html, /data-mode="ashikaExtraction"/, "the menu exposes the fixed Ashika extraction playlist");
assert.match(html, /OUTBREAK - ASHIKA ISLAND: EXTRACTION/, "the Ashika playlist is clearly named");
assert.equal(sandbox.validateAshikaConfig(sandbox.ASHIKA_CONFIG), true, "the dedicated Ashika authoring contract validates");
assert.equal(game.validateAuthoredZarqwaPositions(sandbox.ASHIKA_CONFIG), true, "Ashika positions and routes pass shared physical validation");
assert.equal(sandbox.ASHIKA_CONFIG.bounds.width, 6000, "Ashika is 6,000 world units wide");
assert.equal(sandbox.ASHIKA_CONFIG.bounds.height, 6000, "Ashika is 6,000 world units tall");
assert.deepEqual(
  Array.from(sandbox.ASHIKA_CONFIG.poiLabels, (poi) => poi.label),
  ["OGANIKKU FARMS", "TOWN CENTER", "BEACH CLUB", "TSUKI CASTLE", "RESIDENTIAL", "SHIPWRECK", "PORT ASHIKA"],
  "all seven named Ashika POIs are authored",
);
assert.equal(sandbox.ASHIKA_CONFIG.ambientNodes.length, 56, "Ashika has eight ambient encounter nodes in every POI");
assert.equal(sandbox.ASHIKA_CONFIG.hvtLocations.length, 14, "Ashika has two HVT sites in every POI");
assert.equal(sandbox.ASHIKA_CONFIG.frenzyLocations.length, 14, "Ashika has two Frenzy sites in every POI");
assert.equal(sandbox.ASHIKA_CONFIG.dataHeistHardDriveLocations.length, 14, "Ashika has two Data Heist search sites in every POI");
assert.equal(sandbox.ASHIKA_CONFIG.dataHeistUploadStations.length, 14, "Ashika has two Upload Stations in every POI");
assert.equal(sandbox.ASHIKA_CONFIG.ammoCacheCandidates.length, 14, "Ashika has two Ammo Cache candidates in every POI");
assert.equal(sandbox.ASHIKA_CONFIG.playerSpawns.length, 8, "Ashika has deployments distributed around the island");
assert.equal(sandbox.ASHIKA_CONFIG.truckStarts.length, 7, "Ashika has a Cargo start in every POI");
assert.equal(sandbox.ASHIKA_CONFIG.truckDestinations.length, 7, "Ashika has a Cargo destination in every POI");
assert.equal(sandbox.ASHIKA_CONFIG.cargoRoutes.length, 7, "Ashika has seven authored cross-POI Cargo routes");
assert.equal(sandbox.ASHIKA_CONFIG.exfilLocations.length, 7, "Ashika has one exfil site in every POI");
assert.equal(sandbox.ASHIKA_CONFIG.finalExfilLocations.length, 3, "Ashika has exactly three authored radiation exfils");
assert.equal(sandbox.ASHIKA_CONFIG.packAPunchCandidates.length, 7, "Ashika has one outdoor Pack-a-Punch candidate in every POI");
for (const [category, locations] of Object.entries({
  ambient: sandbox.ASHIKA_CONFIG.ambientNodes,
  hvt: sandbox.ASHIKA_CONFIG.hvtLocations,
  frenzy: sandbox.ASHIKA_CONFIG.frenzyLocations,
  hardDrive: sandbox.ASHIKA_CONFIG.dataHeistHardDriveLocations,
  upload: sandbox.ASHIKA_CONFIG.dataHeistUploadStations,
  ammo: sandbox.ASHIKA_CONFIG.ammoCacheCandidates,
  cargoStart: sandbox.ASHIKA_CONFIG.truckStarts,
  cargoDestination: sandbox.ASHIKA_CONFIG.truckDestinations,
  exfil: sandbox.ASHIKA_CONFIG.exfilLocations,
})) {
  const coveredPois = new Set(locations.map((location) => location.poi));
  for (const poi of sandbox.ASHIKA_CONFIG.poiLabels) {
    assert.ok(coveredPois.has(poi.poi), `${category} locations cover ${poi.label}`);
  }
}
for (const [perk, locations] of Object.entries(sandbox.ASHIKA_CONFIG.blessingCandidates)) {
  assert.equal(new Set(locations.map((location) => location.poi)).size, 7, `${perk} has a candidate in all seven POIs`);
}

game.state = "menu";
game.selectGameMode("ashikaExtraction");
const ashikaLoadingStartedAt = clock;
game.startLoading(0.99);
assert.equal(game.map.id, "ashika-island", "Ashika loading stays fixed instead of entering the Al Mazrah random map pool");
assert.equal(game.controller.map.id, "ashika-island", "Ashika uses the shared Outbreak controller");
assert.equal(game.controller.region, 1, "Ashika is a single extraction operation");
assert.equal(game.controller.ambientCount(), 30, "Ashika populates the standard active ambient population from its authored pool");
clock = ashikaLoadingStartedAt + 5001;
game.updateLoading(clock);
assert.equal(game.state, "playing", "Ashika enters the extraction operation after loading");
assert.equal(game.controller.contracts.length, 3, "three contracts are available at infil");
assert.equal(game.controller.objective, null, "Ashika does not force a single Outbreak objective at infil");
assert.equal(game.controller.activeExfils.length, 2, "two blue exfils are selected on every infil");
assert.equal(new Set(game.controller.activeExfils.map((site) => site.id)).size, 2, "infil exfils never duplicate");
assert.ok(game.controller.activeExfils.every((site) => sandbox.ASHIKA_CONFIG.exfilLocations.includes(site)), "both infil exfils use permanent authored sites");
assert.equal(game.controller.operationEndsAt - clock, 18 * 60 * 1000, "the initial operation clock is exactly 18 minutes");
assert.equal(elements.get("extractionTimer").textContent, "18:00", "the minimap starts with an 18:00 clock");
assert.equal(elements.get("miniMapHud").hidden, false, "the square minimap is visible during Ashika extraction");
assert.equal(elements.get("roundUi").hidden, true, "the Outbreak Region counter is removed from the top right");
assert.ok(game.controller.fieldPackAPunch, "one outdoor Pack-a-Punch is selected at infil");
assert.ok(sandbox.ASHIKA_CONFIG.packAPunchCandidates.includes(game.controller.fieldPackAPunch), "the Pack-a-Punch uses an authored valid site");
assert.doesNotThrow(() => game.drawMiniMap(), "the live Ashika minimap renders contracts, exfils, and the player");

let debugNow = clock + 10;
for (const [debugAction, expectedType] of [
  ["forceHvt", "hvt"], ["forceCargo", "cargo"], ["forceFrenzy", "frenzy"], ["forceDataHeist", "dataHeist"],
]) {
  game.handleDebugAction(debugAction, debugNow++);
  assert.equal(game.controller.objective.type, expectedType, `Ashika supports the shared ${expectedType} contract`);
  assert.match(game.controller.objective.location.id, /^ashika-/, `${expectedType} uses an Ashika-authored location`);
}

game.handleDebugAction("forceHvt", debugNow++);
game.controller.startObjective(debugNow++);
const ashikaHvt = game.zombies.find((zombie) => zombie.manglerVariant === "hvt");
assert.equal(ashikaHvt?.hp, game.weapon.baseDamage * 60, "Ashika HVT Manglers take 60 bullets from an un-Packed base weapon");
game.handleDebugAction("forceDataHeist", debugNow++);
const contractsBeforePayment = game.controller.contracts.length;
assert.equal(game.controller.completeObjective(debugNow++, true), true, "an Ashika contract completes through the generic controller");
assert.equal(game.controller.contracts.length, contractsBeforePayment - 1, "completed contracts leave a vacancy until the population check");
assert.equal(game.controller.anomaly, null, "Ashika contract completion does not activate the Outbreak Anomaly flow");
assert.equal(elements.get("objectiveCompleteSubtext").textContent, "CONTRACT PAYMENT RECEIVED", "the completion presentation confirms the contract payout");

const contractCheckAt = game.controller.nextContractCheckAt;
game.controller.update(contractCheckAt, 0);
clock = contractCheckAt;
assert.equal(game.controller.contracts.length, 3, "the 90-second contract check replenishes one missing contract");
assert.equal(elements.get("extractionContractCount").textContent, "3 CONTRACTS AVAILABLE", "the minimap reports the current contract population");

game.player.x = game.controller.fieldPackAPunch.x;
game.player.y = game.controller.fieldPackAPunch.y;
assert.equal(game.getNearbyInteraction()?.id, "ashika-pack", "the single outdoor Pack-a-Punch is interactable");
game.points = 10000;
game.interactWithWorld(clock + 1);
assert.equal(game.weapon.papTier, 1, "Ashika's outdoor Pack-a-Punch uses the normal weapon upgrade flow");

const calledBlueExfil = game.controller.activeExfils[0];
game.player.x = calledBlueExfil.x;
game.player.y = calledBlueExfil.y;
assert.equal(game.getNearbyInteraction()?.id, "ashika-exfil", "a selected blue extraction point is interactable");
game.interactWithWorld(clock + 2);
assert.equal(game.controller.exfilEndsAt, clock + 2 + 10000, "calling a blue exfil starts the ten-second extraction countdown");

const operationEndsAt = game.controller.operationEndsAt;
clock = operationEndsAt;
game.controller.update(operationEndsAt, 0);
assert.equal(game.controller.extractionPhase, "radiation", "the operation switches to radiation after 18 minutes");
assert.equal(game.controller.activeExfils.length, 0, "the two blue exfils are disabled when radiation begins");
assert.equal(game.controller.exfilEndsAt, 0, "a pending blue exfil is cancelled by radiation closure");
assert.ok(sandbox.ASHIKA_CONFIG.finalExfilLocations.includes(game.controller.finalExfil), "one of three authored red final exfils activates");
assert.equal(game.controller.getActiveExtractionSites().length, 1, "only the selected final exfil remains active");
assert.equal(elements.get("extractionTimer").textContent, "03:00", "radiation replaces the operation clock with a three-minute timer");
assert.equal(elements.get("extractionWarning").hidden, false, "the radiation evacuation warning appears");
assert.match(html, /RADIATION DETECTED! EVACUATE THE ISLAND IMMEDIATELY!/, "the warning clearly orders an immediate evacuation");

game.player.x = game.controller.finalExfil.x;
game.player.y = game.controller.finalExfil.y;
assert.equal(game.getNearbyInteraction()?.id, "ashika-exfil", "the red final exfil becomes interactable");
game.interactWithWorld(clock + 1);
const finalExfilEndsAt = game.controller.exfilEndsAt;
game.controller.update(finalExfilEndsAt, 0);
assert.equal(game.state, "gameover", "surviving the countdown completes the extraction run");
assert.equal(elements.get("gameOverTitle").textContent, "EXFIL SUCCESSFUL", "Ashika ends with an extraction-specific success state");

const cargoRouteFailures = [];
for (const mapConfig of [
  sandbox.ZARQWA_CONFIG,
  sandbox.ROHAN_CONFIG,
  sandbox.SAID_CITY_CONFIG,
  sandbox.HAFID_PORT_CONFIG,
  sandbox.MAWIZEH_MARSHLANDS_CONFIG,
  sandbox.AL_MAZRAH_CITY_CONFIG,
  sandbox.ASHIKA_CONFIG,
]) {
  game.selectGameMode("outbreakEndless");
  game.activateOutbreakMap(mapConfig.id);
  game.state = "playing";
  game.resetGame(39900);
  game.machines.forEach((machine, index) => {
    machine.x = 100000 + index * 200;
    machine.y = 100000;
  });
  game.controller.ammoCaches = [];
  game.rebuildWorldCollisionRectangles();
  for (const route of mapConfig.cargoRoutes) {
    for (const waypoints of [route.waypoints, [...route.waypoints].reverse()]) {
      const truck = { x: waypoints[0][0], y: waypoints[0][1] };
      for (let waypointIndex = 1; waypointIndex < waypoints.length; waypointIndex++) {
        const destination = { x: waypoints[waypointIndex][0], y: waypoints[waypointIndex][1] };
        game.moveEntityWithCollisions(
          truck,
          destination.x - truck.x,
          destination.y - truck.y,
          24,
        );
        const remainingDistance = Math.hypot(truck.x - destination.x, truck.y - destination.y);
        if (remainingDistance < 8) continue;
        cargoRouteFailures.push(
          `${mapConfig.displayName}/${route.id}/${waypoints === route.waypoints ? "forward" : "reverse"}/${waypointIndex - 1}->${waypointIndex}: ${remainingDistance.toFixed(1)}`,
        );
        break;
      }
    }
  }
}
assert.deepEqual(cargoRouteFailures, [], "every Cargo route is traversable by the full-size truck in both directions");

const generatedCargoFailures = [];
for (const mapConfig of [
  sandbox.ZARQWA_CONFIG,
  sandbox.ROHAN_CONFIG,
  sandbox.SAID_CITY_CONFIG,
  sandbox.HAFID_PORT_CONFIG,
  sandbox.MAWIZEH_MARSHLANDS_CONFIG,
  sandbox.AL_MAZRAH_CITY_CONFIG,
  sandbox.ASHIKA_CONFIG,
]) {
  game.selectGameMode("outbreakEndless");
  game.activateOutbreakMap(mapConfig.id);
  game.state = "playing";
  game.resetGame(40000);
  for (let generation = 0; generation < 4; generation++) {
    game.controller.forcedObjectiveType = "cargo";
    game.controller.generateRegion(40100 + generation * 100, true);
    const route = game.controller.objective.route;
    for (const waypoints of [route.waypoints, [...route.waypoints].reverse()]) {
      const truck = { x: waypoints[0][0], y: waypoints[0][1] };
      for (let waypointIndex = 1; waypointIndex < waypoints.length; waypointIndex++) {
        const destination = { x: waypoints[waypointIndex][0], y: waypoints[waypointIndex][1] };
        game.moveEntityWithCollisions(truck, destination.x - truck.x, destination.y - truck.y, 24);
        const remainingDistance = Math.hypot(truck.x - destination.x, truck.y - destination.y);
        if (remainingDistance < 8) continue;
        generatedCargoFailures.push(
          `${mapConfig.displayName}/generation-${generation}/${route.id}/${waypoints === route.waypoints ? "forward" : "reverse"}/${waypointIndex - 1}->${waypointIndex}: ${remainingDistance.toFixed(1)}`,
        );
        break;
      }
    }
  }
}
assert.deepEqual(generatedCargoFailures, [], "generated Cargo Regions keep perks and Ammo Caches clear of the active truck route");

game.selectGameMode("endless");
game.state = "playing";
game.resetGame(40000);
assert.equal(game.round, 1, "regular RBZ still begins on Round 1");
assert.equal(game.zombiesLeft, 6, "regular RBZ Round 1 still has six zombies");
assert.equal(game.getZombieDamage(1, "rbz"), 50, "regular RBZ damage is unchanged");
assert.equal(game.getZombieHealth(55), 50000, "zombie health cap is preserved");
const rbzPoints = game.points;
game.registerZombieKill(40001, { category: "round" });
assert.equal(game.points, rbzPoints + 90, "regular RBZ kill reward remains 90");

game.state = "menu";
assert.equal(game.selectWeapon("mtz556"), true);
game.state = "playing";
game.resetGame(40500);
assert.equal(game.weapon.name, "MTZ-556");
assert.equal(game.weapon.fireMode, "automatic", "MTZ-556 uses full-auto fire");
assert.equal(game.weapon.magazine, 30);
assert.equal(game.weapon.reserve, 210);
assert.equal(elements.get("weaponStatus").textContent, "FULL-AUTO · 811 RPM");
const mtzBaseDamage = game.weapon.damage;
game.clearPlayedAudioSources();
game.weapon.startBurst(40600);
game.weapon.update(40600);
assert.equal(game.weapon.magazine, 29, "MTZ-556 fires immediately when the trigger is pressed");
assert.ok(game.playedAudioSources.some((source) => source.endsWith("/mtz556/shoot.wav")), "MTZ-556 uses its authored firing sound");
game.weapon.update(40600 + game.weapon.shotInterval - 0.01);
assert.equal(game.weapon.magazine, 29, "MTZ-556 respects its 811 RPM interval");
game.weapon.update(40600 + game.weapon.shotInterval);
assert.equal(game.weapon.magazine, 28, "holding fire produces the next 811 RPM shot");
game.weapon.stopFiring();
game.weapon.update(41000);
assert.equal(game.weapon.magazine, 28, "releasing fire stops the automatic weapon");

game.weapon.refillAmmo();
game.weapon.magazine = 10;
game.clearPlayedAudioSources();
assert.equal(game.weapon.beginReload(41100), true, "MTZ-556 supports its tactical reload");
assert.deepEqual(Array.from(game.weapon.reloadSequence, (clip) => clip.id), ["tactical"]);
assert.equal(game.weapon.reloadDuration, 4737);
assert.ok(game.playedAudioSources.at(-1).endsWith("/mtz556/reload_tactical.wav"));
game.weapon.update(45837);
assert.equal(game.weapon.magazine, 30);

game.weapon.magazine = 0;
game.clearPlayedAudioSources();
assert.equal(game.weapon.beginReload(46000), true, "MTZ-556 supports its empty reload");
assert.deepEqual(Array.from(game.weapon.reloadSequence, (clip) => clip.id), ["empty"]);
assert.equal(game.weapon.reloadDuration, 9613);
assert.ok(game.playedAudioSources.at(-1).endsWith("/mtz556/reload.wav"));
game.weapon.update(55613);
game.weapon.applyPackTier();
assert.equal(game.weapon.name, "MAITRE Z'", "Pack-a-Punch applies the MTZ-556 name");
assert.equal(game.weapon.magazine, 60, "packed MTZ-556 uses a 60-round magazine");
assert.equal(game.weapon.reserve, 600, "packed MTZ-556 receives increased reserve ammunition");
assert.equal(game.weapon.damage, mtzBaseDamage * 2, "packed MTZ-556 uses the shared damage multiplier");
game.clearPlayedAudioSources();
game.weapon.startBurst(55700);
game.weapon.update(55700);
assert.ok(game.playedAudioSources.some((source) => source.endsWith("/aug/sweet_00.wav")), "packed MTZ-556 reuses the AUG Pack-a-Punch shot effect");
game.weapon.stopFiring();

game.state = "menu";
assert.equal(game.selectWeapon("bp50"), true);
game.state = "playing";
game.resetGame(56000);
assert.equal(game.weapon.name, "BP50");
assert.equal(game.weapon.fireMode, "automatic", "BP50 uses full-auto fire");
assert.equal(game.weapon.rpm, 857);
assert.equal(game.weapon.magazine, 30);
assert.equal(game.weapon.reserve, 210);
assert.equal(elements.get("weaponStatus").textContent, "FULL-AUTO · 857 RPM");
const bp50BaseDamage = game.weapon.damage;
game.clearPlayedAudioSources();
game.weapon.startBurst(56100);
game.weapon.update(56100);
assert.equal(game.weapon.magazine, 29, "BP50 fires immediately when the trigger is pressed");
assert.ok(game.playedAudioSources.some((source) => source.endsWith("/bp50/shoot.wav")), "BP50 uses its authored firing sound");
game.weapon.update(56100 + game.weapon.shotInterval - 0.01);
assert.equal(game.weapon.magazine, 29, "BP50 respects its 857 RPM interval");
game.weapon.update(56100 + game.weapon.shotInterval);
assert.equal(game.weapon.magazine, 28, "holding fire produces the next BP50 shot");
game.weapon.stopFiring();

game.weapon.refillAmmo();
game.weapon.magazine = 10;
game.clearPlayedAudioSources();
assert.equal(game.weapon.beginReload(56200), true, "BP50 supports its tactical reload");
assert.deepEqual(Array.from(game.weapon.reloadSequence, (clip) => clip.id), ["tactical"]);
assert.equal(game.weapon.reloadDuration, 9242);
assert.ok(game.playedAudioSources.at(-1).endsWith("/bp50/reload_tactical.wav"));
game.weapon.update(65442);
assert.equal(game.weapon.magazine, 30);

game.weapon.magazine = 0;
game.clearPlayedAudioSources();
assert.equal(game.weapon.beginReload(65600), true, "BP50 supports its empty reload");
assert.deepEqual(Array.from(game.weapon.reloadSequence, (clip) => clip.id), ["empty"]);
assert.equal(game.weapon.reloadDuration, 11680);
assert.ok(game.playedAudioSources.at(-1).endsWith("/bp50/reload.wav"));
game.weapon.update(77280);
game.weapon.applyPackTier();
assert.equal(game.weapon.name, "TORO CACHORRO 50", "Pack-a-Punch applies the BP50 name");
assert.equal(game.weapon.magazine, 90, "packed BP50 uses a 90-round magazine");
assert.equal(game.weapon.reserve, 910, "packed BP50 receives increased reserve ammunition");
assert.equal(game.weapon.damage, bp50BaseDamage * 2, "packed BP50 uses the shared damage multiplier");
game.clearPlayedAudioSources();
game.weapon.startBurst(77400);
game.weapon.update(77400);
assert.ok(game.playedAudioSources.some((source) => source.endsWith("/aug/sweet_00.wav")), "packed BP50 reuses the AUG Pack-a-Punch shot effect");
game.weapon.stopFiring();

game.state = "menu";
assert.equal(game.selectWeapon("aug"), true);
game.state = "playing";
game.resetGame(40900);

game.weapon.refillAmmo();
game.weapon.magazine = 10;
game.clearPlayedAudioSources();
assert.equal(game.weapon.beginReload(41000), true, "a partial magazine starts a tactical reload");
assert.deepEqual(Array.from(game.weapon.reloadSequence, (clip) => clip.id), ["magOut", "futz", "magIn", "gripDown"]);
assert.equal(game.weapon.reloadDuration, 1730, "tactical reload duration follows the combined clip lengths");
assert.ok(game.playedAudioSources.at(-1).endsWith("fly_aug_mag_out.wav"), "tactical reload begins with magazine removal");
game.weapon.update(41232);
game.weapon.update(41789);
game.weapon.update(42126);
assert.deepEqual(
  game.playedAudioSources.filter((source) => source.includes("/aug/reload/fly_")).map((source) => source.split("/").at(-1)),
  ["fly_aug_mag_out.wav", "fly_aug_futz.wav", "fly_aug_mag_in.wav", "fly_aug_grip_down.wav"],
  "tactical reload plays its authored sequence",
);
game.weapon.update(42730);
assert.equal(game.weapon.isReloading, false, "tactical reload completes with its audio sequence");

game.weapon.refillAmmo();
game.weapon.magazine = 0;
game.clearPlayedAudioSources();
assert.equal(game.weapon.beginReload(43000), true, "an empty magazine starts an empty reload");
assert.deepEqual(Array.from(game.weapon.reloadSequence, (clip) => clip.id), ["magOut", "futz", "magIn", "boltBack", "boltForward", "gripDown"]);
assert.equal(game.weapon.reloadDuration, 2055, "empty reload duration follows the combined clip lengths");
game.weapon.refillAmmo();
game.weapon.magazine = 0;
game.weapon.reserve = 0;
game.clearPlayedAudioSources();
game.weapon.startBurst(46000);
assert.ok(game.playedAudioSources.at(-1).endsWith("plr_dry_fire_00.wav"), "shooting an empty AUG plays dry fire");

game.zombies.length = 0;
const runner = game.createZombieAt(game.player.x + 200, game.player.y, 47000, { category: "round", aggro: true });
runner.nextPathfindAt = 0;
game.clearPlayedAudioSources();
game.updateZombieNavigation(runner, 47000, 0);
assert.ok(game.playedAudioSources.some((source) => /\/sprint[1-9]\.wav$/.test(source)), "a visible pursuing zombie starts a sprint voice");
assert.ok(game.playedAudioSources.every((source) => !/\/attack[1-9]\.wav$/.test(source)), "line of sight alone never plays melee attack audio");
runner.voice.emit("ended");
game.clearPlayedAudioSources();
game.updateZombieNavigation(runner, 47049, 0);
assert.equal(game.playedAudioSources.length, 0, "sprint audio waits for the next 50 ms visibility tick");
game.updateZombieNavigation(runner, 47050, 0);
assert.ok(game.playedAudioSources.some((source) => /\/sprint[1-9]\.wav$/.test(source)), "the 50 ms visibility tick can start the next sprint voice");

const meleeZombie = game.createZombieAt(game.player.x + 8, game.player.y, 48000, { category: "round", aggro: true });
game.clearPlayedAudioSources();
game.updateGame(48000, 0);
assert.ok(game.playedAudioSources.some((source) => /\/attack[1-9]\.wav$/.test(source)), "a physical melee attempt plays an attack voice");
game.clearPlayedAudioSources();
game.registerZombieKill(48001, meleeZombie);
assert.ok(game.playedAudioSources.some((source) => /\/death(?:10|[1-9])\.wav$/.test(source)), "a confirmed zombie kill plays a death voice");

const literalAssetPaths = [...new Set(
  [...html.matchAll(/["'](src\/[A-Za-z0-9_./ -]+\.(?:png|wav|mp3|js))["']/g)].map((match) => match[1]),
)];
for (const assetPath of literalAssetPaths) {
  assert.ok(fs.existsSync(assetPath), `source asset exists: ${assetPath}`);
  assert.ok(fs.existsSync(`dist/${assetPath}`), `dist asset exists: ${assetPath}`);
}
for (let attack = 1; attack <= 9; attack++) {
  assert.ok(fs.existsSync(`src/sfx/attack${attack}.wav`));
  assert.ok(fs.existsSync(`dist/src/sfx/attack${attack}.wav`));
}
for (let sprint = 1; sprint <= 9; sprint++) {
  assert.ok(fs.existsSync(`src/sfx/sprint${sprint}.wav`));
  assert.ok(fs.existsSync(`dist/src/sfx/sprint${sprint}.wav`));
}
for (let death = 1; death <= 10; death++) {
  assert.ok(fs.existsSync(`src/sfx/death${death}.wav`));
  assert.ok(fs.existsSync(`dist/src/sfx/death${death}.wav`));
}
for (const reloadClip of [
  "fly_aug_mag_out.wav", "fly_aug_futz.wav", "fly_aug_mag_in.wav",
  "fly_aug_bolt_back.wav", "fly_aug_bolt_forward.wav", "fly_aug_grip_down.wav",
  "plr_dry_fire_00.wav",
]) {
  assert.ok(fs.existsSync(`src/sfx/wn/ar/aug/reload/${reloadClip}`));
  assert.ok(fs.existsSync(`dist/src/sfx/wn/ar/aug/reload/${reloadClip}`));
}
for (const mtzClip of ["shoot.wav", "reload.wav", "reload_tactical.wav"]) {
  assert.ok(fs.existsSync(`src/sfx/wn/ar/mtz556/${mtzClip}`));
  assert.ok(fs.existsSync(`dist/src/sfx/wn/ar/mtz556/${mtzClip}`));
}
for (const bp50Clip of ["shoot.wav", "reload.wav", "reload_tactical.wav"]) {
  assert.ok(fs.existsSync(`src/sfx/wn/ar/bp50/${bp50Clip}`));
  assert.ok(fs.existsSync(`dist/src/sfx/wn/ar/bp50/${bp50Clip}`));
}

console.log("Outbreak and RBZ regression harness passed.");

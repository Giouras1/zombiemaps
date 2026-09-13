(function () {
  "use strict";

  const point = (id, x, y) => ({ id, x, y });
  const polygonCenter = (points) => ({
    x: points.reduce((sum, entry) => sum + entry[0], 0) / points.length,
    y: points.reduce((sum, entry) => sum + entry[1], 0) / points.length,
  });
  const polygon = (id, points, kind) => ({ id, ...polygonCenter(points), points, kind });
  const orientedRect = (id, x, y, width, height, rotation = 0, kind = "building") => {
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    const points = [
      [-width / 2, -height / 2], [width / 2, -height / 2],
      [width / 2, height / 2], [-width / 2, height / 2],
    ].map(([localX, localY]) => [
      x + localX * cosine - localY * sine,
      y + localX * sine + localY * cosine,
    ]);
    return { id, x, y, width, height, rotation, points, kind };
  };
  const circle = (id, x, y, radius, kind = "refinery") => {
    const points = Array.from({ length: 24 }, (_, index) => {
      const angle = index / 24 * Math.PI * 2;
      return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
    });
    return { id, x, y, radius, width: radius * 2, height: radius * 2, points, kind };
  };

  const config = {
    id: "rohan-oil",
    displayName: "ROHAN OIL",
    bounds: { x: -1500, y: -1500, width: 3000, height: 3000 },
    boundary: [
      [-1230, -1260], [-720, -1450], [100, -1470], [850, -1370],
      [1240, -1080], [1390, -460], [1410, 420], [1250, 1080],
      [760, 1400], [50, 1470], [-720, 1390], [-1190, 1080],
      [-1390, 460], [-1370, -480],
    ],
    waterAreas: [],
    landAreas: [
      polygon("north-refinery-yard", [
        [-1110, -1280], [-650, -1390], [800, -1320], [1130, -1030],
        [1050, -520], [570, -430], [-420, -500], [-1060, -620],
      ], "industrial"),
      polygon("west-processing-yard", [
        [-1160, -980], [-730, -1020], [-430, -760], [-510, -470],
        [-1050, -490], [-1210, -700],
      ], "industrial"),
      polygon("central-tank-pad", [
        [-870, -320], [-120, -320], [-100, 830], [-880, 850],
      ], "concrete"),
      polygon("east-tank-pad", [
        [350, -300], [1010, -310], [1030, 820], [340, 840],
      ], "concrete"),
      polygon("south-operations-pad", [
        [-790, 1030], [-250, 1060], [510, 1240], [690, 1390],
        [-520, 1390],
      ], "industrial"),
    ],
    bridgeAreas: [],
    roads: [
      { id: "north-perimeter", width: 82, points: [[-1050, -1220], [-600, -1360], [180, -1360], [800, -1260], [1120, -1040]] },
      { id: "central-access", width: 80, points: [[180, -1360], [180, -920], [180, -450], [180, 200], [180, 760], [300, 1080], [400, 1320]] },
      { id: "west-service", width: 76, points: [[-1050, -1220], [-1160, -820], [-1080, -520], [-1110, -100], [-1100, 380], [-1040, 800], [-760, 1120]] },
      { id: "east-service", width: 78, points: [[1120, -1040], [1100, -500], [1150, 0], [1140, 550], [1000, 1050], [400, 1320]] },
      { id: "north-crossroad", width: 74, points: [[-1080, -520], [-720, -450], [-300, -450], [180, -450], [650, -460], [1100, -500]] },
      { id: "west-tank-road", width: 62, points: [[-1110, -100], [-930, -250], [-920, 300], [-900, 800], [-760, 1120]] },
      { id: "east-inner-road", width: 62, points: [[180, -450], [300, -260], [300, 300], [300, 820], [300, 1080]] },
      { id: "south-connector", width: 76, points: [[-1040, 800], [-760, 1120], [-200, 1180], [400, 1320], [1000, 1050]] },
      { id: "northwest-yard-road", width: 58, points: [[-1050, -1220], [-980, -1040], [-1020, -860], [-1080, -520]] },
      { id: "northeast-yard-road", width: 60, points: [[650, -460], [990, -650], [1050, -820], [1120, -1040]] },
    ],
    pipeWalkways: [
      { id: "copper-west-spine", width: 48, points: [[-485, -290], [-485, 40], [-485, 400], [-485, 790]] },
      { id: "copper-east-spine", width: 48, points: [[705, -280], [705, 40], [705, 400], [705, 790]] },
      { id: "copper-transfer-north", width: 46, points: [[-890, -300], [-485, -300], [180, -300], [705, -300], [1040, -280]] },
      { id: "copper-transfer-one", width: 46, points: [[-850, 40], [-485, 40], [180, 40], [705, 40], [1020, 40]] },
      { id: "copper-transfer-two", width: 46, points: [[-850, 400], [-485, 400], [180, 400], [705, 400], [1020, 400]] },
      { id: "copper-transfer-south", width: 46, points: [[-850, 790], [-485, 790], [180, 790], [705, 790], [1020, 790]] },
    ],
    collisionAreas: [
      orientedRect("northwest-admin", -760, -1120, 350, 185, -0.08),
      orientedRect("northwest-annex", -820, -850, 210, 135, 0.05),
      orientedRect("north-process-hall", -300, -1080, 430, 230, 0.03),
      orientedRect("north-control", -20, -790, 230, 155, -0.06),
      orientedRect("northeast-refinery-hall", 580, -1080, 430, 235, 0.04),
      orientedRect("northeast-compressor", 760, -780, 260, 145, -0.06),
      orientedRect("north-laboratory", 420, -680, 260, 145, 0.08),
      orientedRect("west-processing-hall", -690, -680, 360, 160, -0.04),
      circle("refinery-central-a1", -650, -140, 108),
      circle("refinery-central-a2", -320, -140, 108),
      circle("refinery-central-b1", -650, 220, 108),
      circle("refinery-central-b2", -320, 220, 108),
      circle("refinery-central-c1", -650, 580, 108),
      circle("refinery-central-c2", -320, 580, 108),
      circle("refinery-east-a1", 550, -120, 112),
      circle("refinery-east-a2", 860, -120, 112),
      circle("refinery-east-b1", 550, 240, 112),
      circle("refinery-east-b2", 860, 240, 112),
      circle("refinery-east-c1", 550, 600, 112),
      circle("refinery-east-c2", 860, 600, 112),
      circle("separator-west-one", -820, 130, 55, "separator"),
      circle("separator-west-two", -820, 500, 55, "separator"),
      orientedRect("south-pump-house", -610, 1010, 190, 125, 0.06),
      orientedRect("south-maintenance", -250, 1030, 210, 120, -0.04),
      orientedRect("south-control-room", 760, 930, 220, 135, 0.05),
      orientedRect("far-east-warehouse", 1240, 820, 190, 135, -0.04),
      orientedRect("far-west-garage", -1220, 680, 170, 120, 0.08),
    ],
    coverAreas: [
      orientedRect("cover-north-1", -1210, -1120, 64, 32, 0.05, "cover"),
      orientedRect("cover-north-2", 1050, -1250, 58, 34, 0, "cover"),
      orientedRect("cover-west-1", -1280, -250, 60, 34, -0.12, "cover"),
      orientedRect("cover-west-2", -1260, 300, 58, 34, 0.08, "cover"),
      orientedRect("cover-southwest", -1050, 1040, 64, 36, -0.08, "cover"),
      orientedRect("cover-east-1", 1300, -250, 58, 34, 0.1, "cover"),
      orientedRect("cover-east-2", 1290, 500, 62, 36, -0.08, "cover"),
      orientedRect("cover-south-1", -400, 1340, 58, 36, 0.06, "cover"),
      orientedRect("cover-south-2", 650, 1380, 62, 36, -0.1, "cover"),
    ],
    playerSpawns: [
      point("rohan-spawn-northwest", -1050, -1220), point("rohan-spawn-north", 180, -1360),
      point("rohan-spawn-northeast", 1120, -1040), point("rohan-spawn-west", -1040, 800),
      point("rohan-spawn-south", 400, 1320), point("rohan-spawn-east", 1000, 1050),
    ],
    ambientNodes: [
      point("rohan-ambient-01", -1050, -1220), point("rohan-ambient-02", -600, -1360),
      point("rohan-ambient-03", 180, -1360), point("rohan-ambient-04", 800, -1260),
      point("rohan-ambient-05", 1120, -1040), point("rohan-ambient-06", -1160, -820),
      point("rohan-ambient-07", -1080, -520), point("rohan-ambient-08", -720, -450),
      point("rohan-ambient-09", -300, -450), point("rohan-ambient-10", 180, -450),
      point("rohan-ambient-11", 650, -460), point("rohan-ambient-12", 1100, -500),
      point("rohan-ambient-13", -1110, -100), point("rohan-ambient-14", -920, 300),
      point("rohan-ambient-15", -900, 800), point("rohan-ambient-16", 180, 200),
      point("rohan-ambient-17", 180, 760), point("rohan-ambient-18", 300, -260),
      point("rohan-ambient-19", 300, 300), point("rohan-ambient-20", 300, 820),
      point("rohan-ambient-21", 1150, 0), point("rohan-ambient-22", 1140, 550),
      point("rohan-ambient-23", 1000, 1050), point("rohan-ambient-24", -1040, 800),
      point("rohan-ambient-25", -760, 1120), point("rohan-ambient-26", -200, 1180),
      point("rohan-ambient-27", 400, 1320), point("rohan-ambient-28", 820, -680),
      point("rohan-ambient-29", 970, -850), point("rohan-ambient-30", -980, -1040),
    ],
    hvtLocations: [
      point("rohan-hvt-west", -1080, -520), point("rohan-hvt-northeast", 650, -460),
      point("rohan-hvt-southwest", -900, 800), point("rohan-hvt-southeast", 1000, 1050),
    ],
    frenzyLocations: [
      point("rohan-frenzy-north", 180, -920), point("rohan-frenzy-west", -1110, -100),
      point("rohan-frenzy-east", 1140, 550), point("rohan-frenzy-south", -200, 1180),
    ],
    dataHeistHardDriveLocations: [
      { ...point("rohan-data-drive-west", -720, -450), searchCenter: { x: -610, y: -350 }, searchRadius: 240 },
      { ...point("rohan-data-drive-tanks", -920, 300), searchCenter: { x: -800, y: 220 }, searchRadius: 235 },
      { ...point("rohan-data-drive-center", 300, 300), searchCenter: { x: 420, y: 230 }, searchRadius: 230 },
      { ...point("rohan-data-drive-northeast", 820, -680), searchCenter: { x: 700, y: -600 }, searchRadius: 245 },
    ],
    dataHeistUploadStations: [
      { ...point("rohan-upload-west", -1180, -650), clearance: 55 },
      { ...point("rohan-upload-east", 1200, 250), clearance: 55 },
      { ...point("rohan-upload-southwest", -520, 1280), clearance: 55 },
      { ...point("rohan-upload-southeast", 1050, 920), clearance: 55 },
    ],
    truckStarts: [point("rohan-cargo-start-west", -1050, -1220), point("rohan-cargo-start-east", 1120, -1040)],
    truckDestinations: [point("rohan-cargo-destination-east", 1000, 1050), point("rohan-cargo-destination-west", -760, 1120)],
    cargoRoutes: [
      {
        id: "rohan-cargo-west-east", startId: "rohan-cargo-start-west", destinationId: "rohan-cargo-destination-east",
        waypoints: [[-1050, -1220], [-1160, -820], [-1080, -520], [-1110, -100], [-1100, 380], [-1040, 800], [-760, 1120], [-200, 1180], [400, 1320], [1000, 1050]],
      },
      {
        id: "rohan-cargo-east-west", startId: "rohan-cargo-start-east", destinationId: "rohan-cargo-destination-west",
        waypoints: [[1120, -1040], [1100, -500], [1150, 0], [1140, 550], [1000, 1050], [400, 1320], [-200, 1180], [-760, 1120]],
      },
    ],
    anomalyBuildings: [
      { id: "rohan-anomaly-admin", buildingId: "northwest-admin", entrance: { x: -760, y: -990 }, label: "ADMIN ANOMALY" },
      { id: "rohan-anomaly-control", buildingId: "south-control-room", entrance: { x: 760, y: 1030 }, label: "CONTROL ANOMALY" },
    ],
    blessingCandidates: {
      hygeian: [point("rohan-hygeian-west", -1110, -100), point("rohan-hygeian-east", 1140, 550), point("rohan-hygeian-south", -200, 1180)],
      anarrosis: [point("rohan-anarrosis-north", 180, -920), point("rohan-anarrosis-west", -1040, 800), point("rohan-anarrosis-east", 1150, 0)],
      taxytitos: [point("rohan-taxytitos-north", -300, -450), point("rohan-taxytitos-center", 180, 650), point("rohan-taxytitos-south", 400, 1320)],
    },
    ammoCacheCandidates: [
      point("rohan-ammo-northwest", -1050, -1220), point("rohan-ammo-north", 180, -1360),
      point("rohan-ammo-northeast", 1120, -1040), point("rohan-ammo-west", -1080, -520),
      point("rohan-ammo-east", 1100, -500), point("rohan-ammo-southwest", -760, 1120),
      point("rohan-ammo-southeast", 1000, 1050),
    ],
    safeZone: {
      bounds: { x: -360, y: -250, width: 720, height: 500 },
      playerSpawn: { x: 0, y: 170 }, packAPunch: { x: -130, y: -25 },
      beacon: { x: 145, y: -25 }, exit: { x: 0, y: 220 },
    },
  };

  function validateRohanConfig(value) {
    const errors = [];
    const requireCount = (name, list, minimum) => {
      if (!Array.isArray(list) || list.length < minimum) errors.push(`${name} requires at least ${minimum} entries`);
    };
    requireCount("roads", value.roads, 8);
    requireCount("pipeWalkways", value.pipeWalkways, 4);
    requireCount("collisionAreas", value.collisionAreas, 20);
    requireCount("ambientNodes", value.ambientNodes, 20);
    requireCount("hvtLocations", value.hvtLocations, 4);
    requireCount("frenzyLocations", value.frenzyLocations, 3);
    requireCount("dataHeistHardDriveLocations", value.dataHeistHardDriveLocations, 4);
    requireCount("dataHeistUploadStations", value.dataHeistUploadStations, 4);
    requireCount("cargoRoutes", value.cargoRoutes, 2);
    requireCount("anomalyBuildings", value.anomalyBuildings, 2);
    if (value.bounds.width < 2700 || value.bounds.height < 2700) errors.push("Rohan must remain comparable to Zarqwa in size");
    if (errors.length) throw new Error(`Invalid Rohan Oil map config:\n- ${errors.join("\n- ")}`);
    return true;
  }

  validateRohanConfig(config);
  window.ROHAN_CONFIG = config;
  window.validateRohanConfig = validateRohanConfig;
})();

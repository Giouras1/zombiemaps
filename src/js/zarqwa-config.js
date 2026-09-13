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
      [-width / 2, -height / 2],
      [width / 2, -height / 2],
      [width / 2, height / 2],
      [-width / 2, height / 2],
    ].map(([localX, localY]) => [
      x + localX * cosine - localY * sine,
      y + localX * sine + localY * cosine,
    ]);
    return { id, x, y, width, height, rotation, points, kind };
  };
  const bridge = (id, startX, startY, endX, endY, width, lengthMeters = null) => {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const length = Math.hypot(deltaX, deltaY);
    return {
      ...orientedRect(id, (startX + endX) / 2, (startY + endY) / 2, length, width, Math.atan2(deltaY, deltaX), "bridge"),
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
      length,
      lengthMeters,
    };
  };

  // Fixed map data authored from the supplied reference. The 94 m
  // hydroelectric bridge is the ruler: ~6.018 world units represent 1 meter.
  const mainBridge = bridge("hydroelectric-main-bridge", 160, -720, 560, -320, 112, 94);
  const config = {
    id: "zarqwa-hydroelectric",
    displayName: "ZARQWA HYDROELECTRIC",
    scale: {
      mainBridgeId: mainBridge.id,
      mainBridgeLengthMeters: 94,
      worldUnitsPerMeter: mainBridge.length / 94,
    },
    bounds: { x: -1450, y: -1450, width: 3000, height: 3000 },
    boundary: [
      [-1340, -1090], [-1160, -1310], [-780, -1380], [-420, -1320],
      [-80, -1385], [360, -1350], [760, -1240], [1080, -1010],
      [1330, -740], [1430, -350], [1460, 40], [1400, 350],
      [1450, 720], [1340, 1080], [1100, 1320], [680, 1430],
      [310, 1385], [-40, 1460], [-420, 1410], [-720, 1320],
      [-1040, 1290], [-1280, 1080], [-1370, 730], [-1320, 390],
      [-1390, 80], [-1370, -300], [-1400, -650],
    ],
    waterAreas: [
      polygon("dam-channel", [[-3, -557], [397, -157], [723, -483], [323, -883]], "water"),
      polygon("east-reservoir", [
        [323, -883], [600, -930], [900, -790], [1080, -700], [1190, -560],
        [1220, -180], [1140, -80], [960, -30], [760, -150], [723, -483],
      ], "water"),
      polygon("central-basin", [
        [-820, -430], [-620, -520], [-450, -430], [-280, -510], [-80, -430],
        [80, -500], [200, -360], [170, -180], [300, -40], [260, 160],
        [430, 320], [390, 560], [480, 650], [380, 820], [150, 750],
        [-50, 820], [-300, 720], [-430, 620], [-620, 620], [-720, 450],
        [-930, 300], [-860, 80], [-980, -100],
      ], "water"),
      polygon("west-channel", [
        [-1030, 300], [-930, 300], [-860, 80], [-720, 450],
        [-620, 620], [-820, 760], [-1050, 800], [-1140, 650], [-1080, 470],
      ], "water"),
      polygon("south-river", [
        [-620, 620], [-430, 620], [-300, 720], [-50, 820], [150, 750],
        [360, 820], [430, 980], [380, 1180], [250, 1400], [-450, 1400],
        [-620, 1240], [-850, 1180], [-980, 980], [-820, 760],
      ], "water"),
    ],
    landAreas: [
      polygon("central-island", [
        [-500, -120], [-320, -270], [-80, -250], [100, -120], [160, 80],
        [90, 270], [170, 430], [70, 500], [-120, 580], [-300, 720],
        [-430, 620], [-500, 350], [-540, 100],
      ], "ground"),
      polygon("dam-complex", [
        [500, -390], [650, -410], [830, -300], [980, -120], [940, 40],
        [760, 90], [590, -60], [520, -210],
      ], "concrete"),
      polygon("dam-east-apron", [
        [870, -90], [1160, -100], [1260, -45], [1240, 70], [920, 75],
      ], "concrete"),
      orientedRect("main-bridge-north-abutment", 140, -740, 130, 145, Math.PI / 4, "concrete"),
      orientedRect("main-bridge-dam-abutment", 580, -300, 130, 145, Math.PI / 4, "concrete"),
      polygon("west-peninsula", [
        [-1400, 390], [-1250, 400], [-1120, 490], [-1080, 590],
        [-1200, 690], [-1400, 620],
      ], "ground"),
      polygon("southwest-bank", [
        [-1110, 920], [-900, 1030], [-780, 1160], [-650, 1300],
        [-980, 1320], [-1220, 1160],
      ], "ground"),
    ],
    bridgeAreas: [
      mainBridge,
      bridge("central-west-bridge", -850, -445, -445, -82, 102),
      bridge("west-highway-bridge", -1180, 580, -500, 180, 108),
      bridge("southwest-main-bridge", -895, 1215, -220, 650, 124),
      bridge("island-east-bridge", 35, 445, 535, 760, 116),
    ],
    roads: [
      { id: "north-arterial", width: 82, points: [[-1280, -1050], [-1000, -1180], [-650, -1220], [-300, -1140], [0, -1120], [400, -1180], [750, -1100], [1050, -900], [1230, -700], [1350, -450]] },
      { id: "west-boulevard", width: 78, points: [[-1280, -1050], [-1240, -800], [-1280, -560], [-1260, -300], [-1320, -40], [-1280, 280], [-1260, 500], [-1180, 580]] },
      { id: "northwest-center-road", width: 76, points: [[-1180, -700], [-1020, -580], [-880, -470], [-760, -360], [-465, -100], [-300, 40], [-120, 180], [0, 330], [70, 470], [510, 750], [650, 760], [850, 800]] },
      { id: "central-island-spur", width: 64, points: [[-500, 180], [-330, 300], [-300, 520], [-300, 720]] },
      { id: "hydroelectric-road", width: 78, points: [[0, -1120], [40, -900], [160, -720], [560, -320], [700, -210], [850, -100], [940, 10], [1180, -20]] },
      { id: "east-boulevard", width: 82, points: [[1180, -20], [1300, 200], [1260, 450], [1120, 650], [850, 800]] },
      { id: "southeast-loop", width: 80, points: [[850, 800], [1050, 950], [1180, 1180], [850, 1290], [540, 1160], [500, 900], [510, 750]] },
      { id: "southwest-loop", width: 82, points: [[-1280, 280], [-1260, 650], [-1120, 950], [-850, 1180], [-300, 720], [-330, 520]] },
      { id: "west-highway", width: 78, points: [[-1260, 500], [-1180, 580], [-500, 180], [-330, 300]] },
      { id: "northwest-cross-street", width: 58, points: [[-1240, -800], [-1060, -820], [-900, -760], [-720, -720], [-560, -650]] },
      { id: "north-service-road", width: 58, points: [[-1000, -1180], [-920, -1130]] },
      { id: "northeast-service-road", width: 62, points: [[400, -1180], [420, -1030]] },
      { id: "east-district-road", width: 60, points: [[1300, 200], [1110, 260], [980, 420], [900, 600], [850, 800]] },
      { id: "southeast-cross-street", width: 58, points: [[1260, 450], [1120, 480], [980, 520], [900, 600]] },
      { id: "southwest-service-road", width: 60, points: [[-1120, 950], [-980, 900]] },
    ],
    collisionAreas: [
      orientedRect("nw-apartments-a", -1130, -930, 150, 108, 0.08),
      orientedRect("nw-municipal", -900, -980, 170, 112, -0.18),
      orientedRect("nw-apartments-b", -650, -1010, 150, 125, 0.2),
      orientedRect("nw-school", -390, -930, 190, 112, -0.08),
      orientedRect("nw-market-a", -1090, -470, 155, 118, 0.12),
      orientedRect("nw-market-b", -780, -620, 145, 102, -0.2),
      orientedRect("nw-hotel", -560, -520, 132, 176, 0.08),
      orientedRect("nw-clinic", -1080, -190, 150, 125, -0.1),
      orientedRect("nw-workshop", -980, -180, 128, 94, 0.18),
      orientedRect("north-flats-a", 220, -1280, 150, 95, 0.05),
      orientedRect("north-flats-b", 560, -1010, 142, 105, -0.12),
      orientedRect("north-barracks", 770, -1260, 185, 115, 0.1),
      orientedRect("north-warehouse", 1020, -1120, 210, 135, -0.08),
      orientedRect("northeast-flats", 1210, -940, 148, 112, 0.18),
      orientedRect("hydro-admin", 620, -470, 150, 105, 0.18),
      orientedRect("hydro-turbine-a", 790, -390, 175, 116, 0.28),
      orientedRect("hydro-turbine-b", 900, -220, 145, 105, -0.12),
      orientedRect("east-warehouse", 1120, -310, 190, 125, 0.06),
      orientedRect("west-houses-a", -1180, 90, 138, 105, 0.04),
      orientedRect("west-houses-b", -1030, 110, 115, 92, -0.15),
      orientedRect("west-store", -1100, 360, 155, 100, 0.16),
      orientedRect("island-house-a", -270, -150, 125, 90, 0.18),
      orientedRect("island-house-b", 20, -150, 145, 100, -0.12),
      orientedRect("island-clinic", -120, 400, 130, 92, 0.08),
      orientedRect("island-workshop", 30, 170, 112, 82, -0.2),
      orientedRect("island-depot", -450, 420, 135, 95, 0.15),
      orientedRect("southwest-villas-a", -1050, 650, 155, 105, -0.08),
      orientedRect("southwest-villas-b", -880, 760, 145, 112, 0.16),
      orientedRect("southwest-farm", -690, 1260, 175, 110, 0.12),
      orientedRect("southwest-houses", -1160, 1190, 138, 104, -0.18),
      orientedRect("southwest-pump", -560, 1130, 150, 105, 0.08),
      orientedRect("east-houses-a", 1080, 100, 145, 100, 0.12),
      orientedRect("east-houses-b", 930, 270, 155, 105, -0.16),
      orientedRect("east-market", 740, 610, 170, 115, 0.08),
      orientedRect("east-apartments", 1250, 850, 190, 135, -0.08),
      orientedRect("southeast-clinic", 1210, 960, 145, 108, 0.16),
      orientedRect("southeast-hotel", 950, 1110, 185, 125, -0.12),
      orientedRect("southeast-school", 680, 1080, 190, 120, 0.1),
      orientedRect("southeast-market", 650, 900, 150, 105, -0.14),
      orientedRect("far-east-houses", 1300, 700, 135, 105, -0.08),
    ],
    coverAreas: [
      orientedRect("cover-nw-1", -980, -700, 52, 30, 0.2, "cover"),
      orientedRect("cover-nw-2", -480, -1060, 48, 34, -0.1, "cover"),
      orientedRect("cover-ne-1", 580, -740, 58, 32, 0.18, "cover"),
      orientedRect("cover-hydro-1", 760, -60, 50, 34, -0.2, "cover"),
      orientedRect("cover-west-1", -1120, 690, 62, 34, 0.12, "cover"),
      orientedRect("cover-sw-1", -760, 850, 54, 38, -0.16, "cover"),
      orientedRect("cover-island-1", -80, 60, 48, 32, 0.08, "cover"),
      orientedRect("cover-island-2", -120, 500, 56, 34, -0.12, "cover"),
      orientedRect("cover-se-1", 650, 680, 58, 34, 0.12, "cover"),
      orientedRect("cover-se-2", 1050, 820, 52, 38, -0.16, "cover"),
      orientedRect("cover-se-3", 830, 1020, 48, 34, 0.1, "cover"),
    ],
    playerSpawns: [
      point("spawn-northwest", -1150, -1080), point("spawn-north", 0, -1120),
      point("spawn-northeast", 1120, -820), point("spawn-east", 1260, 300),
      point("spawn-southeast", 850, 800), point("spawn-southwest", -1080, 950),
    ],
    ambientNodes: [
      point("ambient-01", -1280, -1050), point("ambient-02", -1000, -1180),
      point("ambient-03", -650, -1220), point("ambient-04", -300, -1140),
      point("ambient-05", -1240, -800), point("ambient-06", -1180, -700),
      point("ambient-07", -1020, -580), point("ambient-08", -880, -470),
      point("ambient-09", 0, -1120), point("ambient-10", 400, -1180),
      point("ambient-11", 750, -1100), point("ambient-12", 1050, -900),
      point("ambient-13", 1230, -700), point("ambient-14", 40, -900),
      point("ambient-15", 700, -210), point("ambient-16", 1180, -20),
      point("ambient-17", 1300, 200), point("ambient-18", 1260, 450),
      point("ambient-19", 1120, 650), point("ambient-20", 850, 800),
      point("ambient-21", 1050, 950), point("ambient-22", 1180, 1180),
      point("ambient-23", 540, 1160), point("ambient-24", -1280, 280),
      point("ambient-25", -1260, 650), point("ambient-26", -1120, 950),
      point("ambient-27", -850, 1180), point("ambient-28", -300, 720),
      point("ambient-29", -300, 40), point("ambient-30", 0, 330),
    ],
    hvtLocations: [
      point("hvt-northwest", -760, -820), point("hvt-northeast", 1040, -740),
      point("hvt-southwest", -1020, 880), point("hvt-southeast", 900, 900),
    ],
    frenzyLocations: [
      point("frenzy-north", -300, -1140), point("frenzy-east", 1260, 300),
      point("frenzy-southwest", -1020, 880), point("frenzy-island", 0, 330),
    ],
    dataHeistHardDriveLocations: [
      { ...point("data-drive-west", -880, -470), searchCenter: { x: -760, y: -400 }, searchRadius: 240 },
      { ...point("data-drive-north", 750, -1100), searchCenter: { x: 650, y: -990 }, searchRadius: 235 },
      { ...point("data-drive-east", 1260, 450), searchCenter: { x: 1140, y: 360 }, searchRadius: 230 },
      { ...point("data-drive-southwest", -300, 720), searchCenter: { x: -180, y: 620 }, searchRadius: 245 },
    ],
    dataHeistUploadStations: [
      { ...point("upload-west", -1280, 280), clearance: 55 },
      { ...point("upload-east", 1180, -20), clearance: 55 },
      { ...point("upload-north", -300, -1140), clearance: 55 },
      { ...point("upload-south", 1180, 1180), clearance: 55 },
    ],
    truckStarts: [point("cargo-start-west", -1180, -700), point("cargo-start-east", 1000, -20)],
    truckDestinations: [point("cargo-destination-east", 850, 800), point("cargo-destination-west", -1080, 950)],
    cargoRoutes: [
      {
        id: "cargo-route-west-east",
        startId: "cargo-start-west",
        destinationId: "cargo-destination-east",
        waypoints: [[-1180, -700], [-1020, -580], [-880, -470], [-760, -360], [-465, -100], [-300, 40], [-120, 180], [0, 330], [70, 470], [510, 750], [650, 760], [850, 800]],
      },
      {
        id: "cargo-route-east-west",
        startId: "cargo-start-east",
        destinationId: "cargo-destination-west",
        waypoints: [[1000, -20], [900, -20], [850, -100], [700, -210], [560, -320], [160, -720], [40, -900], [0, -1120], [-300, -1140], [-650, -1220], [-1000, -1180], [-1280, -1050], [-1240, -800], [-1280, -560], [-1260, -300], [-1320, -40], [-1280, 280], [-1260, 650], [-1120, 950], [-1080, 950]],
      },
    ],
    anomalyBuildings: [
      { id: "anomaly-municipal", buildingId: "nw-municipal", entrance: { x: -900, y: -890 }, label: "MUNICIPAL ANOMALY" },
      { id: "anomaly-hotel", buildingId: "southeast-hotel", entrance: { x: 1065, y: 1110 }, label: "HOTEL ANOMALY" },
    ],
    blessingCandidates: {
      hygeian: [point("hygeian-northwest", -760, -820), point("hygeian-east", 1260, 300), point("hygeian-southwest", -1050, 820)],
      anarrosis: [point("anarrosis-west", -1320, -40), point("anarrosis-dam", 940, 10), point("anarrosis-southeast", 820, 980)],
      taxytitos: [point("taxytitos-north", 400, -1180), point("taxytitos-island", -300, 40), point("taxytitos-east", 1120, 650)],
    },
    ammoCacheCandidates: [
      point("ammo-northwest", -1000, -1180), point("ammo-north", 0, -1120),
      point("ammo-northeast", 1050, -900), point("ammo-east", 1300, 200),
      point("ammo-southeast", 540, 1160), point("ammo-southwest", -1120, 950),
      point("ammo-island", 0, 330),
    ],
    safeZone: {
      bounds: { x: -360, y: -250, width: 720, height: 500 },
      playerSpawn: { x: 0, y: 170 }, packAPunch: { x: -130, y: -25 },
      beacon: { x: 145, y: -25 }, exit: { x: 0, y: 220 },
    },
  };

  function isInsideBounds(position, bounds) {
    return position.x >= bounds.x && position.x <= bounds.x + bounds.width &&
      position.y >= bounds.y && position.y <= bounds.y + bounds.height;
  }

  function validateZarqwaConfig(value) {
    const errors = [];
    const assertCount = (name, list, minimum, maximum = minimum) => {
      if (!Array.isArray(list) || list.length < minimum || list.length > maximum) {
        errors.push(`${name} requires ${minimum}${maximum === minimum ? "" : `-${maximum}`} entries`);
      }
    };
    assertCount("playerSpawns", value.playerSpawns, 4, 6);
    assertCount("ambientNodes", value.ambientNodes, 20, 30);
    assertCount("hvtLocations", value.hvtLocations, 4);
    assertCount("frenzyLocations", value.frenzyLocations, 3, 4);
    assertCount("dataHeistHardDriveLocations", value.dataHeistHardDriveLocations, 4);
    assertCount("dataHeistUploadStations", value.dataHeistUploadStations, 4);
    assertCount("truckStarts", value.truckStarts, 2);
    assertCount("truckDestinations", value.truckDestinations, 2);
    assertCount("cargoRoutes", value.cargoRoutes, 2);
    assertCount("anomalyBuildings", value.anomalyBuildings, 2);
    assertCount("ammoCacheCandidates", value.ammoCacheCandidates, 5, 7);
    for (const type of ["hygeian", "anarrosis", "taxytitos"]) {
      assertCount(`blessingCandidates.${type}`, value.blessingCandidates[type], 2, 3);
    }
    const main = value.bridgeAreas.find((entry) => entry.id === value.scale.mainBridgeId);
    if (!main || Math.abs(main.length / value.scale.worldUnitsPerMeter - 94) > 0.01) errors.push("main bridge scale must resolve to 94 meters");

    const collections = [
      value.playerSpawns, value.ambientNodes, value.hvtLocations,
      value.frenzyLocations, value.dataHeistHardDriveLocations, value.dataHeistUploadStations,
      value.truckStarts, value.truckDestinations,
      value.ammoCacheCandidates, ...Object.values(value.blessingCandidates),
    ];
    const ids = new Set();
    for (const position of collections.flat()) {
      if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y)) {
        errors.push("authored position contains invalid coordinates");
        continue;
      }
      if (!isInsideBounds(position, value.bounds)) errors.push(`${position.id} is outside bounds`);
      if (ids.has(position.id)) errors.push(`duplicate authored id: ${position.id}`);
      ids.add(position.id);
    }
    for (const route of value.cargoRoutes) {
      if (!value.truckStarts.some((item) => item.id === route.startId)) errors.push(`${route.id} has an invalid start`);
      if (!value.truckDestinations.some((item) => item.id === route.destinationId)) errors.push(`${route.id} has an invalid destination`);
      if (!Array.isArray(route.waypoints) || route.waypoints.length < 4) errors.push(`${route.id} needs at least four waypoints`);
      for (const waypoint of route.waypoints || []) {
        if (!isInsideBounds({ x: waypoint[0], y: waypoint[1] }, value.bounds)) errors.push(`${route.id} waypoint is outside bounds`);
      }
    }
    if (errors.length) throw new Error(`Invalid Zarqwa map config:\n- ${errors.join("\n- ")}`);
    return true;
  }

  validateZarqwaConfig(config);
  window.ZARQWA_CONFIG = config;
  window.validateZarqwaConfig = validateZarqwaConfig;
})();

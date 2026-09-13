(function () {
  "use strict";

  const point = (id, x, y) => ({ id, x, y });
  const polygonCenter = (points) => ({
    x: points.reduce((sum, entry) => sum + entry[0], 0) / points.length,
    y: points.reduce((sum, entry) => sum + entry[1], 0) / points.length,
  });
  const polygon = (id, points, kind) => ({ id, ...polygonCenter(points), points, kind });
  const orientedRect = (id, x, y, width, height, rotation = 0, kind = "building", color = null) => {
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    const points = [
      [-width / 2, -height / 2], [width / 2, -height / 2],
      [width / 2, height / 2], [-width / 2, height / 2],
    ].map(([localX, localY]) => [
      x + localX * cosine - localY * sine,
      y + localX * sine + localY * cosine,
    ]);
    return { id, x, y, width, height, rotation, points, kind, color };
  };
  const circle = (id, x, y, radius, kind = "refinery") => {
    const points = Array.from({ length: 24 }, (_, index) => {
      const angle = index / 24 * Math.PI * 2;
      return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
    });
    return { id, x, y, radius, width: radius * 2, height: radius * 2, points, kind };
  };
  const bridge = (id, start, end, width) => {
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    return {
      ...orientedRect(id, centerX, centerY, length + 56, width, Math.atan2(end.y - start.y, end.x - start.x), "bridge"),
      start,
      end,
      length,
      width,
    };
  };

  const config = {
    id: "hafid-port",
    displayName: "HAFID PORT",
    bounds: { x: -1500, y: -1500, width: 3000, height: 3000 },
    boundary: [
      [-1450, -1450], [-500, -1460], [350, -1450], [1050, -1370],
      [1430, -1160], [1470, -420], [1460, 420], [1440, 1240],
      [1060, 1390], [570, 1280], [160, 1390], [-460, 1380],
      [-920, 1300], [-1420, 850], [-1460, 100],
    ],
    waterAreas: [
      polygon("hafid-west-ocean", [
        [-1500, -1500], [-300, -1500], [-380, -1250], [-520, -1050],
        [-600, -800], [-690, -500], [-720, -100], [-760, 300],
        [-700, 650], [-620, 850], [-780, 1100], [-900, 1500],
        [-1500, 1500],
      ], "water"),
      polygon("hafid-south-bay", [
        [-900, 900], [-650, 850], [-400, 920], [-100, 860],
        [200, 900], [500, 850], [800, 900], [1100, 850],
        [1450, 920], [1500, 1500], [-900, 1500],
      ], "water"),
    ],
    landAreas: [
      polygon("hafid-main-port", [
        [-430, -1400], [420, -1390], [1040, -1310], [1400, -1080],
        [1400, 820], [1120, 820], [900, 860], [700, 820],
        [500, 820], [250, 850], [0, 820], [-250, 850],
        [-500, 800], [-650, 600], [-700, 200], [-650, -300],
        [-580, -700],
      ], "industrial"),
      polygon("hafid-tank-farm-pad", [
        [-600, -430], [40, -430], [40, 720], [-600, 720],
      ], "concrete"),
      polygon("hafid-container-yard", [
        [180, -430], [840, -430], [840, 720], [180, 720],
      ], "concrete"),
      polygon("hafid-east-dockhead", [
        [1220, 960], [1470, 990], [1470, 1270], [1280, 1210],
      ], "concrete"),
    ],
    bridgeAreas: [
      bridge("hafid-cargo-ship-pier", { x: -650, y: -250 }, { x: -1280, y: -330 }, 136),
      bridge("hafid-north-breakwater", { x: -570, y: -900 }, { x: -900, y: -1200 }, 106),
      bridge("hafid-south-service-pier", { x: -250, y: 800 }, { x: -300, y: 1220 }, 112),
      bridge("hafid-east-quay-pier", { x: 1120, y: 800 }, { x: 1370, y: 1100 }, 120),
    ],
    roads: [
      { id: "hafid-north-perimeter", width: 84, points: [[-350, -1300], [300, -1300], [900, -1250], [1350, -1100]] },
      { id: "hafid-north-gate", width: 68, points: [[-350, -1300], [-350, -900]] },
      { id: "hafid-warehouse-road", width: 74, points: [[-570, -900], [-350, -900], [100, -900], [600, -900], [900, -900], [1350, -1100]] },
      { id: "hafid-main-highway", width: 82, points: [[-650, -500], [100, -500], [600, -500], [900, -500], [1350, -500]] },
      { id: "hafid-west-harbor-road", width: 72, points: [[-650, -500], [-650, -250], [-650, 200], [-650, 650], [-550, 800]] },
      { id: "hafid-central-avenue", width: 68, points: [[100, -900], [100, -500], [100, 0], [100, 400], [100, 800]] },
      { id: "hafid-east-avenue", width: 72, points: [[900, -900], [900, -500], [900, 0], [900, 400], [900, 750], [1120, 800]] },
      { id: "hafid-tank-road-north", width: 62, points: [[-650, 0], [100, 0], [900, 0]] },
      { id: "hafid-tank-road-south", width: 62, points: [[-650, 400], [100, 400], [900, 400]] },
      { id: "hafid-quayside-road", width: 78, points: [[-550, 800], [-250, 800], [100, 800], [500, 800], [900, 750], [1120, 800]] },
      { id: "hafid-cargo-pier-road", width: 72, points: [[-1280, -330], [-650, -250]] },
      { id: "hafid-breakwater-road", width: 62, points: [[-900, -1200], [-570, -900]] },
      { id: "hafid-south-pier-road", width: 64, points: [[-250, 800], [-300, 1220]] },
      { id: "hafid-east-pier-road", width: 68, points: [[1120, 800], [1370, 1100]] },
    ],
    pipeWalkways: [],
    collisionAreas: [
      orientedRect("hafid-northwest-customs", -70, -1120, 300, 130, -0.03, "warehouse"),
      orientedRect("hafid-blue-hangar-west", 330, -1100, 280, 150, 0.02, "warehouse"),
      orientedRect("hafid-blue-hangar-east", 690, -1080, 280, 150, -0.02, "warehouse"),
      orientedRect("hafid-east-administration", 1160, -800, 210, 135, 0.05, "building"),
      orientedRect("hafid-central-cold-storage", 430, -700, 360, 140, -0.02, "warehouse"),
      orientedRect("hafid-west-workshop", -300, -700, 200, 130, 0.04, "building"),
      circle("hafid-tank-a1", -500, -250, 68),
      circle("hafid-tank-a2", -300, -250, 68),
      circle("hafid-tank-a3", -100, -250, 68),
      circle("hafid-tank-b1", -500, 200, 68),
      circle("hafid-tank-b2", -300, 200, 68),
      circle("hafid-tank-b3", -100, 200, 68),
      circle("hafid-tank-c1", -500, 600, 70),
      circle("hafid-tank-c2", -250, 600, 70),
      orientedRect("hafid-container-a1", 300, -250, 150, 46, 0, "container", "#315e72"),
      orientedRect("hafid-container-a2", 520, -250, 150, 46, 0, "container", "#8d4e34"),
      orientedRect("hafid-container-a3", 740, -250, 150, 46, 0, "container", "#3f6b54"),
      orientedRect("hafid-container-b1", 300, 200, 150, 46, 0, "container", "#8b6338"),
      orientedRect("hafid-container-b2", 520, 200, 150, 46, 0, "container", "#315e72"),
      orientedRect("hafid-container-b3", 740, 200, 150, 46, 0, "container", "#8d4e34"),
      orientedRect("hafid-container-c1", 300, 600, 150, 46, 0, "container", "#3f6b54"),
      orientedRect("hafid-container-c2", 520, 600, 150, 46, 0, "container", "#8b6338"),
      orientedRect("hafid-container-c3", 740, 600, 150, 46, 0, "container", "#315e72"),
      orientedRect("hafid-east-office-north", 1160, -220, 190, 145, -0.04),
      orientedRect("hafid-east-office-center", 1180, 240, 190, 140, 0.04),
      orientedRect("hafid-east-maintenance", 1260, 590, 190, 130, -0.04),
      orientedRect("hafid-south-operations", 720, 675, 150, 90, 0.02),
      orientedRect("hafid-ship-superstructure", -1390, -330, 80, 220, 0.12, "warehouse"),
    ],
    coverAreas: [
      orientedRect("hafid-cover-west-north", -520, -720, 52, 30, 0.04, "cover"),
      orientedRect("hafid-cover-center-north", -100, -720, 54, 30, -0.05, "cover"),
      orientedRect("hafid-cover-east-north", 700, -720, 54, 30, 0.04, "cover"),
      orientedRect("hafid-cover-far-east", 1360, -700, 52, 30, -0.04, "cover"),
      orientedRect("hafid-cover-tanks", -500, -100, 50, 28, 0.04, "cover"),
      orientedRect("hafid-cover-container-west", 250, 500, 52, 30, -0.05, "cover"),
      orientedRect("hafid-cover-container-east", 700, 500, 52, 30, 0.05, "cover"),
      orientedRect("hafid-cover-southeast", 1070, 620, 54, 30, -0.04, "cover"),
    ],
    playerSpawns: [
      point("hafid-spawn-northwest", -350, -1300), point("hafid-spawn-north", 900, -1250),
      point("hafid-spawn-east", 1350, -500), point("hafid-spawn-west", -650, 200),
      point("hafid-spawn-quay", 500, 800), point("hafid-spawn-south", -550, 800),
    ],
    ambientNodes: [
      point("hafid-ambient-01", -350, -1300), point("hafid-ambient-02", 300, -1300),
      point("hafid-ambient-03", 900, -1250), point("hafid-ambient-04", 1350, -1100),
      point("hafid-ambient-05", -570, -900), point("hafid-ambient-06", -350, -900),
      point("hafid-ambient-07", 100, -900), point("hafid-ambient-08", 600, -900),
      point("hafid-ambient-09", 900, -900), point("hafid-ambient-10", -650, -500),
      point("hafid-ambient-11", 100, -500), point("hafid-ambient-12", 600, -500),
      point("hafid-ambient-13", 900, -500), point("hafid-ambient-14", 1350, -500),
      point("hafid-ambient-15", -650, -250), point("hafid-ambient-16", -650, 0),
      point("hafid-ambient-17", 100, 0), point("hafid-ambient-18", 900, 0),
      point("hafid-ambient-19", -650, 200), point("hafid-ambient-20", -650, 400),
      point("hafid-ambient-21", 100, 400), point("hafid-ambient-22", 900, 400),
      point("hafid-ambient-23", -650, 650), point("hafid-ambient-24", -550, 800),
      point("hafid-ambient-25", -250, 800), point("hafid-ambient-26", 100, 800),
      point("hafid-ambient-27", 500, 800), point("hafid-ambient-28", 900, 750),
      point("hafid-ambient-29", 1120, 800), point("hafid-ambient-30", -1280, -330),
    ],
    hvtLocations: [
      point("hafid-hvt-west", -650, -500), point("hafid-hvt-north", 600, -900),
      point("hafid-hvt-container-yard", 100, 400), point("hafid-hvt-quay", 900, 750),
    ],
    frenzyLocations: [
      point("hafid-frenzy-warehouse", -350, -900), point("hafid-frenzy-east", 1350, -500),
      point("hafid-frenzy-tanks", -650, 650), point("hafid-frenzy-quay", 500, 800),
    ],
    dataHeistHardDriveLocations: [
      { ...point("hafid-data-drive-tank-farm", -650, 200), searchCenter: { x: -540, y: 100 }, searchRadius: 245 },
      { ...point("hafid-data-drive-warehouse", 100, -500), searchCenter: { x: 220, y: -610 }, searchRadius: 255 },
      { ...point("hafid-data-drive-containers", 900, 400), searchCenter: { x: 770, y: 290 }, searchRadius: 260 },
      { ...point("hafid-data-drive-quayside", 500, 800), searchCenter: { x: 380, y: 690 }, searchRadius: 260 },
    ],
    dataHeistUploadStations: [
      { ...point("hafid-upload-northwest", -350, -1300), clearance: 55 },
      { ...point("hafid-upload-northeast", 1350, -1100), clearance: 55 },
      { ...point("hafid-upload-southeast", 1300, 720), clearance: 55 },
      { ...point("hafid-upload-southwest", -450, 760), clearance: 55 },
    ],
    truckStarts: [
      point("hafid-cargo-start-ship", -1280, -330),
      point("hafid-cargo-start-north", -350, -1300),
    ],
    truckDestinations: [
      point("hafid-cargo-destination-east", 1350, -500),
      point("hafid-cargo-destination-south-pier", -300, 1220),
    ],
    cargoRoutes: [
      {
        id: "hafid-cargo-ship-to-east", startId: "hafid-cargo-start-ship", destinationId: "hafid-cargo-destination-east",
        waypoints: [[-1280, -330], [-650, -250], [-650, -500], [100, -500], [600, -500], [900, -500], [1350, -500]],
      },
      {
        id: "hafid-cargo-north-to-south-pier", startId: "hafid-cargo-start-north", destinationId: "hafid-cargo-destination-south-pier",
        waypoints: [[-350, -1300], [-350, -900], [100, -900], [100, -500], [100, 0], [100, 400], [100, 800], [-250, 800], [-300, 1220]],
      },
    ],
    anomalyBuildings: [
      { id: "hafid-anomaly-cold-storage", buildingId: "hafid-central-cold-storage", entrance: { x: 430, y: -600 }, label: "COLD STORAGE ANOMALY" },
      { id: "hafid-anomaly-operations", buildingId: "hafid-south-operations", entrance: { x: 720, y: 735 }, label: "PORT OPERATIONS ANOMALY" },
    ],
    blessingCandidates: {
      hygeian: [point("hafid-hygeian-west", -650, 200), point("hafid-hygeian-center", 600, -500), point("hafid-hygeian-east", 900, 400)],
      anarrosis: [point("hafid-anarrosis-north", -350, -900), point("hafid-anarrosis-yard", 100, 400), point("hafid-anarrosis-east", 1350, -500)],
      taxytitos: [point("hafid-taxytitos-north", 300, -1300), point("hafid-taxytitos-west", -650, 650), point("hafid-taxytitos-quay", 500, 800)],
    },
    ammoCacheCandidates: [
      point("hafid-ammo-northwest", -350, -1300), point("hafid-ammo-north", 900, -1250),
      point("hafid-ammo-east", 1350, -500), point("hafid-ammo-west", -650, -500),
      point("hafid-ammo-center", 100, 0), point("hafid-ammo-southwest", -550, 800),
      point("hafid-ammo-southeast", 900, 750),
    ],
    safeZone: {
      bounds: { x: -360, y: -250, width: 720, height: 500 },
      playerSpawn: { x: 0, y: 170 }, packAPunch: { x: -130, y: -25 },
      beacon: { x: 145, y: -25 }, exit: { x: 0, y: 220 },
    },
  };

  function validateHafidPortConfig(value) {
    const errors = [];
    const requireCount = (name, list, minimum) => {
      if (!Array.isArray(list) || list.length < minimum) errors.push(`${name} requires at least ${minimum} entries`);
    };
    requireCount("roads", value.roads, 12);
    requireCount("bridgeAreas", value.bridgeAreas, 4);
    requireCount("collisionAreas", value.collisionAreas, 25);
    requireCount("ambientNodes", value.ambientNodes, 30);
    requireCount("hvtLocations", value.hvtLocations, 4);
    requireCount("frenzyLocations", value.frenzyLocations, 4);
    requireCount("dataHeistHardDriveLocations", value.dataHeistHardDriveLocations, 4);
    requireCount("dataHeistUploadStations", value.dataHeistUploadStations, 4);
    requireCount("cargoRoutes", value.cargoRoutes, 2);
    requireCount("anomalyBuildings", value.anomalyBuildings, 2);
    if (value.bounds.width < 2700 || value.bounds.height < 2700) errors.push("Hafid Port must remain comparable to the other Outbreak maps in size");
    if (errors.length) throw new Error(`Invalid Hafid Port map config:\n- ${errors.join("\n- ")}`);
    return true;
  }

  validateHafidPortConfig(config);
  window.HAFID_PORT_CONFIG = config;
  window.validateHafidPortConfig = validateHafidPortConfig;
})();

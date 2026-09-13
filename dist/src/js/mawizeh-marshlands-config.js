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
  const circle = (id, x, y, radius, kind = "landmark") => {
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
      ...orientedRect(id, centerX, centerY, length + 60, width, Math.atan2(end.y - start.y, end.x - start.x), "bridge"),
      start,
      end,
      length,
      width,
    };
  };

  const config = {
    id: "mawizeh-marshlands",
    displayName: "MAWIZEH MARSHLANDS",
    bounds: { x: -1500, y: -1500, width: 3000, height: 3000 },
    boundary: [
      [-1430, -1380], [-700, -1470], [100, -1460], [820, -1390],
      [1320, -1260], [1450, -820], [1460, -100], [1450, 720],
      [1370, 1370], [720, 1450], [20, 1420], [-690, 1460],
      [-1280, 1350], [-1460, 820], [-1450, 100],
    ],
    waterAreas: [
      polygon("mawizeh-east-river", [
        [1050, -1500], [1500, -1500], [1500, 930], [1290, 940],
        [1160, 700], [1050, 400], [1100, 100], [1000, -200],
        [1060, -600],
      ], "water"),
      polygon("mawizeh-central-lagoon", [
        [-1500, 380], [-1200, 320], [-950, 400], [-700, 350],
        [-450, 430], [-200, 360], [50, 410], [250, 350],
        [500, 410], [750, 330], [1000, 400], [1200, 350],
        [1500, 450], [1500, 1060], [1200, 980], [950, 1050],
        [700, 980], [450, 1040], [200, 960], [-50, 1030],
        [-300, 970], [-550, 1050], [-800, 980], [-1050, 1040],
        [-1300, 960], [-1500, 1000],
      ], "water"),
    ],
    landAreas: [
      polygon("mawizeh-north-city", [
        [-1400, -1330], [1020, -1330], [1010, 300], [750, 300],
        [500, 350], [250, 300], [0, 350], [-250, 300],
        [-500, 360], [-750, 300], [-1000, 350], [-1400, 300],
      ], "urban"),
      polygon("mawizeh-south-district", [
        [-1360, 1000], [-950, 980], [-700, 1000], [-400, 970],
        [-100, 990], [220, 970], [520, 990], [820, 970],
        [1120, 1000], [1350, 990], [1360, 1380], [-1320, 1390],
      ], "urban"),
      polygon("mawizeh-central-island", [
        [180, 520], [400, 490], [650, 600], [690, 820],
        [520, 930], [280, 900], [150, 740],
      ], "urban"),
      polygon("mawizeh-west-islet", [
        [-1380, 540], [-1210, 500], [-1100, 650], [-1190, 800], [-1380, 760],
      ], "marsh"),
    ],
    swampAreas: [
      polygon("mawizeh-swamp-west-bank", [
        [-1410, -520], [-1190, -470], [-1180, -100], [-1390, -40],
      ], "swamp"),
      polygon("mawizeh-swamp-northwest", [
        [-980, -1120], [-700, -1080], [-690, -850], [-980, -820],
      ], "swamp"),
      polygon("mawizeh-swamp-west-center", [
        [-940, -420], [-720, -390], [-710, -80], [-930, -60],
      ], "swamp"),
      polygon("mawizeh-swamp-central", [
        [-560, 60], [-320, 40], [-300, 280], [-540, 310],
      ], "swamp"),
      polygon("mawizeh-swamp-east-center", [
        [420, 40], [650, 20], [690, 280], [450, 300],
      ], "swamp"),
      polygon("mawizeh-swamp-southwest", [
        [-1260, 1120], [-1000, 1090], [-950, 1320], [-1240, 1340],
      ], "swamp"),
      polygon("mawizeh-swamp-south-center", [
        [-180, 1130], [100, 1100], [130, 1350], [-170, 1370],
      ], "swamp"),
      polygon("mawizeh-swamp-southeast", [
        [690, 1120], [940, 1090], [980, 1330], [700, 1360],
      ], "swamp"),
    ],
    bridgeAreas: [
      bridge("mawizeh-west-river-bridge", { x: -850, y: 300 }, { x: -850, y: 1080 }, 136),
      bridge("mawizeh-island-north-bridge", { x: 200, y: 300 }, { x: 260, y: 570 }, 116),
      bridge("mawizeh-island-south-bridge", { x: 480, y: 880 }, { x: 520, y: 1080 }, 116),
      bridge("mawizeh-east-river-bridge", { x: 1000, y: 300 }, { x: 1120, y: 1080 }, 142),
    ],
    roads: [
      { id: "mawizeh-north-highway", width: 84, points: [[-1300, -1250], [-700, -1300], [-100, -1300], [500, -1280], [950, -1200]] },
      { id: "mawizeh-west-arterial", width: 76, points: [[-1300, -1250], [-1100, -900], [-1100, -650], [-1100, 0], [-850, 300]] },
      { id: "mawizeh-north-boulevard", width: 76, points: [[-1100, -650], [-650, -650], [-200, -650], [300, -650], [700, -650], [950, -600]] },
      { id: "mawizeh-center-boulevard", width: 78, points: [[-1100, 0], [-650, 0], [-200, 0], [300, 0], [700, 0], [1000, -40]] },
      { id: "mawizeh-center-avenue", width: 68, points: [[-200, -1300], [-200, -650], [-200, 0], [-200, 300], [200, 300]] },
      { id: "mawizeh-east-avenue", width: 72, points: [[700, -650], [700, 0], [700, 300], [1000, 300]] },
      { id: "mawizeh-west-bridge-road", width: 72, points: [[-850, 300], [-850, 1080]] },
      { id: "mawizeh-island-north-road", width: 66, points: [[200, 300], [260, 570], [230, 760], [320, 875], [480, 880]] },
      { id: "mawizeh-island-south-road", width: 66, points: [[480, 880], [520, 1080]] },
      { id: "mawizeh-east-bridge-road", width: 74, points: [[1000, 300], [1120, 1080]] },
      { id: "mawizeh-south-highway", width: 82, points: [[-1250, 1080], [-850, 1080], [-300, 1080], [520, 1080], [900, 1080], [1120, 1080], [1320, 1120]] },
      { id: "mawizeh-southwest-road", width: 70, points: [[-1250, 1080], [-850, 1350], [-300, 1350]] },
      { id: "mawizeh-south-center-road", width: 70, points: [[-300, 1080], [-300, 1350], [300, 1350], [900, 1350]] },
      { id: "mawizeh-southeast-road", width: 70, points: [[900, 1080], [900, 1350], [1250, 1320]] },
    ],
    pipeWalkways: [],
    collisionAreas: [
      orientedRect("mawizeh-northwest-compound", -850, -1050, 260, 150, -0.04),
      orientedRect("mawizeh-north-hospital", -450, -1050, 300, 170, 0.03),
      orientedRect("mawizeh-north-apartments", 40, -1040, 300, 160, -0.03),
      orientedRect("mawizeh-northeast-school", 460, -1030, 270, 150, 0.04),
      orientedRect("mawizeh-northeast-admin", 790, -980, 180, 130, -0.05),
      orientedRect("mawizeh-west-clinic", -850, -420, 190, 130, 0.04),
      orientedRect("mawizeh-central-market", -460, -390, 220, 150, -0.04),
      circle("mawizeh-round-hall", 40, -390, 92, "landmark"),
      orientedRect("mawizeh-east-market", 430, -390, 230, 150, 0.04),
      orientedRect("mawizeh-east-station", 890, -360, 160, 130, -0.04),
      orientedRect("mawizeh-west-house-one", -1250, 180, 130, 100, 0.05),
      orientedRect("mawizeh-west-house-two", -620, 190, 130, 100, -0.04),
      orientedRect("mawizeh-center-house-one", -420, 180, 125, 100, 0.04),
      orientedRect("mawizeh-center-house-two", 20, 180, 130, 100, -0.04),
      orientedRect("mawizeh-east-house-one", 480, 180, 130, 100, 0.04),
      orientedRect("mawizeh-east-house-two", 830, 160, 125, 100, -0.04),
      orientedRect("mawizeh-island-fortress", 440, 690, 260, 190, 0.08, "mall"),
      orientedRect("mawizeh-island-annex", 650, 850, 90, 130, -0.05),
      orientedRect("mawizeh-island-tower", 590, 680, 80, 110, 0.04),
      orientedRect("mawizeh-southwest-school", -1310, 1220, 220, 130, 0.04),
      orientedRect("mawizeh-southwest-clinic", -620, 1220, 200, 130, -0.04),
      orientedRect("mawizeh-south-apartment-one", -60, 1210, 180, 130, 0.04),
      orientedRect("mawizeh-south-apartment-two", 280, 1210, 180, 130, -0.04),
      orientedRect("mawizeh-southeast-compound", 620, 1210, 180, 130, 0.04),
      orientedRect("mawizeh-southeast-market", 1110, 1210, 190, 130, -0.04),
      orientedRect("mawizeh-far-east-tower", 1300, -350, 150, 180, 0.04),
      orientedRect("mawizeh-far-east-villa", 1270, 100, 150, 120, -0.04),
    ],
    coverAreas: [
      orientedRect("mawizeh-cover-northwest", -1260, -900, 52, 30, 0.05, "cover"),
      orientedRect("mawizeh-cover-north", -650, -820, 54, 30, -0.04, "cover"),
      orientedRect("mawizeh-cover-center", 260, -820, 54, 30, 0.04, "cover"),
      orientedRect("mawizeh-cover-east", 800, -820, 52, 30, -0.05, "cover"),
      orientedRect("mawizeh-cover-west-low", -1260, 150, 54, 30, 0.04, "cover"),
      orientedRect("mawizeh-cover-center-low", 260, 120, 54, 30, -0.04, "cover"),
      orientedRect("mawizeh-cover-southwest", -1350, 1200, 54, 30, 0.05, "cover"),
      orientedRect("mawizeh-cover-southeast", 1350, 1230, 54, 30, -0.05, "cover"),
    ],
    playerSpawns: [
      point("mawizeh-spawn-northwest", -1300, -1250), point("mawizeh-spawn-north", -100, -1300),
      point("mawizeh-spawn-northeast", 950, -1200), point("mawizeh-spawn-west", -1100, 0),
      point("mawizeh-spawn-southwest", -850, 1350), point("mawizeh-spawn-southeast", 900, 1350),
    ],
    ambientNodes: [
      point("mawizeh-ambient-01", -1300, -1250), point("mawizeh-ambient-02", -700, -1300),
      point("mawizeh-ambient-03", -100, -1300), point("mawizeh-ambient-04", 500, -1280),
      point("mawizeh-ambient-05", 950, -1200), point("mawizeh-ambient-06", -1100, -900),
      point("mawizeh-ambient-07", -1100, -650), point("mawizeh-ambient-08", -650, -650),
      point("mawizeh-ambient-09", -200, -650), point("mawizeh-ambient-10", 300, -650),
      point("mawizeh-ambient-11", 700, -650), point("mawizeh-ambient-12", 950, -600),
      point("mawizeh-ambient-13", -1100, 0), point("mawizeh-ambient-14", -650, 0),
      point("mawizeh-ambient-15", -200, 0), point("mawizeh-ambient-16", 300, 0),
      point("mawizeh-ambient-17", 700, 0), point("mawizeh-ambient-18", 1000, -40),
      point("mawizeh-ambient-19", -850, 300), point("mawizeh-ambient-20", 200, 300),
      point("mawizeh-ambient-21", 700, 300), point("mawizeh-ambient-22", 1000, 300),
      point("mawizeh-ambient-23", -1250, 1080), point("mawizeh-ambient-24", -850, 1080),
      point("mawizeh-ambient-25", -300, 1080), point("mawizeh-ambient-26", 520, 1080),
      point("mawizeh-ambient-27", 900, 1080), point("mawizeh-ambient-28", 1120, 1080),
      point("mawizeh-ambient-29", -850, 1350), point("mawizeh-ambient-30", 900, 1350),
    ],
    hvtLocations: [
      point("mawizeh-hvt-northwest", -1100, -650), point("mawizeh-hvt-northeast", 700, -650),
      point("mawizeh-hvt-west", -1100, 0), point("mawizeh-hvt-south", 900, 1080),
    ],
    frenzyLocations: [
      point("mawizeh-frenzy-north", -200, -650), point("mawizeh-frenzy-east", 1000, -40),
      point("mawizeh-frenzy-southwest", -850, 1080), point("mawizeh-frenzy-southeast", 1120, 1080),
    ],
    dataHeistHardDriveLocations: [
      { ...point("mawizeh-data-drive-west", -650, 0), searchCenter: { x: -540, y: -100 }, searchRadius: 245 },
      { ...point("mawizeh-data-drive-north", 300, -650), searchCenter: { x: 180, y: -760 }, searchRadius: 255 },
      { ...point("mawizeh-data-drive-east", 700, 300), searchCenter: { x: 580, y: 190 }, searchRadius: 255 },
      { ...point("mawizeh-data-drive-south", -300, 1080), searchCenter: { x: -180, y: 1180 }, searchRadius: 260 },
    ],
    dataHeistUploadStations: [
      { ...point("mawizeh-upload-northwest", -1300, -1250), clearance: 55 },
      { ...point("mawizeh-upload-northeast", 950, -1200), clearance: 55 },
      { ...point("mawizeh-upload-southwest", -1250, 1080), clearance: 55 },
      { ...point("mawizeh-upload-southeast", 1250, 1320), clearance: 55 },
    ],
    truckStarts: [
      point("mawizeh-cargo-start-northwest", -1300, -1250),
      point("mawizeh-cargo-start-northeast", 950, -1200),
    ],
    truckDestinations: [
      point("mawizeh-cargo-destination-southwest", -850, 1350),
      point("mawizeh-cargo-destination-southeast", 900, 1350),
    ],
    cargoRoutes: [
      {
        id: "mawizeh-cargo-west-crossing", startId: "mawizeh-cargo-start-northwest", destinationId: "mawizeh-cargo-destination-southwest",
        waypoints: [[-1300, -1250], [-1100, -900], [-1100, -650], [-1100, 0], [-850, 300], [-850, 1080], [-850, 1350]],
      },
      {
        id: "mawizeh-cargo-east-crossing", startId: "mawizeh-cargo-start-northeast", destinationId: "mawizeh-cargo-destination-southeast",
        waypoints: [[950, -1200], [950, -600], [700, -650], [700, 0], [700, 300], [1000, 300], [1120, 1080], [900, 1080], [900, 1350]],
      },
    ],
    anomalyBuildings: [
      { id: "mawizeh-anomaly-hospital", buildingId: "mawizeh-north-hospital", entrance: { x: -450, y: -930 }, label: "HOSPITAL ANOMALY" },
      { id: "mawizeh-anomaly-fortress", buildingId: "mawizeh-island-fortress", entrance: { x: 440, y: 865 }, label: "ISLAND ANOMALY" },
    ],
    blessingCandidates: {
      hygeian: [point("mawizeh-hygeian-west", -1100, 0), point("mawizeh-hygeian-north", 300, -650), point("mawizeh-hygeian-south", 900, 1080)],
      anarrosis: [point("mawizeh-anarrosis-northwest", -650, -650), point("mawizeh-anarrosis-east", 1000, -40), point("mawizeh-anarrosis-southwest", -1250, 1080)],
      taxytitos: [point("mawizeh-taxytitos-north", -100, -1300), point("mawizeh-taxytitos-center", -650, 0), point("mawizeh-taxytitos-southeast", 1250, 1320)],
    },
    ammoCacheCandidates: [
      point("mawizeh-ammo-northwest", -1300, -1250), point("mawizeh-ammo-north", -200, -650),
      point("mawizeh-ammo-northeast", 950, -600), point("mawizeh-ammo-west", -1100, 0),
      point("mawizeh-ammo-center", 300, 0), point("mawizeh-ammo-southwest", -850, 1350),
      point("mawizeh-ammo-southeast", 900, 1350),
    ],
    safeZone: {
      bounds: { x: -360, y: -250, width: 720, height: 500 },
      playerSpawn: { x: 0, y: 170 }, packAPunch: { x: -130, y: -25 },
      beacon: { x: 145, y: -25 }, exit: { x: 0, y: 220 },
    },
  };

  function validateMawizehMarshlandsConfig(value) {
    const errors = [];
    const requireCount = (name, list, minimum) => {
      if (!Array.isArray(list) || list.length < minimum) errors.push(`${name} requires at least ${minimum} entries`);
    };
    requireCount("roads", value.roads, 12);
    requireCount("bridgeAreas", value.bridgeAreas, 4);
    requireCount("swampAreas", value.swampAreas, 6);
    requireCount("collisionAreas", value.collisionAreas, 25);
    requireCount("ambientNodes", value.ambientNodes, 30);
    requireCount("hvtLocations", value.hvtLocations, 4);
    requireCount("frenzyLocations", value.frenzyLocations, 4);
    requireCount("dataHeistHardDriveLocations", value.dataHeistHardDriveLocations, 4);
    requireCount("dataHeistUploadStations", value.dataHeistUploadStations, 4);
    requireCount("cargoRoutes", value.cargoRoutes, 2);
    requireCount("anomalyBuildings", value.anomalyBuildings, 2);
    if (value.bounds.width < 2700 || value.bounds.height < 2700) errors.push("Mawizeh Marshlands must remain comparable to the other Outbreak maps in size");
    if (errors.length) throw new Error(`Invalid Mawizeh Marshlands map config:\n- ${errors.join("\n- ")}`);
    return true;
  }

  validateMawizehMarshlandsConfig(config);
  window.MAWIZEH_MARSHLANDS_CONFIG = config;
  window.validateMawizehMarshlandsConfig = validateMawizehMarshlandsConfig;
})();

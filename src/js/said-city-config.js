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
      ...orientedRect(id, centerX, centerY, length + 36, width, Math.atan2(end.y - start.y, end.x - start.x), "bridge"),
      start,
      end,
      length,
      width,
    };
  };

  const config = {
    id: "said-city",
    displayName: "SA'ID CITY",
    bounds: { x: -1500, y: -1500, width: 3000, height: 3000 },
    boundary: [
      [-1400, -1370], [-620, -1450], [180, -1450], [930, -1370],
      [1260, -1130], [1370, -590], [1370, 250], [1450, 780],
      [1400, 1380], [1000, 1390], [720, 1260], [340, 1260],
      [40, 1380], [-420, 1330], [-850, 1410], [-1320, 1340],
      [-1430, 900], [-1400, 180], [-1450, -520],
    ],
    waterAreas: [
      polygon("said-east-water", [
        [1080, -1500], [1500, -1500], [1500, 1500], [880, 1500],
        [900, 1050], [1030, 820], [1100, 620], [1040, 430],
        [1070, 180], [1020, -200], [1060, -600],
      ], "water"),
      polygon("said-south-harbor", [
        [-1500, 940], [-1080, 930], [-850, 990], [-610, 950],
        [-360, 1000], [-120, 930], [120, 950], [380, 900],
        [650, 930], [900, 850], [1030, 820], [1500, 920],
        [1500, 1500], [-1500, 1500],
      ], "water"),
    ],
    landAreas: [
      polygon("said-central-city", [
        [-1380, -1320], [1010, -1320], [1010, 720], [850, 850],
        [620, 860], [360, 830], [100, 900], [-160, 870],
        [-400, 920], [-650, 880], [-920, 900], [-1360, 870],
      ], "urban"),
      polygon("said-southwest-bank", [
        [-1460, 1020], [-1060, 1020], [-940, 1420], [-1400, 1450],
      ], "desert"),
      circle("said-monument-island", -20, 1110, 175, "plaza"),
      polygon("said-east-bridgehead", [
        [1120, 480], [1460, 580], [1460, 950], [1140, 900],
      ], "desert"),
    ],
    bridgeAreas: [
      bridge("said-east-causeway", { x: 960, y: 420 }, { x: 1300, y: 700 }, 122),
      bridge("said-southwest-bridge", { x: -1180, y: 850 }, { x: -1240, y: 1200 }, 122),
      bridge("said-monument-causeway", { x: -160, y: 760 }, { x: -40, y: 1030 }, 112),
    ],
    roads: [
      { id: "said-north-highway", width: 84, points: [[-1300, -1270], [-750, -1270], [-100, -1270], [500, -1270], [930, -1270]] },
      { id: "said-west-bypass", width: 78, points: [[-1300, -1270], [-1230, -900], [-1180, -800], [-1180, -250], [-1180, 250], [-1180, 760], [-1180, 850]] },
      { id: "said-hills-road", width: 72, points: [[-1180, -800], [-750, -800], [-100, -800], [500, -800], [950, -800]] },
      { id: "said-mid-boulevard", width: 78, points: [[-1180, -250], [-750, -250], [-350, -250], [-100, -250], [200, -250], [850, -250], [950, -200]] },
      { id: "said-west-residential", width: 66, points: [[-750, -800], [-750, -250], [-750, 220], [-750, 760]] },
      { id: "said-north-connector", width: 66, points: [[-100, -1270], [-100, -800], [-100, -250]] },
      { id: "said-mall-west", width: 70, points: [[-350, -250], [-350, 220], [-350, 760]] },
      { id: "said-mall-east", width: 72, points: [[850, -250], [850, 220], [850, 760], [930, 820]] },
      { id: "said-waterfront-avenue", width: 78, points: [[-1180, 760], [-750, 760], [-350, 760], [-160, 760], [200, 760], [850, 760], [930, 820]] },
      { id: "said-east-coast-road", width: 68, points: [[950, -800], [950, -500], [950, -200], [1000, 100], [960, 420]] },
      { id: "said-east-causeway-road", width: 68, points: [[960, 420], [1300, 700]] },
      { id: "said-southwest-bridge-road", width: 68, points: [[-1180, 850], [-1240, 1200]] },
      { id: "said-monument-road", width: 60, points: [[-160, 760], [-40, 1030]] },
    ],
    pipeWalkways: [],
    collisionAreas: [
      orientedRect("said-central-mall", 250, 250, 520, 330, 0, "mall"),
      orientedRect("said-mall-north-wing", 250, 10, 420, 110, 0, "mall"),
      orientedRect("said-mall-west-wing", -120, 280, 120, 390, 0, "mall"),
      orientedRect("said-mall-east-wing", 630, 280, 150, 420, 0, "mall"),
      orientedRect("said-mall-south-wing", 250, 570, 540, 120, 0, "mall"),
      orientedRect("said-bus-terminal", 700, 580, 100, 150, 0, "mall"),
      orientedRect("said-northwest-warehouse", -950, -1040, 260, 112, -0.04),
      orientedRect("said-northwest-apartments", -610, -1050, 180, 105, 0.03),
      orientedRect("said-north-clinic", -380, -1040, 175, 110, -0.05),
      orientedRect("said-hills-villa-one", 210, -1050, 160, 110, 0.08),
      orientedRect("said-hills-villa-two", 500, -1060, 175, 105, -0.06),
      orientedRect("said-hills-villa-three", 760, -1050, 145, 105, 0.05),
      orientedRect("said-west-block-north", -980, -540, 170, 125, 0.03),
      orientedRect("said-mid-block-north", -540, -535, 165, 125, -0.04),
      orientedRect("said-hill-house-one", 210, -545, 150, 112, 0.06),
      orientedRect("said-hill-house-two", 500, -555, 145, 110, -0.05),
      orientedRect("said-hill-house-three", 740, -535, 125, 112, 0.04),
      orientedRect("said-west-apartment-one", -980, 10, 150, 125, 0.03),
      orientedRect("said-west-apartment-two", -980, 300, 150, 130, -0.04),
      orientedRect("said-west-apartment-three", -980, 575, 150, 125, 0.04),
      orientedRect("said-residential-one", -550, 20, 150, 125, -0.03),
      orientedRect("said-residential-two", -550, 320, 150, 130, 0.04),
      orientedRect("said-residential-three", -550, 590, 145, 120, -0.04),
      orientedRect("said-east-waterfront-hotel", 760, 40, 105, 135, 0.04),
      orientedRect("said-east-waterfront-office", 760, 520, 105, 120, -0.04),
      circle("said-roundabout-monument", -20, 1110, 78, "landmark"),
      orientedRect("said-east-bridge-security", 1400, 840, 78, 88, 0.2),
      orientedRect("said-southwest-gatehouse", -1080, 1320, 90, 90, -0.1),
    ],
    coverAreas: [
      orientedRect("said-cover-northwest", -1080, -650, 52, 30, 0.05, "cover"),
      orientedRect("said-cover-hills", -860, -650, 54, 30, -0.08, "cover"),
      orientedRect("said-cover-midwest", -650, -100, 56, 32, 0.06, "cover"),
      orientedRect("said-cover-north-plaza", 100, -130, 56, 30, -0.04, "cover"),
      orientedRect("said-cover-east-plaza", 720, -110, 52, 30, 0.08, "cover"),
      orientedRect("said-cover-southwest", -900, 650, 56, 32, -0.05, "cover"),
      orientedRect("said-cover-waterfront", 720, 690, 52, 30, 0.04, "cover"),
      orientedRect("said-cover-island", 105, 1150, 46, 28, -0.08, "cover"),
    ],
    playerSpawns: [
      point("said-spawn-northwest", -1300, -1270), point("said-spawn-north", 500, -1270),
      point("said-spawn-northeast", 950, -800), point("said-spawn-west", -1180, 760),
      point("said-spawn-waterfront", 930, 820), point("said-spawn-east-bank", 1300, 700),
    ],
    ambientNodes: [
      point("said-ambient-01", -1300, -1270), point("said-ambient-02", -750, -1270),
      point("said-ambient-03", -100, -1270), point("said-ambient-04", 500, -1270),
      point("said-ambient-05", 930, -1270), point("said-ambient-06", -1230, -900),
      point("said-ambient-07", -1180, -800), point("said-ambient-08", -750, -800),
      point("said-ambient-09", -100, -800), point("said-ambient-10", 500, -800),
      point("said-ambient-11", 950, -800), point("said-ambient-12", -1180, -250),
      point("said-ambient-13", -750, -250), point("said-ambient-14", -350, -250),
      point("said-ambient-15", -100, -250), point("said-ambient-16", 200, -250),
      point("said-ambient-17", 850, -250), point("said-ambient-18", 950, -200),
      point("said-ambient-19", -1180, 250), point("said-ambient-20", -750, 220),
      point("said-ambient-21", -350, 220), point("said-ambient-22", 850, 220),
      point("said-ambient-23", 1000, 100), point("said-ambient-24", -1180, 760),
      point("said-ambient-25", -750, 760), point("said-ambient-26", -350, 760),
      point("said-ambient-27", -160, 760), point("said-ambient-28", 850, 760),
      point("said-ambient-29", 930, 820), point("said-ambient-30", 1300, 700),
    ],
    hvtLocations: [
      point("said-hvt-west", -1180, -500), point("said-hvt-hills", 500, -800),
      point("said-hvt-mall", -350, 220), point("said-hvt-waterfront", 930, 820),
    ],
    frenzyLocations: [
      point("said-frenzy-west", -750, -250), point("said-frenzy-northeast", 950, -500),
      point("said-frenzy-waterfront", -750, 760), point("said-frenzy-east-bank", 1300, 700),
    ],
    dataHeistHardDriveLocations: [
      { ...point("said-data-drive-residential", -750, 220), searchCenter: { x: -640, y: 130 }, searchRadius: 235 },
      { ...point("said-data-drive-hills", -100, -800), searchCenter: { x: 20, y: -710 }, searchRadius: 240 },
      { ...point("said-data-drive-mall", 850, 220), searchCenter: { x: 720, y: 130 }, searchRadius: 245 },
      { ...point("said-data-drive-waterfront", -350, 760), searchCenter: { x: -230, y: 660 }, searchRadius: 250 },
    ],
    dataHeistUploadStations: [
      { ...point("said-upload-northwest", -1300, -1270), clearance: 55 },
      { ...point("said-upload-northeast", 930, -1270), clearance: 55 },
      { ...point("said-upload-southwest", -1360, 1120), clearance: 55 },
      { ...point("said-upload-east-bank", 1400, 700), clearance: 55 },
    ],
    truckStarts: [
      point("said-cargo-start-west", -1300, -1270),
      point("said-cargo-start-northeast", 930, -1270),
    ],
    truckDestinations: [
      point("said-cargo-destination-east", 1300, 700),
      point("said-cargo-destination-southwest", -1240, 1200),
    ],
    cargoRoutes: [
      {
        id: "said-cargo-west-east", startId: "said-cargo-start-west", destinationId: "said-cargo-destination-east",
        waypoints: [[-1300, -1270], [-750, -1270], [-100, -1270], [-100, -800], [500, -800], [950, -800], [950, -500], [950, -200], [1000, 100], [960, 420], [1300, 700]],
      },
      {
        id: "said-cargo-north-southwest", startId: "said-cargo-start-northeast", destinationId: "said-cargo-destination-southwest",
        waypoints: [[930, -1270], [500, -1270], [-100, -1270], [-100, -800], [-750, -800], [-750, -250], [-1180, -250], [-1180, 250], [-1180, 760], [-1180, 850], [-1240, 1200]],
      },
    ],
    anomalyBuildings: [
      { id: "said-anomaly-mall", buildingId: "said-mall-north-wing", entrance: { x: 250, y: -105 }, label: "CITY CENTER ANOMALY" },
      { id: "said-anomaly-residential", buildingId: "said-west-apartment-three", entrance: { x: -980, y: 680 }, label: "RESIDENTIAL ANOMALY" },
    ],
    blessingCandidates: {
      hygeian: [point("said-hygeian-west", -1180, 250), point("said-hygeian-east", 950, -200), point("said-hygeian-waterfront", 200, 760)],
      anarrosis: [point("said-anarrosis-north", -100, -800), point("said-anarrosis-west", -750, 220), point("said-anarrosis-east-bank", 1400, 700)],
      taxytitos: [point("said-taxytitos-northwest", -750, -1270), point("said-taxytitos-mall", 850, 220), point("said-taxytitos-southwest", -750, 760)],
    },
    ammoCacheCandidates: [
      point("said-ammo-northwest", -1300, -1270), point("said-ammo-north", 500, -1270),
      point("said-ammo-northeast", 950, -800), point("said-ammo-west", -1180, -250),
      point("said-ammo-mall", -350, 220), point("said-ammo-waterfront", 930, 820),
      point("said-ammo-east-bank", 1400, 700),
    ],
    safeZone: {
      bounds: { x: -360, y: -250, width: 720, height: 500 },
      playerSpawn: { x: 0, y: 170 }, packAPunch: { x: -130, y: -25 },
      beacon: { x: 145, y: -25 }, exit: { x: 0, y: 220 },
    },
  };

  function validateSaidCityConfig(value) {
    const errors = [];
    const requireCount = (name, list, minimum) => {
      if (!Array.isArray(list) || list.length < minimum) errors.push(`${name} requires at least ${minimum} entries`);
    };
    requireCount("roads", value.roads, 10);
    requireCount("bridgeAreas", value.bridgeAreas, 3);
    requireCount("collisionAreas", value.collisionAreas, 25);
    requireCount("ambientNodes", value.ambientNodes, 30);
    requireCount("hvtLocations", value.hvtLocations, 4);
    requireCount("frenzyLocations", value.frenzyLocations, 4);
    requireCount("dataHeistHardDriveLocations", value.dataHeistHardDriveLocations, 4);
    requireCount("dataHeistUploadStations", value.dataHeistUploadStations, 4);
    requireCount("cargoRoutes", value.cargoRoutes, 2);
    requireCount("anomalyBuildings", value.anomalyBuildings, 2);
    if (value.bounds.width < 2700 || value.bounds.height < 2700) errors.push("Sa'id City must remain comparable to the other Outbreak maps in size");
    if (errors.length) throw new Error(`Invalid Sa'id City map config:\n- ${errors.join("\n- ")}`);
    return true;
  }

  validateSaidCityConfig(config);
  window.SAID_CITY_CONFIG = config;
  window.validateSaidCityConfig = validateSaidCityConfig;
})();

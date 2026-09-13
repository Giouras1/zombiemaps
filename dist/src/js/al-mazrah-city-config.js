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
  const circle = (id, x, y, radius, kind = "building") => ({
    id,
    x,
    y,
    width: radius * 2,
    height: radius * 2,
    kind,
    points: Array.from({ length: 20 }, (_, index) => {
      const angle = (index / 20) * Math.PI * 2;
      return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
    }),
  });
  const bridge = (id, start, end, width) => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const length = Math.hypot(deltaX, deltaY);
    return {
      ...orientedRect(
        id,
        (start.x + end.x) / 2,
        (start.y + end.y) / 2,
        length,
        width,
        Math.atan2(deltaY, deltaX),
        "bridge",
      ),
      start,
      end,
      length,
    };
  };

  const config = {
    id: "al-mazrah-city",
    displayName: "AL MAZRAH CITY",
    scale: {
      relativeToStandardOutbreakMap: 2,
      note: "Twice the linear dimensions of the standard 3000 x 3000 Outbreak maps",
    },
    bounds: { x: -3000, y: -3000, width: 6000, height: 6000 },
    boundary: [
      [-2820, -2760], [-2050, -2910], [-1050, -2950], [0, -2920],
      [1050, -2880], [2050, -2780], [2740, -2480], [2880, -1500],
      [2920, -400], [2880, 700], [2820, 1750], [2640, 2670],
      [1700, 2860], [700, 2920], [-300, 2890], [-1350, 2920],
      [-2280, 2810], [-2780, 2440], [-2900, 1450], [-2940, 350],
      [-2910, -750], [-2880, -1780],
    ],
    waterAreas: [
      polygon("almazrah-northwest-reservoir", [
        [-2200, -3000], [-750, -3000], [-720, -2540], [-760, -2180],
        [-1120, -1840], [-1780, -1880], [-2150, -2240],
      ], "water"),
      polygon("almazrah-west-city-canal", [
        [-1880, -2000], [-1120, -1930], [-1030, -1500], [-1160, -1050],
        [-1080, -520], [-1190, 0], [-1110, 580], [-1380, 960],
        [-1950, 850], [-2050, 300], [-1960, -260], [-2070, -900],
        [-1980, -1480],
      ], "water"),
      polygon("almazrah-south-river", [
        [-3000, 820], [-2440, 790], [-1940, 850], [-1380, 960],
        [-900, 850], [-350, 900], [200, 850], [760, 900],
        [1300, 850], [1800, 800], [2200, 950], [2310, 1450],
        [2150, 1910], [1600, 2010], [1050, 1910], [500, 1980],
        [-100, 1910], [-700, 2010], [-1300, 1910], [-1900, 2010],
        [-2500, 1910], [-3000, 1810],
      ], "water"),
      polygon("almazrah-east-river", [
        [2170, -3000], [3000, -3000], [3000, 2520], [2700, 2620],
        [2360, 2240], [2150, 1910], [2310, 1450], [2200, 950],
        [2050, 420], [2120, -250], [2010, -920], [2100, -1600],
      ], "water"),
    ],
    landAreas: [
      polygon("almazrah-civic-island", [
        [-170, 940], [210, 850], [760, 920], [1040, 1190],
        [920, 1740], [520, 1880], [180, 1840], [-170, 1540],
      ], "urban"),
      polygon("almazrah-west-marina-island", [
        [-1940, 1010], [-1530, 1050], [-1320, 1310], [-1480, 1640],
        [-1910, 1590], [-2070, 1280],
      ], "urban"),
    ],
    swampAreas: [],
    bridgeAreas: [
      bridge("almazrah-upper-canal-bridge", { x: -2070, y: -1700 }, { x: -1030, y: -1700 }, 190),
      bridge("almazrah-mid-canal-bridge", { x: -2070, y: -700 }, { x: -1030, y: -700 }, 184),
      bridge("almazrah-lower-canal-bridge", { x: -2050, y: 400 }, { x: -1050, y: 400 }, 184),
      bridge("almazrah-southwest-freeway-bridge", { x: -2450, y: 760 }, { x: -2450, y: 2040 }, 210),
      bridge("almazrah-south-central-bridge", { x: -750, y: 830 }, { x: -750, y: 2040 }, 198),
      bridge("almazrah-civic-north-bridge", { x: 100, y: 830 }, { x: 100, y: 1060 }, 184),
      bridge("almazrah-civic-south-bridge", { x: 300, y: 1740 }, { x: 300, y: 1980 }, 184),
      bridge("almazrah-east-freeway-bridge", { x: 1650, y: 780 }, { x: 1650, y: 2050 }, 214),
    ],
    roads: [
      { id: "almazrah-west-perimeter", width: 92, points: [[-2660, -2600], [-2500, -1700], [-2500, -700], [-2500, 400], [-2450, 760]] },
      { id: "almazrah-north-axis", width: 90, points: [[-600, -2700], [-600, -1700], [-600, -700], [-600, 400], [-750, 830]] },
      { id: "almazrah-civic-axis", width: 92, points: [[500, -2700], [500, -1700], [500, -700], [500, 400], [100, 830]] },
      { id: "almazrah-east-axis", width: 90, points: [[1500, -2600], [1500, -1700], [1500, -700], [1500, 400], [1650, 780]] },
      { id: "almazrah-east-ring-road", width: 86, points: [[1950, -2500], [1900, -1700], [1900, -700], [1900, 400], [1650, 780]] },
      { id: "almazrah-upper-boulevard", width: 98, points: [[-2600, -1700], [-2070, -1700], [-1030, -1700], [-600, -1700], [500, -1700], [1500, -1700], [1900, -1700]] },
      { id: "almazrah-mid-boulevard", width: 94, points: [[-2600, -700], [-2070, -700], [-1030, -700], [-600, -700], [500, -700], [1500, -700], [1900, -700]] },
      { id: "almazrah-lower-boulevard", width: 94, points: [[-2600, 400], [-2050, 400], [-1050, 400], [-600, 400], [500, 400], [1500, 400], [1900, 400]] },
      { id: "almazrah-southwest-bridge-road", width: 100, points: [[-2450, 760], [-2450, 2040], [-2450, 2400]] },
      { id: "almazrah-south-central-bridge-road", width: 96, points: [[-750, 830], [-750, 2040], [-750, 2500]] },
      { id: "almazrah-civic-island-road", width: 88, points: [[100, 830], [100, 1060], [260, 1260], [300, 1500], [300, 1740], [300, 1980], [300, 2500]] },
      { id: "almazrah-east-bridge-road", width: 102, points: [[1650, 780], [1650, 2050], [1650, 2450]] },
      { id: "almazrah-south-boulevard", width: 104, points: [[-2700, 2400], [-2450, 2400], [-1500, 2450], [-750, 2500], [300, 2500], [1000, 2480], [1650, 2450], [2050, 2400]] },
      { id: "almazrah-southwest-avenue", width: 82, points: [[-1500, 2010], [-1500, 2450], [-1500, 2750]] },
      { id: "almazrah-north-cross-street", width: 78, points: [[-600, -2500], [500, -2500], [1500, -2450], [1950, -2500]] },
      { id: "almazrah-government-loop", width: 74, points: [[-600, -1100], [-100, -1100], [400, -1100], [900, -1100], [1400, -1100]] },
    ],
    pipeWalkways: [],
    collisionAreas: [
      orientedRect("almazrah-west-fort", -2320, -2280, 220, 300, -0.08),
      orientedRect("almazrah-northwest-office", -260, -2300, 360, 250, 0.04),
      orientedRect("almazrah-north-ministry", 920, -2220, 430, 270, -0.05, "mall"),
      orientedRect("almazrah-northeast-tower", 1700, -2180, 210, 310, 0.05),
      orientedRect("almazrah-upper-west-block", -820, -1240, 190, 260, -0.04),
      orientedRect("almazrah-upper-apartments-a", -280, -1300, 270, 250, 0.04),
      orientedRect("almazrah-upper-apartments-b", 160, -1300, 250, 230, -0.04),
      circle("almazrah-grand-round-tower", 860, -1320, 125, "landmark"),
      orientedRect("almazrah-upper-east-block", 1220, -1300, 230, 250, 0.04),
      orientedRect("almazrah-ring-tower", 1710, -1270, 180, 260, -0.04),
      orientedRect("almazrah-west-riverside-block", -2270, -180, 250, 290, 0.04),
      orientedRect("almazrah-mid-west-block", -820, -170, 190, 250, -0.04),
      orientedRect("almazrah-central-market-a", -250, -180, 290, 250, 0.04),
      orientedRect("almazrah-central-market-b", 180, -170, 250, 230, -0.04),
      orientedRect("almazrah-embassy", 900, -170, 420, 270, 0.04, "mall"),
      orientedRect("almazrah-east-apartments", 1710, -160, 180, 250, -0.04),
      orientedRect("almazrah-civic-palace", 690, 1370, 330, 310, 0.05, "mall"),
      orientedRect("almazrah-marina-hotel", -1690, 1310, 260, 260, -0.04),
      orientedRect("almazrah-southwest-depot", -2700, 2180, 170, 190, 0.05),
      orientedRect("almazrah-southwest-school", -2000, 2160, 300, 210, -0.04),
      orientedRect("almazrah-south-clinic", -1110, 2200, 260, 190, 0.04),
      orientedRect("almazrah-south-apartments-a", -260, 2200, 280, 190, -0.04),
      orientedRect("almazrah-south-apartments-b", 780, 2180, 300, 200, 0.04),
      orientedRect("almazrah-south-market", 1290, 2200, 240, 190, -0.04),
      orientedRect("almazrah-southwest-lowrise", -2200, 2700, 260, 150, 0.04),
      orientedRect("almazrah-southwest-villas", -1050, 2730, 300, 140, -0.04),
      orientedRect("almazrah-south-civic", -200, 2730, 260, 140, 0.04),
      orientedRect("almazrah-southeast-lowrise", 780, 2720, 280, 140, -0.04),
      orientedRect("almazrah-southeast-villas", 1500, 2700, 230, 140, 0.04),
      orientedRect("almazrah-far-east-observatory", 2600, -1450, 220, 260, 0.05),
      orientedRect("almazrah-far-east-villa", 2550, -500, 230, 180, -0.04),
    ],
    coverAreas: [
      orientedRect("almazrah-cover-west-north", -2700, -1250, 70, 42, 0.04, "cover"),
      orientedRect("almazrah-cover-north", 250, -2050, 74, 42, -0.05, "cover"),
      orientedRect("almazrah-cover-upper", 1250, -2050, 72, 42, 0.04, "cover"),
      orientedRect("almazrah-cover-west-center", -2700, -250, 72, 42, -0.05, "cover"),
      orientedRect("almazrah-cover-center", 250, -450, 74, 42, 0.04, "cover"),
      orientedRect("almazrah-cover-east", 1250, -450, 72, 42, -0.05, "cover"),
      orientedRect("almazrah-cover-marina", -1840, 1120, 70, 42, 0.04, "cover"),
      orientedRect("almazrah-cover-island", 400, 1120, 70, 42, -0.05, "cover"),
      orientedRect("almazrah-cover-southwest", -2750, 2550, 72, 42, 0.04, "cover"),
      orientedRect("almazrah-cover-south", 520, 2250, 72, 42, -0.05, "cover"),
      orientedRect("almazrah-cover-southeast", 2050, 2200, 70, 42, 0.04, "cover"),
      orientedRect("almazrah-cover-east-bank", 1780, 200, 70, 42, -0.05, "cover"),
    ],
    playerSpawns: [
      point("almazrah-spawn-northwest", -2600, -1700),
      point("almazrah-spawn-north", -600, -2500),
      point("almazrah-spawn-northeast", 1900, -1700),
      point("almazrah-spawn-west", -2600, 400),
      point("almazrah-spawn-center", 500, 400),
      point("almazrah-spawn-southwest", -2450, 2400),
      point("almazrah-spawn-south", 300, 2500),
      point("almazrah-spawn-southeast", 1650, 2450),
    ],
    ambientNodes: [
      point("almazrah-ambient-01", -2660, -2600), point("almazrah-ambient-02", -2600, -1700),
      point("almazrah-ambient-03", -2500, -700), point("almazrah-ambient-04", -2600, 400),
      point("almazrah-ambient-05", -600, -2700), point("almazrah-ambient-06", 500, -2700),
      point("almazrah-ambient-07", 1500, -2600), point("almazrah-ambient-08", 1950, -2500),
      point("almazrah-ambient-09", -600, -1700), point("almazrah-ambient-10", 500, -1700),
      point("almazrah-ambient-11", 1500, -1700), point("almazrah-ambient-12", 1900, -1700),
      point("almazrah-ambient-13", -600, -700), point("almazrah-ambient-14", 500, -700),
      point("almazrah-ambient-15", 1500, -700), point("almazrah-ambient-16", 1900, -700),
      point("almazrah-ambient-17", -600, 400), point("almazrah-ambient-18", 500, 400),
      point("almazrah-ambient-19", 1500, 400), point("almazrah-ambient-20", 1900, 400),
      point("almazrah-ambient-21", -2450, 760), point("almazrah-ambient-22", -750, 830),
      point("almazrah-ambient-23", 100, 830), point("almazrah-ambient-24", 1650, 780),
      point("almazrah-ambient-25", -2450, 2040), point("almazrah-ambient-26", -750, 2040),
      point("almazrah-ambient-27", 300, 1980), point("almazrah-ambient-28", 1650, 2050),
      point("almazrah-ambient-29", -2450, 2400), point("almazrah-ambient-30", -1500, 2450),
      point("almazrah-ambient-31", -750, 2500), point("almazrah-ambient-32", 300, 2500),
      point("almazrah-ambient-33", 1000, 2480), point("almazrah-ambient-34", 1650, 2450),
      point("almazrah-ambient-35", -100, -1100), point("almazrah-ambient-36", 400, -1100),
      point("almazrah-ambient-37", 1400, -1100), point("almazrah-ambient-38", -600, -2500),
      point("almazrah-ambient-39", 500, -2500), point("almazrah-ambient-40", 1500, -2450),
    ],
    hvtLocations: [
      point("almazrah-hvt-northwest", -2600, -1700), point("almazrah-hvt-north", 500, -1700),
      point("almazrah-hvt-east", 1900, -700), point("almazrah-hvt-west", -2600, 400),
      point("almazrah-hvt-southwest", -2450, 2400), point("almazrah-hvt-southeast", 1650, 2450),
    ],
    frenzyLocations: [
      point("almazrah-frenzy-north", -600, -2500), point("almazrah-frenzy-upper", 1500, -1700),
      point("almazrah-frenzy-center", 500, 400), point("almazrah-frenzy-west", -2500, -700),
      point("almazrah-frenzy-south", 300, 2500), point("almazrah-frenzy-southeast", 1650, 2050),
    ],
    dataHeistHardDriveLocations: [
      { ...point("almazrah-data-drive-northwest", -2600, -700), searchCenter: { x: -2460, y: -860 }, searchRadius: 420 },
      { ...point("almazrah-data-drive-north", 500, -2500), searchCenter: { x: 320, y: -2320 }, searchRadius: 440 },
      { ...point("almazrah-data-drive-center", -600, -700), searchCenter: { x: -430, y: -560 }, searchRadius: 410 },
      { ...point("almazrah-data-drive-east", 1900, 400), searchCenter: { x: 1710, y: 230 }, searchRadius: 430 },
      { ...point("almazrah-data-drive-island", 300, 1500), searchCenter: { x: 470, y: 1370 }, searchRadius: 390 },
      { ...point("almazrah-data-drive-south", -1500, 2450), searchCenter: { x: -1320, y: 2600 }, searchRadius: 430 },
    ],
    dataHeistUploadStations: [
      { ...point("almazrah-upload-northwest", -2660, -2600), clearance: 60 },
      { ...point("almazrah-upload-north", 1500, -2600), clearance: 60 },
      { ...point("almazrah-upload-west", -2600, 400), clearance: 60 },
      { ...point("almazrah-upload-southwest", -2450, 2400), clearance: 60 },
      { ...point("almazrah-upload-south", 300, 2500), clearance: 60 },
      { ...point("almazrah-upload-southeast", 1650, 2450), clearance: 60 },
    ],
    truckStarts: [
      point("almazrah-cargo-start-west", -2600, -700),
      point("almazrah-cargo-start-north", -600, -2500),
      point("almazrah-cargo-start-east", 1900, -1700),
    ],
    truckDestinations: [
      point("almazrah-cargo-destination-southwest", -2450, 2400),
      point("almazrah-cargo-destination-south", -750, 2500),
      point("almazrah-cargo-destination-southeast", 1650, 2450),
    ],
    cargoRoutes: [
      {
        id: "almazrah-cargo-west-southwest",
        startId: "almazrah-cargo-start-west",
        destinationId: "almazrah-cargo-destination-southwest",
        waypoints: [[-2600, -700], [-2500, -700], [-2500, 400], [-2450, 760], [-2450, 2040], [-2450, 2400]],
      },
      {
        id: "almazrah-cargo-north-south",
        startId: "almazrah-cargo-start-north",
        destinationId: "almazrah-cargo-destination-south",
        waypoints: [[-600, -2500], [-600, -1700], [-600, -700], [-600, 400], [-750, 830], [-750, 2040], [-750, 2500]],
      },
      {
        id: "almazrah-cargo-east-southeast",
        startId: "almazrah-cargo-start-east",
        destinationId: "almazrah-cargo-destination-southeast",
        waypoints: [[1900, -1700], [1500, -1700], [1500, -700], [1500, 400], [1650, 780], [1650, 2050], [1650, 2450]],
      },
    ],
    anomalyBuildings: [
      { id: "almazrah-anomaly-ministry", buildingId: "almazrah-north-ministry", entrance: { x: 920, y: -2020 }, label: "MINISTRY ANOMALY" },
      { id: "almazrah-anomaly-embassy", buildingId: "almazrah-embassy", entrance: { x: 900, y: 30 }, label: "EMBASSY ANOMALY" },
      { id: "almazrah-anomaly-palace", buildingId: "almazrah-civic-palace", entrance: { x: 690, y: 1585 }, label: "PALACE ANOMALY" },
    ],
    blessingCandidates: {
      hygeian: [
        point("almazrah-hygeian-west", -2500, -700), point("almazrah-hygeian-center", 500, -700),
        point("almazrah-hygeian-south", 300, 2500), point("almazrah-hygeian-southeast", 1650, 2450),
      ],
      anarrosis: [
        point("almazrah-anarrosis-north", -600, -1700), point("almazrah-anarrosis-east", 1500, 400),
        point("almazrah-anarrosis-southwest", -1500, 2450), point("almazrah-anarrosis-south", -750, 2500),
      ],
      taxytitos: [
        point("almazrah-taxytitos-west", -2600, 400), point("almazrah-taxytitos-northeast", 1900, -1700),
        point("almazrah-taxytitos-south", 1000, 2480), point("almazrah-taxytitos-island", 300, 1500),
      ],
    },
    ammoCacheCandidates: [
      point("almazrah-ammo-northwest", -2600, -1700), point("almazrah-ammo-north", -600, -2500),
      point("almazrah-ammo-northeast", 1900, -1700), point("almazrah-ammo-west", -2600, 400),
      point("almazrah-ammo-center", 500, 400), point("almazrah-ammo-east", 1900, 400),
      point("almazrah-ammo-southwest", -2450, 2400), point("almazrah-ammo-southwest-inner", -1500, 2450),
      point("almazrah-ammo-south", 300, 2500), point("almazrah-ammo-southeast", 1650, 2450),
    ],
    safeZone: {
      bounds: { x: 0, y: 0, width: 820, height: 560 },
      playerSpawn: { x: -230, y: 0 },
      packAPunch: { x: 0, y: -70 },
      beacon: { x: 220, y: 0 },
      exit: { x: 0, y: 210 },
    },
  };

  function validateAlMazrahCityConfig(value) {
    if (!value || value.id !== "al-mazrah-city") throw new Error("Al Mazrah City config is missing");
    if (value.bounds.width !== 6000 || value.bounds.height !== 6000) throw new Error("Al Mazrah City must remain twice the standard map dimensions");
    const requireCount = (name, list, minimum) => {
      if (!Array.isArray(list) || list.length < minimum) throw new Error(`Al Mazrah City ${name} requires at least ${minimum} entries`);
    };
    requireCount("boundary", value.boundary, 8);
    requireCount("waterAreas", value.waterAreas, 4);
    requireCount("bridgeAreas", value.bridgeAreas, 8);
    requireCount("roads", value.roads, 14);
    requireCount("collisionAreas", value.collisionAreas, 28);
    requireCount("playerSpawns", value.playerSpawns, 8);
    requireCount("ambientNodes", value.ambientNodes, 36);
    requireCount("hvtLocations", value.hvtLocations, 6);
    requireCount("frenzyLocations", value.frenzyLocations, 6);
    requireCount("dataHeistHardDriveLocations", value.dataHeistHardDriveLocations, 6);
    requireCount("dataHeistUploadStations", value.dataHeistUploadStations, 6);
    requireCount("cargoRoutes", value.cargoRoutes, 3);
    requireCount("anomalyBuildings", value.anomalyBuildings, 3);
    requireCount("ammoCacheCandidates", value.ammoCacheCandidates, 10);
    for (const [type, candidates] of Object.entries(value.blessingCandidates || {})) {
      requireCount(`${type} blessingCandidates`, candidates, 4);
    }
    return true;
  }

  validateAlMazrahCityConfig(config);
  window.AL_MAZRAH_CITY_CONFIG = config;
  window.validateAlMazrahCityConfig = validateAlMazrahCityConfig;
})();

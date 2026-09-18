(function () {
  "use strict";

  const point = (id, x, y, poi) => ({ id, x, y, poi });
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
  const withSearchArea = (entry, searchX, searchY, searchRadius = 360) => ({
    ...entry,
    searchCenter: { x: searchX, y: searchY },
    searchRadius,
  });

  const poiLabels = [
    point("poi-oganikku-farms", -1740, -1760, "oganikku-farms"),
    point("poi-town-center", -1840, -270, "town-center"),
    point("poi-beach-club", -1320, 1780, "beach-club"),
    point("poi-tsuki-castle", 260, -120, "tsuki-castle"),
    point("poi-residential", 1320, -1510, "residential"),
    point("poi-shipwreck", 2240, -260, "shipwreck"),
    point("poi-port-ashika", 1190, 1650, "port-ashika"),
  ].map((entry) => ({
    ...entry,
    label: {
      "oganikku-farms": "OGANIKKU FARMS",
      "town-center": "TOWN CENTER",
      "beach-club": "BEACH CLUB",
      "tsuki-castle": "TSUKI CASTLE",
      "residential": "RESIDENTIAL",
      "shipwreck": "SHIPWRECK",
      "port-ashika": "PORT ASHIKA",
    }[entry.poi],
  }));

  const difficultyRegions = [
    {
      poi: "oganikku-farms", label: "OGANIKKU FARMS", tier: 1, effectiveRound: 4,
      points: [[-2490, -2750], [-700, -2700], [-700, -1080], [-980, -900], [-2640, -900], [-2710, -1370]],
    },
    {
      poi: "residential", label: "RESIDENTIAL", tier: 1, effectiveRound: 4,
      points: [[-700, -2700], [1120, -2670], [2050, -2350], [2690, -1260], [2350, -1050], [1600, -1030], [980, -1030], [-700, -1080]],
    },
    {
      poi: "shipwreck", label: "SHIPWRECK", tier: 1, effectiveRound: 4,
      points: [[1600, -1030], [2350, -1050], [2690, -1260], [2700, -650], [2580, -80], [2520, 620], [2300, 940], [1540, 760], [1450, 160], [1500, -420]],
    },
    {
      poi: "town-center", label: "TOWN CENTER", tier: 2, effectiveRound: 16,
      points: [[-2640, -900], [-980, -900], [-1080, 420], [-850, 880], [-2320, 940], [-2320, 470], [-2670, 210], [-2790, -480]],
    },
    {
      poi: "beach-club", label: "BEACH CLUB", tier: 2, effectiveRound: 16,
      points: [[-2320, 940], [-850, 880], [-480, 1180], [300, 2500], [-790, 2570], [-1530, 2520], [-2100, 2320], [-2310, 1820], [-2160, 1270]],
    },
    {
      poi: "tsuki-castle", label: "TSUKI CASTLE", tier: 3, effectiveRound: 45,
      points: [[-980, -850], [-700, -1080], [980, -1030], [1600, -1030], [1500, -420], [1450, 160], [1540, 760], [700, 820], [-480, 900], [-850, 880], [-1080, 420]],
    },
    {
      poi: "port-ashika", label: "PORT ASHIKA", tier: 3, effectiveRound: 45,
      points: [[-480, 900], [700, 820], [1540, 760], [2300, 940], [2410, 1390], [2200, 1940], [1880, 2320], [1320, 2700], [620, 2790], [300, 2500]],
    },
  ];

  const ambientNodes = [
    point("ashika-ambient-farms-01", -2260, -1940, "oganikku-farms"),
    point("ashika-ambient-farms-02", -2030, -1520, "oganikku-farms"),
    point("ashika-ambient-farms-03", -1680, -2070, "oganikku-farms"),
    point("ashika-ambient-farms-04", -1420, -1660, "oganikku-farms"),
    point("ashika-ambient-farms-05", -1980, -1170, "oganikku-farms"),
    point("ashika-ambient-farms-06", -1540, -1210, "oganikku-farms"),
    point("ashika-ambient-farms-07", -1140, -1920, "oganikku-farms"),
    point("ashika-ambient-farms-08", -1080, -1420, "oganikku-farms"),

    point("ashika-ambient-town-01", -2300, -710, "town-center"),
    point("ashika-ambient-town-02", -2070, -380, "town-center"),
    point("ashika-ambient-town-03", -1700, -780, "town-center"),
    point("ashika-ambient-town-04", -1450, -410, "town-center"),
    point("ashika-ambient-town-05", -2400, -90, "town-center"),
    point("ashika-ambient-town-06", -1770, 220, "town-center"),
    point("ashika-ambient-town-07", -1240, 200, "town-center"),
    point("ashika-ambient-town-08", -1100, -620, "town-center"),

    point("ashika-ambient-beach-01", -2010, 1120, "beach-club"),
    point("ashika-ambient-beach-02", -1690, 1030, "beach-club"),
    point("ashika-ambient-beach-03", -1320, 1190, "beach-club"),
    point("ashika-ambient-beach-04", -1960, 1580, "beach-club"),
    point("ashika-ambient-beach-05", -1590, 1540, "beach-club"),
    point("ashika-ambient-beach-06", -1100, 1570, "beach-club"),
    point("ashika-ambient-beach-07", -1430, 2100, "beach-club"),
    point("ashika-ambient-beach-08", -820, 1980, "beach-club"),

    point("ashika-ambient-castle-01", -820, -650, "tsuki-castle"),
    point("ashika-ambient-castle-02", -90, -820, "tsuki-castle"),
    point("ashika-ambient-castle-03", 600, -900, "tsuki-castle"),
    point("ashika-ambient-castle-04", 760, -360, "tsuki-castle"),
    point("ashika-ambient-castle-05", -430, -80, "tsuki-castle"),
    point("ashika-ambient-castle-06", 650, 250, "tsuki-castle"),
    point("ashika-ambient-castle-07", -120, 500, "tsuki-castle"),
    point("ashika-ambient-castle-08", 820, 720, "tsuki-castle"),

    point("ashika-ambient-residential-01", 720, -2100, "residential"),
    point("ashika-ambient-residential-02", 1130, -2230, "residential"),
    point("ashika-ambient-residential-03", 1610, -2050, "residential"),
    point("ashika-ambient-residential-04", 2040, -1720, "residential"),
    point("ashika-ambient-residential-05", 790, -1480, "residential"),
    point("ashika-ambient-residential-06", 1180, -1180, "residential"),
    point("ashika-ambient-residential-07", 1640, -1280, "residential"),
    point("ashika-ambient-residential-08", 2050, -1160, "residential"),

    point("ashika-ambient-shipwreck-01", 1750, -900, "shipwreck"),
    point("ashika-ambient-shipwreck-02", 2350, -870, "shipwreck"),
    point("ashika-ambient-shipwreck-03", 1840, -390, "shipwreck"),
    point("ashika-ambient-shipwreck-04", 2390, -310, "shipwreck"),
    point("ashika-ambient-shipwreck-05", 1800, 90, "shipwreck"),
    point("ashika-ambient-shipwreck-06", 2300, 180, "shipwreck"),
    point("ashika-ambient-shipwreck-07", 1960, 520, "shipwreck"),
    point("ashika-ambient-shipwreck-08", 2180, 760, "shipwreck"),

    point("ashika-ambient-port-01", 620, 850, "port-ashika"),
    point("ashika-ambient-port-02", 1080, 840, "port-ashika"),
    point("ashika-ambient-port-03", 1630, 850, "port-ashika"),
    point("ashika-ambient-port-04", 400, 1320, "port-ashika"),
    point("ashika-ambient-port-05", 1010, 1370, "port-ashika"),
    point("ashika-ambient-port-06", 1720, 1420, "port-ashika"),
    point("ashika-ambient-port-07", 720, 2040, "port-ashika"),
    point("ashika-ambient-port-08", 1510, 2100, "port-ashika"),
  ];

  const config = {
    id: "ashika-island",
    displayName: "ASHIKA ISLAND",
    extractionBased: true,
    scale: {
      relativeToStandardOutbreakMap: 2,
      note: "A complete 6000 x 6000 extraction island with seven authored POIs",
    },
    terrainPalette: {
      outside: "#183946",
      outsideTexture: "rgba(91, 144, 154, .10)",
      ground: "#66764a",
      groundTexture: "rgba(178, 190, 126, .13)",
      water: "#1d5362",
      waterStroke: "#62a8b6",
    },
    bounds: { x: -3000, y: -3000, width: 6000, height: 6000 },
    difficultyRegions,
    boundary: [
      [-2490, -2750], [-1860, -2920], [-1080, -2880], [-520, -2700],
      [240, -2750], [1120, -2670], [2050, -2350], [2470, -1900],
      [2690, -1260], [2780, -650], [2580, -80], [2520, 620],
      [2300, 940], [2410, 1390], [2200, 1940], [1880, 2320],
      [1320, 2700], [620, 2790], [260, 2500], [-260, 2390],
      [-790, 2570], [-1530, 2520], [-2100, 2320], [-2310, 1820],
      [-2160, 1270], [-2390, 940], [-2320, 470], [-2670, 210],
      [-2790, -480], [-2710, -1370],
    ],
    poiLabels,
    waterAreas: [
      polygon("ashika-town-marina", [
        [-2600, 300], [-2280, 250], [-2080, 470], [-2100, 850],
        [-2370, 940], [-2520, 710],
      ], "water"),
      polygon("ashika-port-basin", [
        [1830, 1180], [2380, 1120], [2380, 1740], [2110, 2200],
        [1810, 2030], [1710, 1600],
      ], "water"),
    ],
    landAreas: [
      orientedRect("ashika-farms-compound", -1740, -1760, 1240, 820, -0.08, "urban"),
      orientedRect("ashika-town-paving", -1750, -250, 1060, 760, 0.03, "urban"),
      orientedRect("ashika-beach-promenade", -1370, 1770, 1120, 720, -0.04, "plaza"),
      orientedRect("ashika-castle-grounds", 220, -100, 1280, 1120, 0.03, "urban"),
      orientedRect("ashika-residential-grounds", 1360, -1590, 1300, 880, -0.04, "urban"),
      orientedRect("ashika-shipwreck-beach", 2170, -170, 650, 1050, -0.08, "concrete"),
      orientedRect("ashika-port-hardstand", 1120, 1570, 1340, 1180, 0.04, "industrial"),
    ],
    swampAreas: [],
    bridgeAreas: [],
    roads: [
      { id: "ashika-north-coast-road", width: 82, points: [[-2180, -2220], [-1180, -2380], [0, -2260], [980, -2180], [1840, -1900]] },
      { id: "ashika-west-spine", width: 84, points: [[-2180, -2220], [-1800, -1300], [-1800, -500], [-1800, 300], [-1400, 1000], [-1400, 1900]] },
      { id: "ashika-central-spine", width: 88, points: [[0, -2260], [0, -1300], [0, -500], [0, 300], [0, 1050], [460, 2180]] },
      { id: "ashika-east-spine", width: 84, points: [[980, -2180], [1200, -1300], [1300, -500], [1100, 300], [1400, 900], [1400, 1900]] },
      { id: "ashika-east-coast-road", width: 78, points: [[1840, -1900], [2180, -1120], [2180, -420], [2180, 360], [1900, 820], [1400, 900]] },
      { id: "ashika-north-crossroad", width: 80, points: [[-1800, -1300], [0, -1300], [1200, -1300]] },
      { id: "ashika-mid-crossroad", width: 86, points: [[-1800, -500], [0, -500], [1300, -500], [2180, -420]] },
      { id: "ashika-south-crossroad", width: 84, points: [[-1800, 300], [0, 300], [1100, 300], [2180, 360]] },
      { id: "ashika-lower-crossroad", width: 82, points: [[-1400, 1000], [0, 1050], [1400, 900]] },
      { id: "ashika-south-coast-road", width: 82, points: [[-1400, 1900], [-520, 2250], [460, 2180], [1400, 1900]] },
      { id: "ashika-farms-lane", width: 64, points: [[-2180, -2220], [-2060, -1760], [-1800, -1300]] },
      { id: "ashika-town-loop", width: 62, points: [[-1800, -500], [-2200, -260], [-1800, 300]] },
      { id: "ashika-castle-approach", width: 68, points: [[0, -500], [470, -360], [760, -80], [1100, 300]] },
      { id: "ashika-residential-loop", width: 66, points: [[1200, -1300], [1560, -1540], [1840, -1900]] },
      { id: "ashika-shipwreck-track", width: 58, points: [[2180, -420], [2440, -120], [2180, 360]] },
      { id: "ashika-beach-club-lane", width: 62, points: [[-1400, 1000], [-1720, 1480], [-1400, 1900]] },
      { id: "ashika-port-ring", width: 68, points: [[1400, 900], [940, 1320], [980, 1780], [1400, 1900]] },
    ],
    pipeWalkways: [],
    collisionAreas: [
      orientedRect("ashika-farms-greenhouse-a", -2250, -1680, 170, 330, -0.12, "warehouse"),
      orientedRect("ashika-farms-greenhouse-b", -1250, -2000, 180, 300, -0.08, "warehouse"),
      orientedRect("ashika-farms-barn", -1590, -1890, 280, 190, 0.08, "warehouse"),
      orientedRect("ashika-farms-processing", -1320, -1470, 220, 260, -0.04),
      orientedRect("ashika-farms-house-a", -2250, -1160, 150, 170, 0.06),
      orientedRect("ashika-farms-house-b", -1370, -1120, 160, 150, -0.05),

      orientedRect("ashika-town-hall", -2100, -700, 230, 180, 0.04),
      orientedRect("ashika-town-market", -1460, -750, 260, 170, -0.03),
      orientedRect("ashika-town-office", -2350, 100, 210, 190, -0.04),
      orientedRect("ashika-town-apartments", -1460, 80, 250, 180, 0.04),
      orientedRect("ashika-town-waterfront-a", -2290, 620, 180, 160, 0.04),
      orientedRect("ashika-town-waterfront-b", -1880, 680, 230, 150, -0.03),

      orientedRect("ashika-beach-hotel", -2040, 1290, 250, 210, 0.05),
      orientedRect("ashika-beach-clubhouse", -1120, 1370, 300, 190, -0.05),
      orientedRect("ashika-beach-poolhouse", -1940, 1840, 180, 150, 0.04),
      orientedRect("ashika-beach-villas-a", -1070, 1730, 230, 180, -0.04),
      orientedRect("ashika-beach-villas-b", -1100, 2200, 250, 150, 0.04),

      orientedRect("ashika-castle-west-barracks", -600, -750, 230, 170, -0.04),
      orientedRect("ashika-castle-north-hall", 300, -750, 300, 180, 0.04),
      orientedRect("ashika-castle-east-barracks", 800, -700, 210, 180, -0.04),
      orientedRect("ashika-castle-main", 340, 50, 430, 300, 0.05, "mall"),
      orientedRect("ashika-castle-south-hall", -300, 560, 260, 180, -0.04),
      orientedRect("ashika-castle-gatehouse", 550, 600, 210, 150, 0.04),

      orientedRect("ashika-residential-house-a", 760, -1830, 180, 150, 0.05),
      orientedRect("ashika-residential-house-b", 600, -1550, 210, 160, -0.04),
      orientedRect("ashika-residential-apartments-a", 1550, -2160, 260, 170, 0.04),
      orientedRect("ashika-residential-apartments-b", 2250, -1600, 240, 190, -0.05),
      orientedRect("ashika-residential-house-c", 820, -1040, 180, 160, -0.04),
      orientedRect("ashika-residential-house-d", 1640, -1000, 200, 150, 0.05),

      orientedRect("ashika-shipwreck-warehouse", 1930, -780, 230, 180, -0.05, "warehouse"),
      orientedRect("ashika-shipwreck-shack-a", 2430, -700, 150, 140, 0.06),
      orientedRect("ashika-shipwreck-shack-b", 1900, 100, 160, 150, -0.04),
      orientedRect("ashika-shipwreck-hull-a", 2500, -600, 260, 95, 0.42, "warehouse"),
      orientedRect("ashika-shipwreck-hull-b", 2350, 620, 250, 90, -0.28, "warehouse"),

      orientedRect("ashika-port-warehouse-a", 650, 1320, 260, 190, 0.04, "warehouse"),
      orientedRect("ashika-port-warehouse-b", 1730, 1080, 300, 190, -0.04, "warehouse"),
      orientedRect("ashika-port-customs", 560, 1740, 220, 170, -0.04),
      orientedRect("ashika-port-terminal", 1180, 1650, 320, 220, 0.05, "warehouse"),
      orientedRect("ashika-port-storage-a", 720, 2380, 230, 140, 0.03, "warehouse"),
      orientedRect("ashika-port-storage-b", 1540, 2320, 250, 150, -0.04, "warehouse"),
    ],
    coverAreas: [
      orientedRect("ashika-cover-farms-a", -2170, -1390, 70, 42, 0.1, "cover"),
      orientedRect("ashika-cover-farms-b", -1210, -1750, 74, 42, -0.08, "cover"),
      orientedRect("ashika-cover-town-a", -2010, -220, 72, 42, 0.05, "cover"),
      orientedRect("ashika-cover-town-b", -1260, -250, 72, 42, -0.04, "cover"),
      orientedRect("ashika-cover-beach-a", -1840, 1460, 76, 44, 0.05, "cover"),
      orientedRect("ashika-cover-beach-b", -850, 1500, 72, 42, -0.04, "cover"),
      orientedRect("ashika-cover-castle-a", -260, -250, 72, 42, 0.05, "cover"),
      orientedRect("ashika-cover-castle-b", 900, 650, 74, 44, -0.04, "cover"),
      orientedRect("ashika-cover-residential-a", 940, -1600, 72, 42, 0.04, "cover"),
      orientedRect("ashika-cover-residential-b", 1830, -1240, 74, 42, -0.04, "cover"),
      orientedRect("ashika-cover-shipwreck-a", 2050, -160, 72, 42, 0.1, "cover"),
      orientedRect("ashika-cover-shipwreck-b", 2310, 340, 72, 42, -0.1, "cover"),
      orientedRect("ashika-cover-port-a", 840, 1550, 76, 44, 0.05, "cover"),
      orientedRect("ashika-cover-port-b", 1770, 1900, 76, 44, -0.04, "cover"),
    ],
    playerSpawns: [
      point("ashika-deploy-north-beach", -620, -2480, "north-coast"),
      point("ashika-deploy-farms", -2310, -2050, "oganikku-farms"),
      point("ashika-deploy-town", -2320, -540, "town-center"),
      point("ashika-deploy-beach", -1870, 2160, "beach-club"),
      point("ashika-deploy-castle", -650, 200, "tsuki-castle"),
      point("ashika-deploy-residential", 2010, -2030, "residential"),
      point("ashika-deploy-shipwreck", 2380, 420, "shipwreck"),
      point("ashika-deploy-port", 1200, 2470, "port-ashika"),
    ],
    ambientNodes,
    hvtLocations: [
      point("ashika-hvt-farms-fields", -2170, -1320, "oganikku-farms"),
      point("ashika-hvt-farms-yard", -1220, -1710, "oganikku-farms"),
      point("ashika-hvt-town-plaza", -1910, -100, "town-center"),
      point("ashika-hvt-town-east", -1240, -290, "town-center"),
      point("ashika-hvt-beach-pool", -1710, 1320, "beach-club"),
      point("ashika-hvt-beach-east", -760, 1410, "beach-club"),
      point("ashika-hvt-castle-west", -390, -180, "tsuki-castle"),
      point("ashika-hvt-castle-garden", 810, 150, "tsuki-castle"),
      point("ashika-hvt-residential-court", 1060, -1500, "residential"),
      point("ashika-hvt-residential-east", 1960, -1130, "residential"),
      point("ashika-hvt-shipwreck-beach", 2170, -90, "shipwreck"),
      point("ashika-hvt-shipwreck-cliff", 2200, 480, "shipwreck"),
      point("ashika-hvt-port-yard", 950, 1460, "port-ashika"),
      point("ashika-hvt-port-quay", 1630, 2040, "port-ashika"),
    ],
    frenzyLocations: [
      point("ashika-frenzy-farms-north", -1500, -2230, "oganikku-farms"),
      point("ashika-frenzy-farms-south", -1660, -980, "oganikku-farms"),
      point("ashika-frenzy-town-west", -2380, -310, "town-center"),
      point("ashika-frenzy-town-east", -1080, -120, "town-center"),
      point("ashika-frenzy-beach-west", -2010, 1120, "beach-club"),
      point("ashika-frenzy-beach-south", -1510, 2270, "beach-club"),
      point("ashika-frenzy-castle-north", 660, -880, "tsuki-castle"),
      point("ashika-frenzy-castle-south", 140, 720, "tsuki-castle"),
      point("ashika-frenzy-residential-north", 1300, -2390, "residential"),
      point("ashika-frenzy-residential-south", 1280, -1120, "residential"),
      point("ashika-frenzy-shipwreck-north", 2350, -980, "shipwreck"),
      point("ashika-frenzy-shipwreck-south", 2070, 660, "shipwreck"),
      point("ashika-frenzy-port-west", 420, 1500, "port-ashika"),
      point("ashika-frenzy-port-east", 1660, 1420, "port-ashika"),
    ],
    dataHeistHardDriveLocations: [
      withSearchArea(point("ashika-drive-farms-barn", -1760, -1880, "oganikku-farms"), -1740, -1760),
      withSearchArea(point("ashika-drive-farms-sheds", -1260, -1260, "oganikku-farms"), -1420, -1390),
      withSearchArea(point("ashika-drive-town-office", -1850, -720, "town-center"), -1800, -570),
      withSearchArea(point("ashika-drive-town-waterfront", -2150, 160, "town-center"), -1990, 50),
      withSearchArea(point("ashika-drive-beach-hotel", -1830, 1250, "beach-club"), -1730, 1390),
      withSearchArea(point("ashika-drive-beach-villa", -850, 1900, "beach-club"), -1030, 1840),
      withSearchArea(point("ashika-drive-castle-barracks", -420, -430, "tsuki-castle"), -250, -320),
      withSearchArea(point("ashika-drive-castle-garden", 650, 420, "tsuki-castle"), 500, 300),
      withSearchArea(point("ashika-drive-residential-north", 930, -2030, "residential"), 1100, -1940),
      withSearchArea(point("ashika-drive-residential-east", 1900, -1370, "residential"), 1770, -1510),
      withSearchArea(point("ashika-drive-shipwreck-hut", 1980, -560, "shipwreck"), 2140, -470),
      withSearchArea(point("ashika-drive-shipwreck-coast", 2470, 240, "shipwreck"), 2310, 180),
      withSearchArea(point("ashika-drive-port-customs", 650, 1500, "port-ashika"), 790, 1430),
      withSearchArea(point("ashika-drive-port-terminal", 1720, 1530, "port-ashika"), 1590, 1650),
    ],
    dataHeistUploadStations: [
      point("ashika-upload-farms-north", -1900, -2320, "oganikku-farms"),
      point("ashika-upload-farms-south", -1150, -1070, "oganikku-farms"),
      point("ashika-upload-town-west", -2420, -520, "town-center"),
      point("ashika-upload-town-east", -1130, -500, "town-center"),
      point("ashika-upload-beach-west", -2180, 1760, "beach-club"),
      point("ashika-upload-beach-east", -760, 1690, "beach-club"),
      point("ashika-upload-castle-north", 380, -1000, "tsuki-castle"),
      point("ashika-upload-castle-south", 260, 850, "tsuki-castle"),
      point("ashika-upload-residential-west", 780, -1250, "residential"),
      point("ashika-upload-residential-east", 2190, -1430, "residential"),
      point("ashika-upload-shipwreck-north", 2240, -1120, "shipwreck"),
      point("ashika-upload-shipwreck-south", 2160, 760, "shipwreck"),
      point("ashika-upload-port-west", 390, 1860, "port-ashika"),
      point("ashika-upload-port-east", 1250, 2180, "port-ashika"),
    ],
    truckStarts: [
      point("ashika-truck-farms", -1800, -1300, "oganikku-farms"),
      point("ashika-truck-town", -1800, -500, "town-center"),
      point("ashika-truck-beach", -1400, 1000, "beach-club"),
      point("ashika-truck-castle", 0, -500, "tsuki-castle"),
      point("ashika-truck-residential", 1200, -1300, "residential"),
      point("ashika-truck-shipwreck", 2180, -420, "shipwreck"),
      point("ashika-truck-port", 1400, 900, "port-ashika"),
    ],
    truckDestinations: [
      point("ashika-destination-farms", -2180, -2220, "oganikku-farms"),
      point("ashika-destination-town", -1800, 300, "town-center"),
      point("ashika-destination-beach", -1400, 1900, "beach-club"),
      point("ashika-destination-castle", 0, 300, "tsuki-castle"),
      point("ashika-destination-residential", 1840, -1900, "residential"),
      point("ashika-destination-shipwreck", 2180, 360, "shipwreck"),
      point("ashika-destination-port", 1400, 1900, "port-ashika"),
    ],
    cargoRoutes: [
      { id: "ashika-cargo-farms-to-town", startId: "ashika-truck-farms", destinationId: "ashika-destination-town", waypoints: [[-1800, -1300], [-1800, -500], [-1800, 300]] },
      { id: "ashika-cargo-town-to-castle", startId: "ashika-truck-town", destinationId: "ashika-destination-castle", waypoints: [[-1800, -500], [-900, -400], [0, -500], [0, 300]] },
      { id: "ashika-cargo-castle-to-residential", startId: "ashika-truck-castle", destinationId: "ashika-destination-residential", waypoints: [[0, -500], [0, -1300], [1200, -1300], [1560, -1540], [1840, -1900]] },
      { id: "ashika-cargo-residential-to-shipwreck", startId: "ashika-truck-residential", destinationId: "ashika-destination-shipwreck", waypoints: [[1200, -1300], [1300, -500], [2180, -420], [2180, 360]] },
      { id: "ashika-cargo-shipwreck-to-port", startId: "ashika-truck-shipwreck", destinationId: "ashika-destination-port", waypoints: [[2180, -420], [2180, 360], [1900, 820], [1400, 900], [940, 1320], [980, 1780], [1400, 1900]] },
      { id: "ashika-cargo-port-to-beach", startId: "ashika-truck-port", destinationId: "ashika-destination-beach", waypoints: [[1400, 900], [0, 1050], [-1400, 1000], [-1720, 1480], [-1400, 1900]] },
      { id: "ashika-cargo-beach-to-farms", startId: "ashika-truck-beach", destinationId: "ashika-destination-farms", waypoints: [[-1400, 1000], [-1800, 300], [-1800, -500], [-1800, -1300], [-1080, -1300], [-1080, -2380], [-2180, -2220]] },
    ],
    anomalyBuildings: [
      { id: "ashika-anomaly-farms", buildingId: "ashika-farms-barn", entrance: point("ashika-anomaly-farms-entry", -1420, -2040, "oganikku-farms"), label: "FARMS STORAGE ANOMALY" },
      { id: "ashika-anomaly-town", buildingId: "ashika-town-hall", entrance: point("ashika-anomaly-town-entry", -2230, -880, "town-center"), label: "TOWN HALL ANOMALY" },
      { id: "ashika-anomaly-beach", buildingId: "ashika-beach-clubhouse", entrance: point("ashika-anomaly-beach-entry", -1450, 1180, "beach-club"), label: "BEACH CLUB ANOMALY" },
      { id: "ashika-anomaly-castle", buildingId: "ashika-castle-main", entrance: point("ashika-anomaly-castle-entry", 620, -140, "tsuki-castle"), label: "CASTLE ANOMALY" },
      { id: "ashika-anomaly-residential", buildingId: "ashika-residential-apartments-a", entrance: point("ashika-anomaly-residential-entry", 1710, -1980, "residential"), label: "RESIDENTIAL ANOMALY" },
      { id: "ashika-anomaly-port", buildingId: "ashika-port-terminal", entrance: point("ashika-anomaly-port-entry", 1740, 1830, "port-ashika"), label: "PORT ANOMALY" },
    ],
    exfilLocations: [
      point("ashika-exfil-farms-coast", -2490, -1860, "oganikku-farms"),
      point("ashika-exfil-town-pier", -2520, 40, "town-center"),
      point("ashika-exfil-beach-club", -1930, 2260, "beach-club"),
      point("ashika-exfil-castle-hill", 180, 950, "tsuki-castle"),
      point("ashika-exfil-residential-coast", 2320, -1770, "residential"),
      point("ashika-exfil-shipwreck-beach", 2320, 720, "shipwreck"),
      point("ashika-exfil-port-quay", 1880, 2180, "port-ashika"),
    ],
    finalExfilLocations: [
      point("ashika-final-exfil-northwest", -2600, -1120, "oganikku-farms"),
      point("ashika-final-exfil-northeast", 2470, -1450, "residential"),
      point("ashika-final-exfil-south", -450, 2350, "south-coast"),
    ],
    packAPunchCandidates: [
      point("ashika-pap-farms", -1050, -1650, "oganikku-farms"),
      point("ashika-pap-town", -1100, 650, "town-center"),
      point("ashika-pap-beach", -800, 1300, "beach-club"),
      point("ashika-pap-castle", 900, 450, "tsuki-castle"),
      point("ashika-pap-residential", 1750, -2400, "residential"),
      point("ashika-pap-shipwreck", 2450, -1000, "shipwreck"),
      point("ashika-pap-port", 400, 2450, "port-ashika"),
    ],
    blessingCandidates: {
      hygeian: [
        point("ashika-hygeian-farms", -2320, -1450, "oganikku-farms"), point("ashika-hygeian-town", -1500, -950, "town-center"),
        point("ashika-hygeian-beach", -2150, 1510, "beach-club"), point("ashika-hygeian-castle", -520, 310, "tsuki-castle"),
        point("ashika-hygeian-residential", 2050, -980, "residential"), point("ashika-hygeian-shipwreck", 2450, -430, "shipwreck"),
        point("ashika-hygeian-port", 430, 1150, "port-ashika"),
      ],
      anarrosis: [
        point("ashika-anarrosis-farms", -1110, -2160, "oganikku-farms"), point("ashika-anarrosis-town", -2310, -990, "town-center"),
        point("ashika-anarrosis-beach", -840, 2250, "beach-club"), point("ashika-anarrosis-castle", 980, -780, "tsuki-castle"),
        point("ashika-anarrosis-residential", 720, -2260, "residential"), point("ashika-anarrosis-shipwreck", 1880, 420, "shipwreck"),
        point("ashika-anarrosis-port", 2050, 900, "port-ashika"),
      ],
      taxytitos: [
        point("ashika-taxytitos-farms", -1660, -1070, "oganikku-farms"), point("ashika-taxytitos-town", -1160, -760, "town-center"),
        point("ashika-taxytitos-beach", -1850, 1020, "beach-club"), point("ashika-taxytitos-castle", 170, -980, "tsuki-castle"),
        point("ashika-taxytitos-residential", 2230, -1180, "residential"), point("ashika-taxytitos-shipwreck", 2490, 420, "shipwreck"),
        point("ashika-taxytitos-port", 420, 2150, "port-ashika"),
      ],
    },
    ammoCacheCandidates: [
      point("ashika-ammo-farms-north", -2010, -2240, "oganikku-farms"), point("ashika-ammo-farms-south", -1180, -1040, "oganikku-farms"),
      point("ashika-ammo-town-west", -2390, -720, "town-center"), point("ashika-ammo-town-east", -1100, 40, "town-center"),
      point("ashika-ammo-beach-west", -2220, 1970, "beach-club"), point("ashika-ammo-beach-east", -780, 1320, "beach-club"),
      point("ashika-ammo-castle-north", -420, -980, "tsuki-castle"), point("ashika-ammo-castle-south", 760, 760, "tsuki-castle"),
      point("ashika-ammo-residential-west", 720, -1720, "residential"), point("ashika-ammo-residential-east", 2240, -870, "residential"),
      point("ashika-ammo-shipwreck-north", 2500, -970, "shipwreck"), point("ashika-ammo-shipwreck-south", 1890, 720, "shipwreck"),
      point("ashika-ammo-port-west", 380, 900, "port-ashika"), point("ashika-ammo-port-east", 1980, 1090, "port-ashika"),
    ],
    safeZone: {
      bounds: { x: 9000, y: 9000, width: 900, height: 620 },
      playerSpawn: { x: 9000, y: 9160 },
      packAPunch: { x: 8800, y: 8950 },
      beacon: { x: 9200, y: 8950 },
      exit: { x: 9000, y: 9250 },
    },
  };

  function pointInPolygon(x, y, points) {
    let inside = false;
    for (let index = 0, previous = points.length - 1; index < points.length; previous = index++) {
      const [x1, y1] = points[index];
      const [x2, y2] = points[previous];
      if (((y1 > y) !== (y2 > y)) && x < ((x2 - x1) * (y - y1)) / (y2 - y1 || 0.0001) + x1) inside = !inside;
    }
    return inside;
  }

  function validateAshikaConfig(candidate) {
    if (!candidate || candidate.id !== "ashika-island") throw new Error("Ashika config id is invalid");
    if (candidate.bounds.width !== 6000 || candidate.bounds.height !== 6000) throw new Error("Ashika must remain a 6000 x 6000 extraction map");
    if (candidate.poiLabels.length !== 7) throw new Error("Ashika must include all seven named POIs");
    if (candidate.difficultyRegions.length !== 7) throw new Error("Ashika must include seven difficulty regions");
    if (candidate.difficultyRegions.filter((region) => region.tier === 1 && region.effectiveRound === 4).length !== 3) throw new Error("Ashika Tier I must contain three round-4 POIs");
    if (candidate.difficultyRegions.filter((region) => region.tier === 2 && region.effectiveRound === 16).length !== 2) throw new Error("Ashika Tier II must contain two round-16 POIs");
    if (candidate.difficultyRegions.filter((region) => region.tier === 3 && region.effectiveRound === 45).length !== 2) throw new Error("Ashika Tier III must contain two round-45 POIs");
    if (candidate.ambientNodes.length < 56) throw new Error("Ashika needs at least eight ambient nodes per POI");
    for (const key of ["hvtLocations", "frenzyLocations", "dataHeistHardDriveLocations", "dataHeistUploadStations", "ammoCacheCandidates"]) {
      if (candidate[key].length < 14) throw new Error(`Ashika ${key} does not cover every POI densely enough`);
    }
    if (candidate.cargoRoutes.length < 7 || candidate.exfilLocations.length < 7) throw new Error("Ashika cargo/exfil coverage is incomplete");
    if (candidate.finalExfilLocations.length !== 3) throw new Error("Ashika needs exactly three authored radiation exfils");
    if (candidate.packAPunchCandidates.length < 7) throw new Error("Ashika needs an outdoor Pack-a-Punch candidate in every POI");
    for (const perkLocations of Object.values(candidate.blessingCandidates)) {
      if (perkLocations.length < 7) throw new Error("Every Ashika perk needs a candidate in every POI");
    }
    const gameplayPoints = [
      candidate.playerSpawns, candidate.ambientNodes, candidate.hvtLocations,
      candidate.frenzyLocations, candidate.dataHeistHardDriveLocations,
      candidate.dataHeistUploadStations, candidate.truckStarts,
      candidate.truckDestinations, candidate.exfilLocations,
      candidate.finalExfilLocations, candidate.packAPunchCandidates,
      candidate.ammoCacheCandidates, ...Object.values(candidate.blessingCandidates),
    ].flat();
    const invalid = gameplayPoints.filter((entry) => !pointInPolygon(entry.x, entry.y, candidate.boundary));
    if (invalid.length) throw new Error(`Ashika locations outside the island: ${invalid.map((entry) => entry.id).join(", ")}`);
    const difficultyPoints = [
      candidate.ambientNodes, candidate.hvtLocations,
      candidate.frenzyLocations, candidate.dataHeistHardDriveLocations,
      candidate.dataHeistUploadStations, candidate.truckStarts,
    ].flat();
    const wrongDifficulty = difficultyPoints.filter((entry) => {
      const expected = candidate.difficultyRegions.find((region) => region.poi === entry.poi);
      if (!expected) return false;
      const assigned = candidate.difficultyRegions.find((region) => pointInPolygon(entry.x, entry.y, region.points));
      return !assigned || assigned.tier !== expected.tier || assigned.effectiveRound !== expected.effectiveRound;
    });
    if (wrongDifficulty.length) throw new Error(`Ashika locations assigned to the wrong difficulty: ${wrongDifficulty.map((entry) => entry.id).join(", ")}`);
    const duplicateIds = gameplayPoints.map((entry) => entry.id).filter((id, index, ids) => ids.indexOf(id) !== index);
    if (duplicateIds.length) throw new Error(`Duplicate Ashika location ids: ${duplicateIds.join(", ")}`);
    return true;
  }

  validateAshikaConfig(config);
  window.ASHIKA_CONFIG = config;
  window.validateAshikaConfig = validateAshikaConfig;
})();

import "./styles.css";

let map;
let layerGroup;
let geoJson;
let chartTitle;
let municipalities;
let indexes = [];
let cities = [];
let topParties = [];
let genderPercent = [];
let votePercent = [];

let chart;
let partyPercentage = [];
let previousPartyPercentage = [];
let empPercent = [];
let eduPercent = [];
let emp = true;
let edu = true;

const form = document.getElementById("search");
const city = document.getElementById("search-city");
const dropdown = document.getElementById("dropdown");
const chartH = document.getElementById("chart-title");
const chartTicks = document.querySelectorAll(
  '[name="emp-box"], [name="edu-box"]'
);
const getImg = document.getElementById("img");
const mapLegend = document.getElementById("map-legend");
const extraText = document.getElementById("click-map");

const jsonQueryTopParty = {
  query: [
    {
      code: "Lukumäärätiedot",
      selection: {
        filter: "item",
        values: ["Suurinpuolue"]
      }
    }
  ],
  response: {
    format: "json-stat2"
  }
};

const jsonQueryVotes = {
  query: [
    {
      code: "Kunta",
      selection: {
        filter: "item",
        values: ["000000000"]
      }
    },
    {
      code: "Lukumäärätiedot",
      selection: {
        filter: "item",
        values: [
          "Pro_01",
          "Pro_02",
          "Pro_03",
          "Pro_04",
          "Pro_05",
          "Pro_06",
          "Pro_07",
          "Pro_08",
          "Pro_99",
          "Muutos_01",
          "Muutos_02",
          "Muutos_03",
          "Muutos_04",
          "Muutos_05",
          "Muutos_06",
          "Muutos_07",
          "Muutos_08",
          "Muutos_99"
        ]
      }
    }
  ],
  response: {
    format: "json-stat2"
  }
};

const jsonQueryEmp = {
  query: [
    {
      code: "Alue",
      selection: {
        filter: "item",
        values: ["SSS"]
      }
    },
    {
      code: "Pääasiallinen toiminta",
      selection: {
        filter: "item",
        values: ["11+12", "11"]
      }
    },
    {
      code: "Vuosi",
      selection: {
        filter: "item",
        values: ["2017"]
      }
    }
  ],
  response: {
    format: "json-stat2"
  }
};

const jsonQueryEdu = {
  query: [
    {
      code: "Vuosi",
      selection: {
        filter: "item",
        values: ["2017"]
      }
    },
    {
      code: "Alue",
      selection: {
        filter: "item",
        values: ["SSS"]
      }
    },
    {
      code: "Koulutusaste",
      selection: {
        filter: "item",
        values: ["SSS", "3T8", "3"]
      }
    }
  ],
  response: {
    format: "json-stat2"
  }
};

const parties = [
  {
    id: 1,
    name: "Keskusta",
    short: "KESK",
    colour: "#01954B"
  },
  {
    id: 2,
    name: "Kokoomus",
    short: "KOK",
    colour: "#006288"
  },
  {
    id: 3,
    name: "Perussuomalaiset",
    short: "PS",
    colour: "#FFD500"
  },
  {
    id: 4,
    name: "Sosiaalidemokraatit",
    short: "SDP",
    colour: "#E11931"
  },
  {
    id: 5,
    name: "Vihreät",
    short: "VIHR",
    colour: "#61BF1A"
  },
  {
    id: 6,
    name: "Vasemmistoliitto",
    short: "VAS",
    colour: "#BF1E24"
  },
  {
    id: 7,
    name: "RKP",
    short: "RKP",
    colour: "#FFDD93"
  },
  {
    id: 8,
    name: "Kristillisdemokraatit",
    short: "KD",
    colour: "#2B67C9"
  },
  {
    id: 99,
    name: "Others",
    short: "OTR",
    colour: "#A9A9A9"
  }
];

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let area = city.value.toLowerCase();
  let areaIndex;
  for (const [key, value] of Object.entries(cities)) {
    if (value.toLowerCase() === area) {
      areaIndex = key;
    }
  }
  if (areaIndex) {
    jsonQueryVotes.query[0].selection.values[0] = areaIndex;
    if (areaIndex === "000000000") {
      jsonQueryEmp.query[0].selection.values[0] = "SSS";
      jsonQueryEdu.query[1].selection.values[0] = "SSS";
    } else {
      jsonQueryEmp.query[0].selection.values[0] = "KU" + areaIndex;
      jsonQueryEdu.query[1].selection.values[0] = "KU" + areaIndex;
    }

    chartTitle =
      "Vote-% for each party in " +
      area.charAt(0).toUpperCase() +
      area.slice(1) +
      " for this and the previous election";
    updateChart();
  }
});

dropdown.addEventListener("input", (event) => {
  if (event.target.value === "Suurinpuolue") {
    extraText.style.display = "inline";
    mapLegend.innerHTML = "";
    parties.forEach((party) => {
      const li = document.createElement("div");
      li.classList.add("list");
      const hex = document.createElement("div");
      hex.classList.add("square");
      hex.style.backgroundColor = party.colour;
      const name = document.createElement("p");
      name.innerHTML = party.short;
      li.appendChild(hex);
      li.appendChild(name);
      mapLegend.appendChild(li);
    });
  } else if (event.target.value === "Naistenprp") {
    extraText.style.display = "none";
    mapLegend.innerHTML = "";
    const legends = [
      { title: "More women", colour: "#ff0000" },
      { title: "More men", colour: "#0000ff" }
    ];
    legends.forEach((legend) => {
      const li = document.createElement("div");
      li.classList.add("list");
      const hex = document.createElement("div");
      hex.classList.add("square");
      hex.style.backgroundColor = legend.colour;
      const name = document.createElement("p");
      name.innerHTML = legend.title;
      li.appendChild(hex);
      li.appendChild(name);
      mapLegend.appendChild(li);
    });
  } else if (event.target.value === "Apro") {
    extraText.style.display = "none";
    mapLegend.innerHTML = "";
    const legends = [
      { title: "Over 65%", colour: "#01954B" },
      { title: "Between 55% and 65%", colour: "#FFD500" },
      { title: "Under 55%", colour: "#E11931" }
    ];
    legends.forEach((legend) => {
      const li = document.createElement("div");
      li.classList.add("list");
      const hex = document.createElement("div");
      hex.classList.add("square");
      hex.style.backgroundColor = legend.colour;
      const name = document.createElement("p");
      name.innerHTML = legend.title;
      li.appendChild(hex);
      li.appendChild(name);
      mapLegend.appendChild(li);
    });
  }
  jsonQueryTopParty.query[0].selection.values[0] = event.target.value;
  updateMap();
});

chartTicks.forEach((item) => {
  item.addEventListener("input", () => {
    emp = chartTicks[0].checked;
    edu = chartTicks[1].checked;
    updateChart();
  });
});

getImg.addEventListener("click", () => {
  chart.export();
});

const fetchData = async () => {
  const urlGeo =
    "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
  const resGeo = await fetch(urlGeo);
  municipalities = await resGeo.json();

  const urlVoteData =
    "https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/kvaa/km_ku.px";

  const resTopParty = await fetch(urlVoteData, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQueryTopParty)
  });

  const dataVote = await resTopParty.json();
  indexes = dataVote.dimension.Kunta.category.index;
  cities = dataVote.dimension.Kunta.category.label;
  topParties = dataVote.value;

  const resVotes = await fetch(urlVoteData, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQueryVotes)
  });

  const dataPercentage = await resVotes.json();
  partyPercentage = dataPercentage.value.splice(0, 9);
  previousPartyPercentage = [];
  const change = dataPercentage.value.splice(-9);
  change.forEach((value, index) => {
    previousPartyPercentage.push(
      Math.round((partyPercentage[index] - value) * 100) / 100
    );
  });

  const urlEmp =
    "https://pxdata.stat.fi:443/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px";
  const resEmp = await fetch(urlEmp, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQueryEmp)
  });
  const dataEmp = await resEmp.json();
  empPercent[0] = 100 - Math.round((dataEmp.value[1] / dataEmp.value[0]) * 100);

  const urlEdu =
    "https://pxdata.stat.fi:443/PxWeb/api/v1/fi/StatFin/vkour/statfin_vkour_pxt_12bq.px";
  const resEdu = await fetch(urlEdu, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQueryEdu)
  });
  const dataEdu = await resEdu.json();
  eduPercent[0] = Math.round(
    ((dataEdu.value[1] - dataEdu.value[2]) / dataEdu.value[0]) * 100
  );

  chartTitle =
    "Vote-% for each party in Manner-Suomi for this and the previous election";
  makeMap(municipalities);
  buildChart();
};

const updateChart = async () => {
  const urlVoteData =
    "https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/kvaa/km_ku.px";

  const resVotes = await fetch(urlVoteData, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQueryVotes)
  });

  const dataPercentage = await resVotes.json();
  partyPercentage = dataPercentage.value.splice(0, 9);
  previousPartyPercentage = [];
  const change = dataPercentage.value.splice(-9);
  change.forEach((value, index) => {
    previousPartyPercentage.push(
      Math.round((partyPercentage[index] - value) * 100) / 100
    );
  });

  const urlEmp =
    "https://pxdata.stat.fi:443/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px";
  const resEmp = await fetch(urlEmp, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQueryEmp)
  });
  const dataEmp = await resEmp.json();
  empPercent[0] = 100 - Math.round((dataEmp.value[1] / dataEmp.value[0]) * 100);

  const urlEdu =
    "https://pxdata.stat.fi:443/PxWeb/api/v1/fi/StatFin/vkour/statfin_vkour_pxt_12bq.px";
  const resEdu = await fetch(urlEdu, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQueryEdu)
  });
  const dataEdu = await resEdu.json();
  eduPercent[0] = Math.round(
    ((dataEdu.value[1] - dataEdu.value[2]) / dataEdu.value[0]) * 100
  );

  buildChart();
};

const makeMap = (data) => {
  parties.forEach((party) => {
    const li = document.createElement("div");
    li.classList.add("list");
    const hex = document.createElement("div");
    hex.classList.add("square");
    hex.style.backgroundColor = party.colour;
    const name = document.createElement("p");
    name.innerHTML = party.short;
    li.appendChild(hex);
    li.appendChild(name);
    mapLegend.appendChild(li);
  });

  map = L.map("map", { minZoom: 4 });

  layerGroup = new L.LayerGroup();
  layerGroup.addTo(map);

  geoJson = L.geoJSON(data, {
    style: getStyleTop,
    onEachFeature: getFeatureTop
  });

  layerGroup.addLayer(geoJson);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  map.fitBounds(geoJson.getBounds());
};

const updateMap = async () => {
  layerGroup.removeLayer(geoJson);

  const urlVoteData =
    "https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/kvaa/km_ku.px";

  const resTopParty = await fetch(urlVoteData, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQueryTopParty)
  });

  const dataVote = await resTopParty.json();

  if (dropdown.value === "Suurinpuolue") {
    geoJson = L.geoJSON(municipalities, {
      style: getStyleTop,
      onEachFeature: getFeatureTop
    });
    layerGroup.addLayer(geoJson);
  } else if (dropdown.value === "Naistenprp") {
    genderPercent = dataVote.value;
    geoJson = L.geoJSON(municipalities, {
      style: getStyleGend,
      onEachFeature: getFeatureGend
    });
    layerGroup.addLayer(geoJson);
  } else if (dropdown.value === "Apro") {
    votePercent = dataVote.value;
    geoJson = L.geoJSON(municipalities, {
      style: getStylePerc,
      onEachFeature: getFeaturePerc
    });
    layerGroup.addLayer(geoJson);
  }
};

const mapClick = (areaIndex, name) => {
  let area = name.toLowerCase();
  jsonQueryVotes.query[0].selection.values[0] = areaIndex;
  if (areaIndex === "000000000") {
    jsonQueryEmp.query[0].selection.values[0] = "SSS";
    jsonQueryEdu.query[1].selection.values[0] = "SSS";
  } else {
    jsonQueryEmp.query[0].selection.values[0] = "KU" + areaIndex;
    jsonQueryEdu.query[1].selection.values[0] = "KU" + areaIndex;
  }

  chartTitle =
    "Vote-% for each party in " +
    area.charAt(0).toUpperCase() +
    area.slice(1) +
    " for this and the previous election";
  updateChart();
};

const getStyleTop = (feature) => {
  const id = feature.properties.kunta;
  const index = indexes[id];
  const topPartyID = topParties[index];
  let topPartyColour;
  parties.forEach((value) => {
    if (value.id === topPartyID) {
      topPartyColour = value.colour;
    }
  });
  return {
    color: topPartyColour
  };
};

const getStyleGend = (feature) => {
  const id = feature.properties.kunta;
  const index = indexes[id];
  const percent = genderPercent[index];

  if (percent > 50) {
    return {
      color: "#ff0000"
    };
  } else if (percent < 50) {
    return {
      color: "#0000ff"
    };
  } else {
    return {
      color: "#ff00ff"
    };
  }
};

const getStylePerc = (feature) => {
  const id = feature.properties.kunta;
  const index = indexes[id];
  const percent = votePercent[index];

  if (percent > 65) {
    return {
      color: "#01954B"
    };
  } else if (percent < 55) {
    return {
      color: "#E11931"
    };
  } else {
    return {
      color: "#FFD500"
    };
  }
};

const getFeatureTop = (feature, layer) => {
  layer.on("click", function () {
    mapClick(feature.properties.kunta, feature.properties.name);
  });
  const id = feature.properties.kunta;
  const index = indexes[id];
  const topPartyID = topParties[index];
  let topParty;
  parties.forEach((value) => {
    if (value.id === topPartyID) {
      topParty = value.name;
    }
  });

  layer.bindTooltip(feature.properties.name);
  layer.bindPopup(
    `<ul>
        <li>Name: ${feature.properties.name}</li>
        <li>Top party: ${topParty}</li>
    </ul>`
  );
};

const getFeatureGend = (feature, layer) => {
  const id = feature.properties.kunta;
  const index = indexes[id];
  const percent = genderPercent[index];
  const topPartyID = topParties[index];
  let topParty;
  parties.forEach((value) => {
    if (value.id === topPartyID) {
      topParty = value.name;
    }
  });
  layer.bindTooltip(feature.properties.name);

  if (percent >= 50) {
    layer.bindPopup(
      `<ul>
        <li>Name: ${feature.properties.name}</li>
        <li>Female: ${percent + "%"}</li>
        <li>Male: ${100 - percent + "%"}</li>
        <li>Top party: ${topParty}</li>
    </ul>`
    );
  } else if (percent < 50) {
    layer.bindPopup(
      `<ul>
        <li>Name: ${feature.properties.name}</li>
        <li>Male: ${100 - percent + "%"}</li>
        <li>Female: ${percent + "%"}</li>
        <li>Top party: ${topParty}</li>
    </ul>`
    );
  } else {
    layer.bindPopup(
      `<ul>
      <li>Name: ${feature.properties.name}</li>
      <li>Male: No value</li>
      <li>Female: No value</li>
      <li>Top party: ${topParty}</li>
  </ul>`
    );
  }
};

const getFeaturePerc = (feature, layer) => {
  const id = feature.properties.kunta;
  const index = indexes[id];
  const percent = votePercent[index];
  const topPartyID = topParties[index];
  let topParty;
  parties.forEach((value) => {
    if (value.id === topPartyID) {
      topParty = value.name;
    }
  });
  layer.bindTooltip(feature.properties.name);
  layer.bindPopup(
    `<ul>
        <li>Name: ${feature.properties.name}</li>
        <li>Percentage: ${percent + "%"}</li>
        <li>Top party: ${topParty}</li>
    </ul>`
  );
};

const buildChart = async () => {
  chartH.innerHTML = chartTitle;
  let labels = [];
  parties.forEach((value) => {
    labels.push(value.short);
  });

  const yMarkersDef = [
    {
      label: "Unemployment rate: " + empPercent + "%",
      value: empPercent
    },
    {
      label: "Academic degree rate: " + eduPercent + "%",
      value: eduPercent,
      options: { labelPos: "left" }
    }
  ];

  let yMarkers = [];
  if (emp === true) {
    yMarkers.push(yMarkersDef[0]);
  }
  if (edu === true) {
    yMarkers.push(yMarkersDef[1]);
  }
  if (yMarkers.length === 0) {
    yMarkers = 0;
  }

  const data = {
    labels: labels,
    datasets: [
      {
        name: "2017",
        values: partyPercentage,
        chartType: "bar"
      },
      {
        name: "2012",
        values: previousPartyPercentage,
        chartType: "bar"
      }
    ],
    yMarkers: yMarkers
  };

  chart = new frappe.Chart("#chart", {
    data: data,
    height: 450,
    title: chartTitle,
    lineOptions: {
      hideDots: 1
    },
    type: "bar",
    tooltipOptions: {
      formatTooltipY: (d) => d + "%"
    },
    axisOptions: {
      xAxisMode: "tick"
    },
    colors: ["#87C1FF", "#FF7F7F"]
  });
};

fetchData();
buildChart();

import "./App.css";
// import { river_locations, bungee_locations } from "./locations";
// import river_locations from "./locations";
import { useState, useEffect } from "react";

// some constant definitions
const river_locations = [
  {
    name: "Bremgarten",
    id: "2018",
    min: 180,
    optimum: 230,
    optimum_max: 350,
    max: 400,
    danger: 480,
  },
  {
    name: "Thun",
    id: "2030",
    min: 90,
    optimum: 110,
    optimum_max: 190,
    max: 210,
    danger: 350,
  },
];

const bungee_locations = [
  {
    name: "Bern",
    id: "2135",
    min: 80,
    optimum: 100,
    danger: 360,
  },
  {
    name: "Zürich",
    id: "2243",
    min: 75,
    optimum: 95,
    danger: 350,
  },
  {
    name: "Luzern",
    id: "2152",
    min: 80,
    optimum: 120,
    danger: 350,
  },
  {
    name: "Basel",
    id: "2091",
    min: 850,
    optimum: 1100,
    danger: 2500,
  },
];

const parameters = ["flow", "temperature"];

// var fetch_url =
// "https://api.existenz.ch/apiv1/hydro/latest?locations=2018&parameters=flow%2C%20temperature&app=MagicSwissWeed&version=0.1.0";
var fetch_url = "https://api.existenz.ch/apiv1/hydro/latest?";

// add variables to fetch_url
fetch_url +=
  "locations=" +
  river_locations
    .concat(bungee_locations)
    .map(({ id }) => id)
    .join("%2C");
fetch_url += "&parameters=" + parameters.join("%2C");
// TODO: get version from package.json
const appVersion = require("../package.json").version;
fetch_url += "&app=MagicSwissWeed&version=" + appVersion;

// API might not return a specific measurement
// in which case the .find() returns "undefined"
function check_if_meas_undefined(meas) {
  if (meas === undefined) {
    meas = "N/A"; // 🤷
  } else {
    meas = meas.val;
  }
  return meas;
}

function flow2color(_flow, _location) {
  if (_flow < _location.min) {
    return "flow_bad";
  }
  if (_flow < _location.optimum) {
    return "flow_ok";
  }
  // check if it's a riversurf location
  if ("max" in _location) {
    if (_flow < _location.optimum_max) {
      return "flow_good";
    }
    if (_flow < _location.max) {
      return "flow_ok";
    }
    if (_flow < _location.danger) {
      return "flow_bad";
    }
  } else if (_flow < _location.danger) {
    return "flow_good";
  }
  return "flow_danger";
}

function temp2color(_temp) {
  if (_temp < 8) {
    return "temp_0";
  }
  if (_temp < 13) {
    return "temp_1";
  }
  if (_temp < 18) {
    return "temp_2";
  }
  if (_temp < 23) {
    return "temp_3";
  }
  return "temp_4";
}

// render fetched data useful for displaying
/**
 *
 * @param {Array} _data: length N * M
 * @param {Array} _locations: length N
 * @param {Array} _parameters: length M
 * @returns
 */
function render_conditions(_data, _locations, _parameters) {
  const N = _locations.length;
  // const M = _parameters.length;

  // combine _data and _locations into a single Array to render
  let render_array = Array(N);
  for (let i = 0; i < N; i++) {
    // find the right measurements
    let flow_i = _data.find(
      ({ loc, par }) => loc === _locations[i].id && par === "flow"
    );
    flow_i = check_if_meas_undefined(flow_i);
    let temp_i = _data.find(
      ({ loc, par }) => loc === _locations[i].id && par === "temperature"
    );
    temp_i = check_if_meas_undefined(temp_i);

    // color-code flow and temperature
    let flow_color_i = flow2color(flow_i, _locations[i]);
    let temp_color_i = temp2color(temp_i);

    // then put them into a new container with all info for rendering
    let render_dict = {
      name: _locations[i].name,
      link:
        "https://www.hydrodaten.admin.ch/de/seen-und-fluesse/stationen-und-daten/" +
        _locations[i].id,
      flow: Math.round(flow_i),
      flow_color: flow_color_i,
      temp: Math.round(temp_i),
      temp_color: temp_color_i,
    };
    render_array[i] = render_dict;
  }
  return (
    <div className="spotlist">
      {render_array.map(
        ({ name, link, flow, flow_color, temp, temp_color }) => (
          // container for 2-col grid
          <div className="spot">
            {/* first col */}
            <div className="spotname">
              <a href={link} target="_blank" rel="noreferrer">
                {name}
              </a>
            </div>
            {/* second col */}
            {/* first row */}
            <div className="flow meas">
              <div className={flow_color}>{flow}</div>
              <div className="unit">
                m<sup>3</sup>/s
              </div>
              {/* add warning sign if flow reaches dangerous levels */}
              {flow_color === "flow_danger" && (
                <div
                  className="danger"
                  title="Moderate flood danger, be careful!"
                >
                  &ensp; ⚠️
                </div>
              )}
            </div>
            {/* second row */}
            <div className="temp meas">
              <div className={temp_color}>{temp}</div>
              <div className="unit">°C</div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

// main React app that gets displayed
export default function App() {
  // define states for fetching data
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // fetch data asynchronously and handle potential errors
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          fetch_url
          // `https://jsonplaceholder.typicode.com/posts?_limit=10`
        );
        if (!response.ok) {
          throw new Error(
            `This is an HTTP error: The status is ${response.status}`
          );
        }
        let actualData = await response.json();
        setData(actualData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  // return HTML including variables computed above for displaying
  return (
    <div className="App">
      {/* header */}
      <header className="App-header">
        <div className="title">
          <h1>magicswissweed</h1>
          <p>Current surfing conditions in Switzerland</p>
        </div>
        {/* display content depending on state */}
        {loading && <div>Fetching the latest measurements...</div>}
        {error && (
          <div>{`There is a problem fetching the post data - ${error}`}</div>
        )}
        {data && (
          <div className="surfspots">
            <div className="riversurf">
              <h2>Riversurf</h2>
              {render_conditions(data.payload, river_locations, parameters)}
            </div>
            <div className="bungeesurf">
              <h2>Bungeesurf</h2>
              {render_conditions(data.payload, bungee_locations, parameters)}
            </div>
          </div>
        )}
      </header>

      {/* footer */}
      <footer>
        <div className="Footer">
          <div className="Footer_item">
            Source:{" "}
            <a className="Link" href="https://www.hydrodaten.admin.ch">
              BAFU
            </a>
          </div>
          <div className="Footer_item">
            © 2023{" "}
            {/* <a className="Link" href="https://academicsurfclub.ch"> */}
            Academic Surf Club Switzerland
            {/* </a> */}
            <br />
            inspired by <a href="https://aare.guru">aare.guru</a>
          </div>
          <div className="Footer_item">
            <a
              className="Link"
              href="https://github.com/nkueng/MagicSwissWeed/issues"
            >
              Feedback
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import "./App.css";
// import { river_locations, bungee_locations } from "./locations";
// import river_locations from "./locations";
import { useState, useEffect } from "react";
// import { version } from "../package.json";

// some constant definitions
const river_locations = [
  {
    name: "Bremgarten",
    id: "2018",
    min: 180,
    optimum: [230, 350],
    max: 400,
    danger: 480,
  },
  {
    name: "Thun",
    id: "2030",
    min: 90,
    optimum: [110, 190],
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
    id: "2099",
    min: 75,
    optimum: 95,
    danger: 350,
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
fetch_url += "&app=MagicSwissWeed&version=0.1.0";

function check_if_meas_undefined(meas) {
  if (meas === undefined) {
    meas = "N/A";
  } else {
    meas = meas.val;
  }
  return meas;
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

    // then put them into a new container with all info for rendering
    let render_dict = {
      name: _locations[i].name,
      flow: flow_i,
      temp: temp_i,
    };
    render_array[i] = render_dict;
    // TODO: handle undefined values
  }
  return (
    <ul>
      {render_array.map(({ name, flow, temp }) => (
        // TODO: what is key used for?
        <li key={name}>
          <b>{name}</b>: {flow} m<sup>3</sup>/s, {temp}°C
        </li>
      ))}
    </ul>
  );
}

// main React app that gets displayed
export default function App() {
  // if (ONLINE) {
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
        <h1>MagicSwissWeed</h1>
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
        <ul className="Footer">
          <li className="Footer_item">
            <a
              className="Link"
              href="https://github.com/nkueng/MagicSwissWeed/issues"
            >
              Feedback
            </a>
          </li>
          <li className="Footer_item">
            © 2023{" "}
            {/* <a className="Link" href="https://academicsurfclub.ch"> */}
            Academic Surf Club Switzerland
            {/* </a> */}
            <br />
            inspired by <a href="https://aare.guru">aare.guru</a>
          </li>
          <li className="Footer_item">
            Source:{" "}
            <a className="Link" href="https://www.hydrodaten.admin.ch">
              BAFU
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
}

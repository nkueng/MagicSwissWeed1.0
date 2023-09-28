import "./App.css";
import { river_locations, bungee_locations } from "./locations";
import { render_conditions } from "./renderFunctions";
import { useState, useEffect } from "react";

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
const appVersion = require("../package.json").version;
fetch_url += "&app=MagicSwissWeed&version=" + appVersion;

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
    // refresh data every 5 minutes
    // https://upmostly.com/tutorials/setinterval-in-react-components-using-hooks
    const interval = setInterval(() => {
      getData();
      console.log("Refreshed measurements!");
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
    return () => clearInterval(interval);
  }, []);

  // return HTML including state variables computed above for displaying
  return (
    <div className="App">
      {/* header */}
      <header className="App-header">
        <div className="title">
          <h1>MagicSwissWeed</h1>
          <p>Current surfing conditions in Switzerland</p>
        </div>
        {/* display content depending on state */}
        {loading && <div>Fetching the latest measurements...</div>}
        {error && (
          <div>
            {`There is a problem fetching the latest measurements - ${error} `}
            <p>
              Try again later or report the problem via the feedback form linked
              below.
            </p>
          </div>
        )}
        {data && (
          <div className="surfspots">
            <div className="riversurf">
              <h2>Riversurf</h2>
              {render_conditions(data.payload, river_locations)}
            </div>
            <div className="bungeesurf">
              <h2>Bungeesurf</h2>
              {render_conditions(data.payload, bungee_locations)}
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
          <div className="Footer_item wide">
            © 2023 Academic Surf Club Switzerland
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

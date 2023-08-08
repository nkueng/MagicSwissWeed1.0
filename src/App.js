import "./App.css";
import { useState, useEffect } from "react";

// some constant definitions
var fetch_url =
  "https://api.existenz.ch/apiv1/hydro/latest?locations=2018&parameters=flow%2C%20temperature&app=MagicSwissWeed&version=0.1.0";
// var fetch_url = "https://api.existenz.ch/apiv1/hydro/latest?";

// solve this with the map function
// data.map(({ id, title }) => (
//   <li key={id}>
//     <h3>{title}</h3>
//   </li>
// ))}
// fetch_url += "locations=" + locations.map();

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

  // render fetched data useful for displaying
  if (data) {
    var flow = data.payload[0].val;
    var temp = data.payload[1].val;
  }

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
          <ul>
            <li>
              Bremgarten: 🌊 {flow} m<sup>3</sup>/s, 🌡 {temp}°C
            </li>
          </ul>
        )}
      </header>

      {/* footer */}
      <footer>
        <ul className="Footer">
          <li className="Footer_item">
            © 2023{" "}
            <a className="Link" href="https://github.com/nkueng">
              Nicola Küng
            </a>{" "}
            inspired by <a href="https://aare.guru">aare.guru</a>
          </li>
          <li className="Footer_item">
            Hosted on{" "}
            <a className="Link" href="https://pages.github.com">
              GitHub Pages
            </a>
          </li>
          <li className="Footer_item">
            Data provided by{" "}
            <a className="Link" href="https://www.hydrodaten.admin.ch">
              BAFU/FOEN
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
}

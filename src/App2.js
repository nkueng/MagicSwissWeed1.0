import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";

// some constants
const app_name = "MagicSwissWeed";
const app_version = "0.1.0";
// const params = ["flow", "temperature"];
const station_id = "2018";
const request_url = `https://api.existenz.ch/apiv1/hydro/latest?locations=${station_id}&parameters=flow%2C%20temperature&app=${app_name}&version=${app_version}`;
// const request_url =
// "https://api.existenz.ch/apiv1/hydro/latest?locations=2018&parameters=flow%2C%20temperature&app=MagicSwissWeed&version=0.1.0";
// const update_interval = 5 * 60 * 1000; // 5 minutes

// function to call API
// async function fetchData() {
//   const response = await fetch(request_url);
//   const _data = await response.json();
//   return _data;
// }

// function read_measurements(_data) {
//   const flow = _data.payload[0].val;
//   const temp = _data.payload[1].val;
//   return [flow, temp];
// }

// var data = fetchData();
// var measurements = read_measurements(data);

function App() {
  const [joke, setJoke] = useState(null);
  useEffect(() => {
    fetch(request_url)
      .then((response) => response.json())
      .then((data) => {
        setJoke(data[0].joke);
        console.log(data);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bremgarten</h1>
        {joke && <p>{joke}</p>}

        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

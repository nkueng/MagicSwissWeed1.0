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

// convert flow value to color
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

// convert temperature value to color
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
 * @returns
 */
export function render_conditions(_data, _locations) {
  const N = _locations.length;

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
          <div key={name} className="spot">
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

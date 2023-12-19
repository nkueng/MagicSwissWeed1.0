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

function flow2stars(_flow, _location) {
  if(_location.ranking === undefined) return undefined;
  if(_flow < _location.min || _flow > _location.max) return 0;
  else if(_flow < _location.ranking.oneStarMax) return 1;
  else if(_flow < _location.ranking.twoStarMax) return 2;
  else if(_flow < _location.ranking.threeStarMax) return 3;
  else if(_flow < _location.ranking.fourStarMax) return 4;
  else if(_flow < _location.ranking.fiveStarMax) return 5;
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

function Stars(props) {
  if(props.nrOfStars === undefined) return <div className="stars invisible"></div>;

  let stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(i < props.nrOfStars ? <FilledStar /> : <EmptyStar />);
  }
  return <div className="stars">{stars}</div>;
}

function FilledStar() {
  return <p className="filledStar"> ★ </p>;
}

function EmptyStar() {
  return <p className="emptyStar"> ✰ </p>;
}

function Measurements(props) {
  return <>
    <div className="measurements">
      {/* first row */}
      <div className="flow meas">
        <div className={props.flow_color}>{props.flow}</div>
        <div className="unit smallFont">
          m<sup>3</sup>/s
        </div>

        {/* add warning sign if flow reaches dangerous levels */}
        {props.flow_color === "flow_danger" && (
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
        <div className={props.temp_color}>{props.temp}</div>
        <div className="unit">°C</div>
      </div>
    </div>
  </>;
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
    let nrOfStars = flow2stars(flow_i, _locations[i]);

    // then put them into a new container with all info for rendering
    render_array[i] = {
      name: _locations[i].name,
      link:
          "https://www.hydrodaten.admin.ch/de/seen-und-fluesse/stationen-und-daten/" +
          _locations[i].id,
      flow: Math.round(flow_i),
      flow_color: flow_color_i,
      temp: Math.round(temp_i),
      temp_color: temp_color_i,
      nrOfStars: nrOfStars
    };
  }
  return (
    <div className="spotlist">
      {render_array.map(
        ({ name, link, flow, flow_color, temp, temp_color, nrOfStars }) => (
          <div key={name} className="spot">
            <div className="spotname">
              <a href={link} target="_blank" rel="noreferrer">
                {name}
              </a>
              <Measurements flow_color={flow_color} flow={flow} temp_color={temp_color} temp={temp}/>
              <Stars nrOfStars={nrOfStars}></Stars>
            </div>
          </div>
        )
      )}
    </div>
  );
}

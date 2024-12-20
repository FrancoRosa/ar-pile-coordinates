import { useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map, NavigationControl } from "react-map-gl";

import "./App.css";
import {
  addStickLocation,
  delStickLocation,
  getStickLocations,
} from "../queries";
import { useLocalStorage } from "./js/storage";
import { ScatterplotLayer } from "deck.gl";
import "mapbox-gl/dist/mapbox-gl.css";

const initialView = {
  longitude: -71.978,
  latitude: -13.516,
  zoom: 13,
};

const styles = [
  "mapbox://styles/mapbox/streets-v12",
  "mapbox://styles/mapbox/satellite-v9",
  "mapbox://styles/mapbox/satellite-streets-v12",
  "mapbox://styles/mapbox/navigation-night-v1",
];

function App() {
  const [response, setResponse] = useState([]);
  const [target, setTarget] = useState({});
  const [userLoc, setUserLoc] = useState({});
  const [newTarget, setNewTarget] = useState({});
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useLocalStorage("style", 0);

  const handleMap = () => {
    setStyle((s) => (s >= 3 ? 0 : s + 1));
  };

  const handleAddPoint = async () => {
    const { lon, lat } = newTarget;

    setLoading(true);
    const id = await addStickLocation(lat, lon);

    if (id) {
      setResponse((s) => [...s, { id, lat, lon }]);
      setNewTarget({});
    }
    setLoading(false);
  };

  const handleClick = (e) => {
    setTarget({});
    const [lon, lat] = e.coordinate;
    setNewTarget({ lon, lat });
  };

  const handleRemove = async () => {
    setLoading(true);
    const success = await delStickLocation(target.id);
    if (success) {
      setResponse((s) => s.filter((f) => f.id !== target.id));
      setTarget({});
    }
    setLoading(false);
  };

  const handleFetch = async () => {
    setLoading(true);
    const data = await getStickLocations();
    setResponse(data);
    setLoading(false);
  };

  useEffect(() => {
    const updateUserLoc = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          const {
            latitude: lat,
            longitude: lon,
            altitude,
            accuracy,
            heading,
            speed,
          } = position.coords;
          setUserLoc({ lat, lon, altitude, accuracy, heading, speed });
        });
      }
    };
    const posTimer = setInterval(() => {
      updateUserLoc();
    }, 1000);
    handleFetch();
    return () => {
      clearInterval(posTimer);
    };
  }, []);

  return (
    <>
      <DeckGL
        controller={{ dragPan: true }}
        initialViewState={initialView}
        onClick={handleClick}
      >
        {/* <LineLayer
          id="route-layer"
          data={lines}
          getSourcePosition={(d) => d.from}
          getTargetPosition={(d) => d.to}
          getColor={hexToRgba(color)}
          getWidth={5}

          // widthUnits="meter"
        /> */}
        <ScatterplotLayer
          id="route-points"
          data={response}
          getPosition={(d) => [d.lon, d.lat]}
          getRadius={1}
          getFillColor={[255, 140, 0]}
          getLineColor={[255, 255, 255]}
          getLineWidth={0.5}
          stroked
          radiusMinPixels={10}
          autoHighlight={true}
          highlightColor={[255, 0, 0, 100]}
          pickable
          onClick={(e) => {
            setTimeout(() => {
              setTarget(e.object);
              setNewTarget({});
            }, 50);
          }}
        />

        <ScatterplotLayer
          id="target-points"
          data={[target]}
          getPosition={(d) => [d.lon, d.lat]}
          getRadius={1}
          getFillColor={[10, 140, 0]}
          getLineColor={[10, 100, 25]}
          getLineWidth={10}
          stroked
          radiusMinPixels={10}
          autoHighlight={true}
        />

        <ScatterplotLayer
          id="user-location"
          data={[userLoc]}
          getPosition={(d) => [d.lon, d.lat]}
          getRadius={1}
          getFillColor={[10, 200, 0, 100]}
          getLineColor={[10, 50, 25, 100]}
          getLineWidth={0.5}
          stroked
          radiusMinPixels={10}
          autoHighlight={true}
        />

        <ScatterplotLayer
          id="new-point"
          data={[newTarget]}
          getPosition={(d) => [d.lon, d.lat]}
          getRadius={1}
          getFillColor={[100, 140, 0]}
          getLineColor={[100, 100, 255]}
          getLineWidth={0.5}
          stroked
          radiusMinPixels={10}
          autoHighlight={true}
        />
        {/*
        <ScatterplotLayer
          id="granular-points"
          data={gPoints}
          getPosition={(d) => d}
          getRadius={0.5}
          getFillColor={[255, 0, 0]}
          getLineColor={[255, 255, 255]}
          getLineWidth={0.2}
          stroked
        />
        <TextLayer
          id="distance-labels"
          data={lines}
          getPosition={(d) => d.to}
          getText={(d) => d.tdist.toFixed(1)}
          getColor={hexToRgba(color)}
          getSize={16}
          getAlignmentBaseline={"top"}
          getTextAnchor={"middle"}
          getPixelOffset={[12, 12]}
        /> */}
        <Map
          mapStyle={styles[style]}
          mapboxAccessToken="pk.eyJ1Ijoia20xMTVmcmFuY28iLCJhIjoiY2x4cGE5emJvMG1vMDJrbzZpdXQwaXp6NCJ9.OMUGXuwdfhrcCwcwwKIZ5A"
        >
          <NavigationControl />
        </Map>
      </DeckGL>
      <div
        style={{
          position: "absolute",
          z: 1,
          top: 0,
          left: 0,
          background: "rgb(0,0,0)",
          opacity: 0.5,
          maxHeight: "100vh",
          margin: "0.5em",
          borderRadius: "0.5em",
        }}
      >
        <p className="m-1 ">Accuracy: {userLoc.accuracy}</p>
        <p className="m-1 ">Speed: {userLoc.speed}</p>
        <p className="m-1 ">Heading: {userLoc.heading}</p>
        <p className="m-1 ">Altitude: {userLoc.altitude}</p>

        <button className="m-1" onClick={handleMap}>
          Map {style + 1}/4
        </button>

        <p className="m-1">Piles: {response.length}</p>
        {"id" in target ? (
          <div>
            <p className="m-1">Pile Selected</p>
            <button className="m-1" onClick={handleRemove}>
              Delete
            </button>
          </div>
        ) : (
          <p className="m-1">No pile selected</p>
        )}

        {"lon" in newTarget && (
          <button className="m-1" onClick={handleAddPoint}>
            Add point
          </button>
        )}
      </div>
    </>
  );
}

export default App;

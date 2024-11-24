import { useState } from "react";
import "./App.css";
import {
  addStickLocation,
  delStickLocation,
  getStickLocations,
} from "../queries";

function App() {
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      lat: { value: lat },
      lng: { value: lng },
    } = e.target.elements;

    setLoading(true);
    const id = await addStickLocation(lat, lng);

    if (id) {
      setResponse((s) => [...s, { id, lat, lng }]);
    }
    setLoading(false);
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    const {
      cId: { value: cId },
    } = e.target.elements;
    setLoading(true);
    const success = await delStickLocation(cId);
    if (success) {
      setResponse((s) => s.filter((f) => f.id !== cId));
    }
    setLoading(false);
  };

  const handleFetch = async () => {
    setLoading(true);
    const data = await getStickLocations();
    setResponse(data);

    setLoading(false);
  };

  return (
    <>
      <div></div>
      <h1 className="center">Get firebase data</h1>
      <div className="card center">
        {!loading && <button onClick={handleFetch}>Fetch all documents</button>}
      </div>
      <div className="card center">
        <form onSubmit={handleSubmit}>
          <label>lat:</label>
          <input name="lat" type="number" />
          <label>lng:</label>
          <input name="lng" type="number" />
          {!loading && <button type="submit">Add new point</button>}
        </form>
      </div>
      <div className="card center">
        <form onSubmit={handleRemove}>
          <label>id:</label>
          <input name="cId" type="text" />
          {!loading && <button type="submit">Remove</button>}
        </form>
      </div>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </>
  );
}

export default App;

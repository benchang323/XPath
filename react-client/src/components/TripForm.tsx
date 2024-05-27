// src/components/TripForm.tsx
import React, { useState } from "react";

interface TripFormProps {
  onSubmit: (
    startStation: string,
    endStation: string,
    startTime: string,
    type: string
  ) => void;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit }) => {
  const [startStation, setStartStation] = useState("");
  const [endStation, setEndStation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [type, setType] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(startStation, endStation, startTime, type);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
      <input
        type="text"
        placeholder="Start Location"
        value={startStation}
        onChange={(e) => setStartStation(e.target.value)}
        style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
      />
      <input
        type="text"
        placeholder="End Location"
        value={endStation}
        onChange={(e) => setEndStation(e.target.value)}
        style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
      />
      <input
        type="text"
        placeholder="Start Time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
      >
        <option value="">Select Type</option>
        <option value="plane">Plane</option>
        <option value="bus">Bus</option>
        <option value="train">Train</option>
      </select>
      <button type="submit" style={{ padding: "5px 10px", borderRadius: "4px", backgroundColor: "black", color: "white", border: "none", cursor: "pointer" }}>
        Submit
      </button>
    </form>
  );
};

export default TripForm;
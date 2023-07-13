import React, { useState } from "react";

interface Coordinate {
  x: number;
  y: number;
  name: string;
  type: "accessPoint" | "crawling";
}

const ImageMap: React.FC = () => {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [mouseCoordinate, setMouseCoordinate] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const imageWidth = 3122;
  const imageHeight = 1944;

  const handleClick = (event: React.MouseEvent<HTMLImageElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (imageWidth / rect.width);
    const y = (event.clientY - rect.top) * (imageHeight / rect.height);
    const name = prompt("Enter a name for the coordinate:");
    if (name) {
      const type = prompt(
        "Enter the type of coordinate (accessPoint or crawling):"
      ) as "accessPoint" | "crawling";
      const newCoordinate = { x, y, name, type };
      setCoordinates([...coordinates, newCoordinate]);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLImageElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (imageWidth / rect.width);
    const y = (event.clientY - rect.top) * (imageHeight / rect.height);
    setMouseCoordinate({ x, y });
  };

  const handleMouseLeave = (): void => {
    setMouseCoordinate(null);
  };

  const handleImportChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = handleFileRead;
      reader.readAsText(file);
    }
  };

  const handleFileRead = (event: ProgressEvent<FileReader>): void => {
    const csvContent = event.target && event.target.result;
    if (typeof csvContent === "string") {
      const parsedCoordinates = parseCSV(csvContent);
      setCoordinates(parsedCoordinates);
    }
  };

  const parseCSV = (csvContent: string): Coordinate[] => {
    const lines = csvContent.split("\n");
    const header = lines[0].split(",");
    return lines.slice(1).map((line) => {
      const values = line.split(",");
      const coordinate: Coordinate = {
        x: parseFloat(values[header.indexOf("X")]),
        y: parseFloat(values[header.indexOf("Y")]),
        name: values[header.indexOf("Name")],
        type: values[header.indexOf("Type")] as "accessPoint" | "crawling",
      };
      return coordinate;
    });
  };

  const handleExportClick = (): void => {
    const csvContent = "data:text/csv;charset=utf-8," + coordinatesToCSV();
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "coordinates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCoordinateDelete = (index: number): void => {
    const updatedCoordinates = [...coordinates];
    updatedCoordinates.splice(index, 1);
    setCoordinates(updatedCoordinates);
  };

  const coordinatesToCSV = (): string => {
    const header = "Name,X,Y,Type\n";
    const rows = coordinates
      .map(({ name, x, y, type }) => `${name},${x},${y},${type}`)
      .join("\n");
    return header + rows;
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-4 min-w-screen">
        <div className="col-span-2">
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src="src\assets\floorplan.png"
              alt="Your Image"
              useMap="#image-map"
              onClick={handleClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: "pointer", width: "100%" }}
            />
            {coordinates.map((coordinate, index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: `${(coordinate.x / imageWidth) * 100}%`,
                  top: `${(coordinate.y / imageHeight) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    backgroundColor:
                      coordinate.type === "accessPoint" ? "red" : "blue",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                  }}
                ></div>
                <span style={{ marginTop: "5px", color: "black" }}>
                  {coordinate.name} : {coordinate.x} , {coordinate.y}{" "}
                </span>
              </div>
            ))}
            {mouseCoordinate && (
              <div
                style={{
                  position: "absolute",
                  left: `${(mouseCoordinate.x / imageWidth) * 100}%`,
                  top: `${(mouseCoordinate.y / imageHeight) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    backgroundColor: "blue",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                  }}
                ></div>
                <span style={{ marginTop: "5px", color: "black" }}>
                  Mouse: {mouseCoordinate.x}, {mouseCoordinate.y}
                </span>
              </div>
            )}
            <button onClick={handleExportClick}>Export to CSV</button>
            <input type="file" accept=".csv" onChange={handleImportChange} />
          </div>
        </div>
        <div className="col-span 2">
          <div>
            <h3>Saved Coordinates:</h3>
            {coordinates.length > 0 ? (
              <ul>
                {coordinates.map((coordinate, index) => (
                  <li key={index}>
                    {coordinate.name}: x={coordinate.x}, y={coordinate.y}, type=
                    {coordinate.type}
                    <button onClick={() => handleCoordinateDelete(index)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No coordinates saved.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageMap;

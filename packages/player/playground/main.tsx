import { StrictMode, useMemo, useState, type DragEvent } from "react";
import { createRoot } from "react-dom/client";
import { GMLPlayer, type KeyboardMode } from "@gmljs/player";
import "@gmljs/player/style.css";

const samples = import.meta.glob<string>("./samples/*.xml", {
  query: "?raw",
  import: "default",
  eager: true,
});

const sampleNames = Object.keys(samples).sort();

function fileName(path: string) {
  return path.slice(path.lastIndexOf("/") + 1);
}

function App() {
  const [source, setSource] = useState(
    sampleNames.find((name) => name.endsWith("example001.xml")) ?? sampleNames[0] ?? "",
  );
  const [loaded, setLoaded] = useState<{ name: string; gml: string } | null>(null);
  const [controls, setControls] = useState(true);
  const [preview, setPreview] = useState(true);
  const [autoPlay, setAutoPlay] = useState(() =>
    new URLSearchParams(location.search).has("autoplay"),
  );
  const [keyboard, setKeyboard] = useState<KeyboardMode>("focus");
  const [speed, setSpeed] = useState(1);
  const [color, setColor] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [dragging, setDragging] = useState(false);
  const [log, setLog] = useState("");

  const gml = loaded?.gml ?? samples[source] ?? "<gml></gml>";
  const renderOptions = useMemo(() => ({ color, background }), [color, background]);

  const loadFile = async (file: File | undefined) => {
    if (file) {
      setLoaded({ name: file.name, gml: await file.text() });
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void loadFile(event.dataTransfer.files[0]);
  };

  return (
    <div className="app">
      <div className="toolbar">
        <label>
          Sample
          <select
            value={loaded ? "" : source}
            onChange={(event) => {
              setLoaded(null);
              setSource(event.target.value);
            }}
          >
            {loaded ? <option value="">{loaded.name}</option> : null}
            {sampleNames.map((name) => (
              <option key={name} value={name}>
                {fileName(name)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Open
          <input
            type="file"
            accept=".xml,.gml"
            onChange={(event) => void loadFile(event.target.files?.[0])}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={controls}
            onChange={(event) => setControls(event.target.checked)}
          />
          Controls
        </label>
        <label>
          <input
            type="checkbox"
            checked={preview}
            onChange={(event) => setPreview(event.target.checked)}
          />
          Preview
        </label>
        <label>
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(event) => setAutoPlay(event.target.checked)}
          />
          Autoplay (on load)
        </label>
        <label>
          Keyboard
          <select
            value={String(keyboard)}
            onChange={(event) =>
              setKeyboard(
                event.target.value === "false" ? false : (event.target.value as KeyboardMode),
              )
            }
          >
            <option value="focus">focus</option>
            <option value="global">global</option>
            <option value="false">off</option>
          </select>
        </label>
        <label>
          Speed
          <input
            type="range"
            min={0.25}
            max={4}
            step={0.25}
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
          {speed}×
        </label>
        <label>
          Color
          <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
        </label>
        <label>
          Background
          <input
            type="color"
            value={background}
            onChange={(event) => setBackground(event.target.value)}
          />
        </label>
      </div>
      <div
        className={dragging ? "stage stage--dragging" : "stage"}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <GMLPlayer
          // Remount on autoplay changes, since autoPlay applies when the player mounts.
          key={String(autoPlay)}
          gml={gml}
          autoPlay={autoPlay}
          speed={speed}
          renderOptions={renderOptions}
          controls={controls}
          preview={preview}
          keyboard={keyboard}
          onEscape={() => setLog(`onEscape at ${new Date().toLocaleTimeString()}`)}
        />
      </div>
      <div className="log">
        {log || "Drop a .xml file on the player. Resize it from the bottom-right corner."}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

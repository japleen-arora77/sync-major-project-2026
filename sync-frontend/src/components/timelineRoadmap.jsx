import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./timelineRoadmap.css";
import Navbar from "./navbar.jsx";
import Footer from "./footer.jsx";
import axios from "../api/axios.js"

const TimelineRoadmap = () => {
  const [duration, setDuration] = useState("");
  const [unit, setUnit] = useState("months");
  const [loading, setLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [expanded, setExpanded] = useState([]);

  const roadmapRef = useRef(null);

 

  const handleGenerate = async () => {

    if (!duration || Number(duration) <= 0) {
      alert("Duration must be greater than 0");
      return;
    }
    
    if (!duration) return;
    try {
      setLoading(true);
      setRoadmapData(null);
      const response = await axios.post(
        "/accounts/timeline-roadmap/",
        {
          duration: Number(duration),
          unit: unit,
        }
      );
      setRoadmapData(response.data);
      setTimeout(() => {
        roadmapRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
  
    } catch (error) {
      console.error("Roadmap generation failed:", error);
      alert("Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (key) => {
    if (expanded.includes(key)) {
      setExpanded(expanded.filter((item) => item !== key));
    } else {
      setExpanded([...expanded, key]);
    }
  };


  useEffect(() => {
    const fetchSavedRoadmap = async () => {
      try {
        const response = await axios.get("/accounts/timeline-roadmap/");
  
        if (response.data.roadmap_data) {
          setRoadmapData({
            roadmap_data: response.data.roadmap_data
          });
          setDuration(response.data.duration);
          setUnit(response.data.unit);
        }
      } catch (error) {
        console.log("No saved roadmap");
      }
    };
  
    fetchSavedRoadmap();
  }, []);

  return (
    <div>
      <Navbar />

      <div className="timeline-page">
        <div className="container py-5">

          <h2 className="text-center mb-5 main-title">
            Want Timeline Based Roadmap? You Are On Right Page
          </h2>

          {/* FORM */}
          <div className="row justify-content-center mb-4">
            <div className="col-md-4">
              <label className="form-label form-title fw-bold">Duration</label>
              <input
                type="number"
                min="1"
                className="form-control custom-input"
                placeholder="1 / 2 / 3 etc"
                value={duration}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "" || Number(value) > 0) {
                    setDuration(value);
                  }
                }}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label form-title fw-bold">Units</label>
              <select
                className="form-control custom-input"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>

          <div className="text-center mb-5">
            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Roadmap"}
            </button>
          </div>

          {loading && (
            <div className="ai-loader-container text-center">
              <div className="dot-loader">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="loader-text">
                Generating your personalized roadmap…
              </p>
            </div>
          )}

          {/* ROADMAP */}
          {roadmapData && !loading && (
            <div ref={roadmapRef} className="mt-5">

              
              <h2 className="text-center mb-5 skill-head">
                Timeline based customized roadmap:
              </h2>
              <h2>
  {roadmapData.roadmap_data.timeline_type === "weeks"
    ? "Weekly Roadmap"
    : "Monthly Roadmap"}
</h2>

              <div className="timeline-wrapper">
                <div className="timeline-line"></div>

                {Object.entries(
                  roadmapData.roadmap_data.roadmap
                ).map(([key, value]) => (
                  <div
                    key={key}
                    className={`timeline-item ${
                      expanded.includes(key) ? "active" : ""
                    }`}
                  >
                    <div className="timeline-dot"></div>

                    <div
                      className="timeline-card"
                      onClick={() => toggleExpand(key)}
                    >
                      <h5>{key}</h5>
                      <h6 className="focus">{value.focus}</h6>

                      <p className="small goal mb-2">
                        Goal: {value.goal}
                      </p>

                      <div className="topics">
                        {value.topics.map((topic, i) => (
                          <span key={i} className="topic-badge">
                            {topic}
                          </span>
                        ))}
                      </div>

                      {expanded.includes(key) && (
                        <div className="details">
                          <hr />
                          <p>{value.details}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TimelineRoadmap;
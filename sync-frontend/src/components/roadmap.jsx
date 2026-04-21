import React, { useState,useEffect } from "react";
import "./roadmap.css";
import axios from "../api/axios.js";

const Roadmap = () => {
  const [roadmapSteps,setRoadmapSteps]=useState([]);

  //fetch backend res 
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await axios.get("/accounts/career-analysis/");
        
        const roadmapData = res.data.roadmap.map((item) => ({
          step: `Step ${item.step}`,
          title: item.title,
          skills: item.skills_to_learn,
          description: item.description
        }));

        setRoadmapSteps(roadmapData);
      } catch (error) {
        console.error("Failed to load roadmap:", error);
      }
    };

    fetchRoadmap();
  }, []);

  return (
    <div className="container my-5">

      <div className="roadmap-wrapper">
        {roadmapSteps.map((item, index) => (
          <div className="roadmap-item" key={index}>
            
            {/* Left: Step */}
            <div className="roadmap-left">
              <h4 className="roadmap-step">{item.step}</h4>
            </div>

            {/* Center: Line nd Dot */}
            <div className="roadmap-center">
              <div className="roadmap-dot"></div>
              {index !== roadmapSteps.length - 1 && (
                <div className="roadmap-line"></div>
              )}
            </div>
 
            {/* Right: Content */}
            <div className="roadmap-right"> 
              <h4 style={{color:'var(--black)'}}>{item.title}</h4>

              <div className="skills">
                {item.skills.map((skill, i) => (
                  <span className="skill-chip" key={i}>
                    {skill}
                  </span>
                ))}
              </div>

              <p style={{color:'var(--black)'}}>{item.description}</p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;

import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import "./overallReadiness.css";
import axios from "../api/axios.js"; 

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const OverallReadiness = () => {
    const sectionRef = useRef(null);
    const [animatedValue, setAnimatedValue] = useState(0);
    const [animate, setAnimate] = useState(false);
    const [dashboard,setdashboard]=useState(null);

    //fetch backend res
    useEffect(()=>{
      const fetchDashboard=async()=>{
        try{
          const res=await axios.get("/accounts/career-analysis/");
          setdashboard(res.data.dashboard);
        }
        catch(err){
          console.error("Dashboard fetch failed", err);
        }
      };
      fetchDashboard();
    },[])

    // Intersection Observer
    useEffect(() => {
      if(!dashboard) return;
      const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setAnimate(true);
                }
            },
            { threshold: 0.1 }
        );
        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }
        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, [dashboard]);


    useEffect(() => {
        if (!animate || !dashboard) return;
        let start = 0;
        const end = dashboard.overall_readiness_percent;
        const duration = 2000;
        const stepTime = 20;
        const increment = end / (duration / stepTime);
        const counter = setInterval(() => {
          start += increment;
          if (start >= end) {
            start = end;
            clearInterval(counter);
          }
          setAnimatedValue(Math.round(start));
        }, stepTime);
      
        return () => clearInterval(counter);
      }, [animate,dashboard]);
      
      if(!dashboard) return null;
  /* ---------------- DATA ---------------- */

  const overallReadiness = dashboard.overall_readiness_percent;

  const readinessBreakdown = Object.entries(
    dashboard.readiness_breakdown
  ).map(([label, value]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value,
  }));

  const strengthWeaknessData = {
    labels: [
      ...dashboard.strengths.map((s) => s.skill),
      ...dashboard.weak_areas.map((w) => w.skill),
    ],
    datasets: [
      {
        label: "Confidence %",
        data: animate
          ? [
              ...dashboard.strengths.map((s) => s.confidence_percent),
              ...dashboard.weak_areas.map((w) => w.confidence_percent),
            ]
          : new Array(
              dashboard.strengths.length + dashboard.weak_areas.length
            ).fill(0),
        backgroundColor: [
          ...dashboard.strengths.map(() => "#6ded7e"),
          ...dashboard.weak_areas.map(() => "#eb6663"),
        ],
        borderRadius: 8,
      },
    ],
  };

  const skillDistributionData = {
    labels: ["Ready skills", "Partially ready", "Missing skills"],
    datasets: [
      {
        data: animate
          ? [
              dashboard.skill_distribution_percentage.ready,
              dashboard.skill_distribution_percentage.partially_ready,
              dashboard.skill_distribution_percentage.missing,
            ]
          : [0, 0, 100],
        backgroundColor: ["#6ded7e", "#fad669", "#eb6663"],
        borderWidth: 0,
      },
    ],
  };

  const overallGaugeData = {
    datasets: [
      {
        data: animate
          ? [overallReadiness, 100 - overallReadiness]
          : [0, 100],
        backgroundColor: ["#6ded7e", "#e5e7eb"],
        borderWidth: 0,
        cutout: "75%",
      },
    ],
  };

  const commonTooltip = {
    tooltip: {
      callbacks: {
        label: (context) => `${context.raw}%`,
      },
    },
  };


  return (
    <div className="container my-5" ref={sectionRef}>
      {/* Overall Gauge Section */}
      <div className="row mb-5">
        <div className="chart-card">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <h3 className="mb-3">Overall Readiness</h3>
              <p className="text-muted">
                Your readiness is calculated based on your skills and education
                alignment with the selected job role.
              </p>
              <p className="text-muted">{dashboard.summary.short}</p>
            </div>
            <div className="col-md-6">
            
              <div className="gauge-wrapper">
                <Doughnut data={overallGaugeData}  options={{
      animation: { duration: 1200, easing: "easeOutCubic" },
      plugins: commonTooltip,
    }} />
                <div className="gauge-center">
                  <span>{animatedValue}%</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Skill Distribution & Strengths vs Weakness */}
      <div className="row mb-5">
        {/* Skill Distribution */}
        <div className="col-md-6 mb-4 mb-md-0">
          <div className="chart-card chart-equal-height">
            <h3 className="mb-3 ">Skill Distribution</h3>
            <div className="chart-container">
              <Doughnut
                data={skillDistributionData}
                options={{
                    plugins: commonTooltip,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    animation: { duration: 1200, easing: "easeOutCubic" },
                  }}
              />
            </div>
          </div>
        </div>

        {/* Strengths vs Weakness */}
        <div className="col-md-6">
          <div className="chart-card chart-equal-height">
            <h3 className="mb-3 ">Strengths vs Weakness</h3>
            <div className="chart-container">
              <Bar
                data={strengthWeaknessData}
                options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    animation: { duration: 1200, easing: "easeOutCubic" },
                    plugins: commonTooltip,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
              />
            </div>
          </div>
        </div> 
      </div>

      {/* Readiness Breakdown */}
      <div className="readiness-card mt-5 mb-5">
        <h3 className="mb-3">Readiness breakdown</h3>
        <p>(Factors that make your Readiness score {overallReadiness}%)</p>
        <p>{dashboard.summary.detailed}</p>

        {readinessBreakdown.map((item, index) => (
          <div key={index} className="mb-5">
            <div className="d-flex justify-content-between mb-1">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>

            <div className="progress custom-progress">
              <div
                className="progress-bar "
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverallReadiness;
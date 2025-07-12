import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/ShowReport.css";

const ShowReport = ({ candidateEmail, jobId, onClose }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`/api/candidate-report`, {
          params: { candidateEmail, jobId },
        });
        if (response.data && response.data.success) {
          setReport(response.data.data);
        } else {
          setError("No report found for this candidate and job.");
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        setError("Failed to fetch the report. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [candidateEmail, jobId]);

  if (loading) {
    return (
      <div className="show-report-overlay d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="show-report-overlay">
        <div className="show-report-container">
          <div className="show-report-header">
            <h5>Error</h5>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="show-report-body">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="show-report-overlay">
      <div className="show-report-container">
        <div className="show-report-header">
          <h5>
            Report for {report.candidateName || "Candidate"} ({candidateEmail})         
          </h5>
          
          <h6 className="overall_score_report">Overall Score: {report.score}%</h6>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="show-report-content">
          {/* Left Column */}
          <div className="show-report-left">
            <p><strong>Summary:</strong> {report.summary}</p>
            <p><strong>Strengths:</strong> {report.strengths}</p>
            <p><strong>Weaknesses:</strong> {report.weaknesses}</p>
            <p><strong>Verdict:</strong> {report.verdict}</p>
          </div>

          {/* Right Column */}
          <div className="show-report-right">
            <h6>Detailed Answers:</h6>
            <ul className="list-group">
              {report.answers.map((answer, index) => (
                <li key={index} className="list-group-item">
                  <p><strong>Question:</strong> {answer._question}</p>
                  <p><strong>Answer:</strong> {answer._answer}</p>
                  <p><strong>Positives:</strong> {answer.positives.join(", ")}</p>
                  <p><strong>Negatives:</strong> {answer.negatives.join(", ")}</p>
                  <p><strong>Score:</strong> {answer.score}/100</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowReport;
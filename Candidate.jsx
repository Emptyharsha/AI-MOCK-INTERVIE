import { useEffect, useState } from "react";
import "../css/Candidate.css";
import Header from "./Header";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ShowReport from "./ShowReport";


function Candidate() {
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Set initial loading state to true
  const [emailStatus, setEmailStatus] = useState(null);
  const [isHidden, setIsHidden] = useState(false);
  const [showHidden, setShowHidden] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [sortOption, setSortOption] = useState("");

  const location = useLocation();
  const jobId = new URLSearchParams(location.search).get("jobId");

  useEffect(() => {
    if (jobId) {
      setIsLoading(true); // Set loading to true when fetching begins
      
      // Fetch candidates
      fetch(`/api/candidates?jobId=${jobId}`)
        .then((response) => response.json())
        .then((data) => {
          setCandidates(data.data || []);
          setIsLoading(false); // Set loading to false after data is fetched
        })
        .catch((error) => {
          console.error("Error fetching candidates:", error);
          setIsLoading(false); // Set loading to false if there's an error
        });

      // Fetch job details
      fetch(`/api/openings/${jobId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Job details fetched successfully:", data);
          setJobDetails(data); // Ensure this is correct
        })
        .catch((error) => console.error("Error fetching job details:", error));
    }
  }, [jobId]);

  // Sorting function
  const sortCandidates = (candidatesToSort) => {
    if (!sortOption) return candidatesToSort;

    const sorted = [...candidatesToSort];

    switch (sortOption) {
      case "status-completed":
        return sorted.filter(
          (candidate) => candidate.interviewStatus.toLowerCase() === "completed"
        );
      case "status-terminated":
        return sorted.filter(
          (candidate) => candidate.interviewStatus.toLowerCase() === "terminated"
        );
      case "status-exitted":
        return sorted.filter(
          (candidate) => candidate.interviewStatus.toLowerCase() === "exitted"
        );
      case "status-pending":
        return sorted.filter(
          (candidate) => candidate.interviewStatus.toLowerCase() === "pending"
        );
      case "date-latest":
        return sorted.sort(
          (a, b) => new Date(b.interviewDate || 0) - new Date(a.interviewDate || 0)
        );
      case "date-oldest":
        return sorted.sort(
          (a, b) => new Date(a.interviewDate || 0) - new Date(b.interviewDate || 0)
        );
      case "score-highest":
        return sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
      case "score-lowest":
        return sorted.sort((a, b) => (a.score || 0) - (b.score || 0));
      case "trust-highest":
        return sorted.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
      case "trust-lowest":
        return sorted.sort((a, b) => (a.trustScore || 0) - (b.trustScore || 0));
      case "name-atoz":
        return sorted.sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          )
        );
      default:
        return sorted;
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();
    const matchesSearch = searchQuery
      ? fullName.includes(searchQuery.toLowerCase())
      : true;
    const matchesHidden = showHidden || !candidate.isHidden;
    return matchesSearch && matchesHidden;
  });

  // Apply sorting to filtered candidates
  const sortedCandidates = sortCandidates(filteredCandidates);

  // Handle select all checkbox
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedCandidates(sortedCandidates.map((candidate) => candidate._id));
    } else {
      // If already selected, deselect all
      setSelectedCandidates([]);
    }
  };


  const handleShowReport = (candidateEmail, jobId) => {
    setSelectedCandidate({ candidateEmail, jobId });
    setShowReportModal(true);
  };

  const handleCloseReport = () => {
    setShowReportModal(false);
    setSelectedCandidate(null);
  };

  // Handle individual checkbox selection
  const handleSelectCandidate = (candidateId) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(
        selectedCandidates.filter((id) => id !== candidateId)
      );
      setSelectAll(false);
    } else {
      setSelectedCandidates([...selectedCandidates, candidateId]);
      if (
        [...selectedCandidates, candidateId].length === sortedCandidates.length
      ) {
        setSelectAll(true);
      }
    }
  };

  // Handle delete function
  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedCandidates.length} candidate(s)?`
      )
    ) {
      try {
        await Promise.all(
          selectedCandidates.map((candidateId) =>
            axios.delete(`/api/candidates/${candidateId}`)
          )
        );
        setCandidates(
          candidates.filter(
            (candidate) => !selectedCandidates.includes(candidate._id)
          )
        );
        setSelectedCandidates([]);
        setSelectAll(false);
      } catch (error) {
        console.error("Error deleting candidates:", error);
      }
    }
  };

  // Actions Dropdown Component
  const ActionsDropdown = ({
    selectedCount,
    onDelete,
    onHiddenStatusChange,
    isHidden,
    onSetHiddenStatus,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <div className="actions-dropdown">
        <button
          className="btn btn-primary dropdown-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          Actions {selectedCount > 0 ? `(${selectedCount})` : ""}
        </button>
        {isOpen && (
          <div className="dropdown-menu show">
            {selectedCount > 0 && (
              <>
                <div style={{ padding: "10px" }}> {/* Added padding */}
                  <button
                    className="dropdown-item"
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      onDelete();
                      setIsOpen(false);
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div className="dropdown-divider"></div>
                <div className="px-3 py-2">
                  <label>Hidden Status:</label>
                  <select
                    className="form-control my-2"
                    value={isHidden}
                    onChange={(e) => onSetHiddenStatus(e.target.value === "true")}
                  >
                    <option value="true">Hide</option>
                    <option value="false">Unhide</option>
                  </select>
                  <button
                    className="btn btn-sm btn-primary w-100"
                    onClick={() => {
                      onHiddenStatusChange();
                      setIsOpen(false);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </>
            )}
            {selectedCount === 0 && (
              <div className="px-3 py-2">No actions available</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Open modal for adding candidate
  const handleAddCandidate = () => {
    setShowModal(true);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setCandidateEmail("");
    setCandidateName("");
    setEmailStatus(null);
  };

  // Send email to candidate
  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!candidateEmail) {
      alert("Please enter an email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/sendmail', {
        recipientEmails: [candidateEmail],
        jobId: jobId,
        candidateName: candidateName
      });
      
      setEmailStatus({
        success: true,
        message: `Interview link sent to ${candidateEmail}`
      });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
      
    } catch (error) {
      console.error("Error sending email:", error);
      setEmailStatus({
        success: false,
        message: `Failed to send email: ${error.response?.data?.message || error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // handle hidden candidate status
  const handleHiddenCandidate = async () => {
    try {
      await Promise.all(
        selectedCandidates.map((candidateId) =>
          axios.patch(`/api/candidates/${candidateId}`, { isHidden })
        )
      );
      setCandidates(
        candidates.map((candidate) =>
          selectedCandidates.includes(candidate._id)
            ? { ...candidate, isHidden }
            : candidate
        )
      );
      setSelectedCandidates([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error updating candidates:", error);
    }
  };

  // Render the loading bar
  const renderLoadingBar = () => {
    return (
      <div className="loading-container">
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        <p>Loading candidates...</p>
      </div>
    );
  };

  // Render the empty state with instructions
  const renderEmptyState = () => {
    return (
      <div className="empty-state-container">
        <div className="empty-state-content">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3>No candidates available</h3>
          <p>Start by adding candidates for AI interviews for this job role.</p>
          <button className="btn btn-primary btn-lg" onClick={handleAddCandidate}>
            <span>✙</span> Add Candidate
          </button>
          <p className="instruction-note">
            Click the "Add Candidate" button to send interview links via email.
          </p>
        </div>
      </div>
    );
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-intro">
          {jobDetails ? (
            <>
              <h4>
                {(jobDetails.data && jobDetails.data.jobName) ||
                  jobDetails.jobName ||
                  "Job Title Not Available"}
              </h4>
              <div className="interview-link-container">
                <label htmlFor="">Interview Link -</label>
                <input
                  type="text"
                  className="job-id"
                  value={`${import.meta.env.VITE_BASE_URL}/interview/${
                    jobId || "N/A"
                  }`}
                  readOnly
                  onClick={() =>
                    handleCopyToClipboard(
                      `${import.meta.env.VITE_BASE_URL}/interview/${jobId || "N/A"}`
                    )
                  }
                />
              </div>
            </>
          ) : (
            <>
              <p>Loading job details...</p>
              <div className="interview-link-container">
                <label htmlFor="">Interview Link -</label>
                <input
                  type="text"
                  className="job-id"
                  value={`${import.meta.env.VITE_BASE_URL}/interview/${
                    jobId || "N/A"
                  }`}
                  readOnly
                  onClick={() =>
                    handleCopyToClipboard(
                      `${import.meta.env.VITE_BASE_URL}/interview/${jobId || "N/A"}`
                    )
                  }
                />
              </div>
            </>
          )}
        </div>
        <hr className="horizonatl-line" />
        <div className="dashboard-header">
          <div className="candidates-heading">
            <h2>Candidates</h2>
            <div className="info-tooltip">
              <button className="info-button">i</button>
              <div className="tooltip-content">
                <h4>Trust Score Rules</h4>
                <ul>
                  <li>The maximum trust score is 15 points.</li>
                  <li>A warning deducts 1 point from the trust score.</li>
                  <li>Warnings are issued for the following behaviors:</li>
                  <ul>
                    <li>Camera stops functioning</li>
                    <li>Candidate moves out of the camera frame</li>
                    <li>Candidate looks away from the screen</li>
                    <li>Candidate exits full-screen mode</li>
                    <li>Candidate switches tabs or windows</li>
                  </ul>
                  <li>
                    If a candidate looks away from the screen, they receive a warning and lose 1 point, but the interview continues.
                  </li>
                  <li>
                    For all other behaviors, if a candidate receives 3 warnings for the same issue, the interview is terminated.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="buttons">
            {/* <button className="btn btn-primary">⚙ Add Custom Field</button> */}
            <button className="btn btn-primary" onClick={handleAddCandidate}>✙ Add Candidate</button>
            {/* <button className="btn btn-warning">📤 Upload Resume</button> */}
            {/* <button className="btn btn-success">📰 Add Event</button> */}
            
            <ActionsDropdown
              selectedCount={selectedCandidates.length}
              onDelete={handleDelete}
              onHiddenStatusChange={handleHiddenCandidate}
              isHidden={isHidden}
              onSetHiddenStatus={setIsHidden}
            />
          </div>
        </div>
        <div className="dashboard-candidates">
          <div className="dashboard-filters">
            <label>
              <input
                type="checkbox"
                checked={showHidden}
                onChange={(e) => setShowHidden(e.target.checked)}
              />{" "}
              Show Hidden Candidates
            </label>
            <select
              className="form-control"
              style={{ width: "200px" }}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Sort By...</option>
              <optgroup label="Interview Status">
                <option value="status-completed">Status: Completed</option>
                <option value="status-terminated">Status: Terminated</option>
                <option value="status-exitted">Status: Exitted</option>
                <option value="status-pending">Status: Pending</option>
              </optgroup>
              <optgroup label="Interview Date">
                <option value="date-latest">Date: Latest</option>
                <option value="date-oldest">Date: Oldest</option>
              </optgroup>
              <optgroup label="Score">
                <option value="score-highest">Score: Highest</option>
                <option value="score-lowest">Score: Lowest</option>
              </optgroup>
              <optgroup label="Trust Score">
                <option value="trust-highest">Trust Score: Highest</option>
                <option value="trust-lowest">Trust Score: Lowest</option>
              </optgroup>
              <optgroup label="Name">
                <option value="name-atoz">Name: A to Z</option>
              </optgroup>
            </select>
          </div>
          <hr className="horizonatl-line2" />
          <div className="search-container">
            <input
              type="text"
              placeholder="Search"
              className="dashboard-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Show loading bar, empty state, or candidate table based on state */}
          {isLoading ? (
            renderLoadingBar()
          ) : candidates.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>INTERVIEW DATE</th>
                    <th>NAME</th>
                    <th>DETAILS</th>
                    <th>SCORE <br /> (Out of 100)</th>
                    <th>TRUST SCORE <br /> (Out of 15)</th>
                    <th>INTERVIEW STATUS</th>
                    <th>HIDDEN STATUS</th>
                    <th>VIEW REPORT</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCandidates.length > 0 ? (
                    sortedCandidates.map((candidate) => (
                      <tr key={candidate._id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate._id)}
                            onChange={() => handleSelectCandidate(candidate._id)}
                          />
                        </td>
                        <td>
                          {candidate.interviewDate
                            ? new Date(candidate.interviewDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "N/A"}
                        </td>
                        <td>{`${candidate.firstName} ${candidate.lastName}`}</td>
                        <td>
                          <div>
                            <strong>Experience:</strong>{" "}
                            {candidate.experience || "N/A"}
                          </div>
                          <div>
                            <strong>Email:</strong> {candidate.email || "N/A"}
                          </div>
                          <div>
                            <strong>Phone:</strong>{" "}
                            {candidate.phoneNumber || "N/A"}
                          </div>
                        </td>
                        <td>{candidate.score || "N/A"}</td>
                        <td>{candidate.trustScore || "N/A"}</td>
                        <td>{candidate.interviewStatus || "Pending"}</td>
                        <td>{candidate.isHidden ? "✅" : "❌"}</td>
                        <td>
                          <button
                            className="btn btn-info"
                            onClick={() =>
                              handleShowReport(candidate.email, jobId)
                            }
                          >
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" align="center">
                        No matching candidates found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showReportModal && selectedCandidate && (
        <ShowReport
          candidateEmail={selectedCandidate.candidateEmail}
          jobId={selectedCandidate.jobId}
          onClose={handleCloseReport}
        />
      )}

      {/* Add Candidate Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Candidate</h3>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSendEmail}>
                <div className="form-group">
                  <label htmlFor="candidateName">Candidate Name (Optional)</label>
                  <input
                    type="text"
                    id="candidateName"
                    className="form-control"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Enter candidate name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="candidateEmail">Email Address *</label>
                  <input
                    type="email"
                    id="candidateEmail"
                    className="form-control"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="form-info">
                  <p>An email with the interview link will be sent to the candidate.</p>
                  {jobDetails && (
                    <p>Job: {(jobDetails.data && jobDetails.data.jobName) || jobDetails.jobName}</p>
                  )}
                </div>
                {emailStatus && (
                  <div className={`alert ${emailStatus.success ? 'alert-success' : 'alert-danger'}`}>
                    {emailStatus.message}
                  </div>
                )}
                <div className="form-buttons">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isLoading || !candidateEmail}
                  >
                    {isLoading ? "Sending..." : "Send Interview Link"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Candidate;
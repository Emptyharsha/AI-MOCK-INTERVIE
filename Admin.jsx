import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../css/admin.css";
import JobListing from './JobListing.jsx';
import { useState, useEffect } from "react";

export default function Admin() {
  const navigate = useNavigate();
  const [jobsData, setJobsData] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  
  useEffect(() => {
    setIsLoading(true); // Set loading to true when fetching begins
    fetch('/api/openings')
      .then(response => response.json())
      .then(data => {
        const sortedData = (data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJobsData(sortedData);
        setIsLoading(false); // Set loading to false after data is fetched
      })
      .catch(error => {
        console.error('Error fetching jobs:', error);
        setIsLoading(false); // Set loading to false if there's an error
      });
  }, []);
  
  useEffect(() => {
    setJobs(jobsData);
  }, [jobsData]);
  
  useEffect(() => {
    console.log(jobs);
  }, [jobs]);
  
  const handleCreateOpening = () => {
    navigate("/openingtype");
  };
  
  // Function to perform search
  const performSearch = (value) => {
    // Clean the search term
    const cleanSearchTerm = value.toLowerCase().replace(/[\s/\-_,.()\[\]{}|\\+]+/g, '');
    
    if (!cleanSearchTerm) {
      // If search is empty, show all jobs
      setJobs(jobsData);
      return;
    }
    
    setJobs(jobsData.filter((job) => {
      // Check if search term exists in job name
      const jobNameMatch = job.jobName && 
        job.jobName.toLowerCase().replace(/[\s/\-_,.()\[\]{}|\\+]+/g, '').includes(cleanSearchTerm);
      
      // Check if search term exists in experience range
      const experienceMatch = job.experienceRange && 
        job.experienceRange.join(' ').toLowerCase().replace(/[\s/\-_,.()\[\]{}|\\+]+/g, '').includes(cleanSearchTerm);
      
      // Check if search term exists in responsibilities
      const responsibilitiesMatch = job.responsibilities && 
        job.responsibilities.some(resp => 
          resp.toLowerCase().replace(/[\s/\-_,.()\[\]{}|\\+]+/g, '').includes(cleanSearchTerm)
        );
      
      // Check if search term exists in skillGroups
      let skillsMatch = false;
      if (job.skillGroups && Array.isArray(job.skillGroups)) {
        skillsMatch = job.skillGroups.some(group => {
          // Check group name
          if (group.groupName && 
              group.groupName.toLowerCase().replace(/[\s/\-_,.()\[\]{}|\\+]+/g, '').includes(cleanSearchTerm)) {
            return true;
          }
          
          // Check skills within the group
          if (group.skills && Array.isArray(group.skills)) {
            return group.skills.some(skill => 
              skill.toLowerCase().replace(/[\s/\-_,.()\[\]{}|\\+]+/g, '').includes(cleanSearchTerm)
            );
          }
          
          return false;
        });
      }
      
      // Return true if the search term is found in any of these fields
      return jobNameMatch || experienceMatch || responsibilitiesMatch || skillsMatch;
    }));
  };
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    performSearch(searchValue);
  };
  
  // Handle search input changes
  const handleSearchInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    
    // If search input is cleared, show all jobs immediately
    if (!newValue.trim()) {
      setJobs(jobsData);
    }
  };
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <p className="loading-text">Loading job openings...</p>
    </div>
  );
  
  return (
    <>
      <Header />
      <div className="wrapper">
        <div>
          <input
            className="btn-1"
            type="button"
            value="Create Opening"
            onClick={handleCreateOpening}
          />
        </div>
        <div>
          <form className="d-flex" role="search" onSubmit={handleSearch}>
            <input
              value={searchValue}
              onChange={handleSearchInputChange}
              className="form-control me-2"
              type="search"
              placeholder="Search jobs, skills, responsibilities..."
              aria-label="Search"
            />
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </form>
        </div>
      </div>
      <b><p>All Openings</p></b>
      
      {/* Conditional rendering for loading state */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="job-list">
          <JobListing jobs={jobs} setJobs={setJobs} />
        </div>
      )}
    </>
  );
}
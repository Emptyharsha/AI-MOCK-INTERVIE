import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Box } from "@mui/material";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import "../css/JobListing.css";

import MyContext from "../context";

const JobListing = ({ jobs, setJobs }) => {
  const [jobData_] = useContext(MyContext);
  const { jobData, setJobData } = jobData_;
  const navigate = useNavigate();
  const [openDeleteItemId, setOpenDeleteItemId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleDelete = (jobId) => {
    setOpenDeleteItemId(jobId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = (jobId) => {
    setOpenDialog(false);
    fetch(`/api/openings/${jobId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
          console.log("Job deleted successfully");
        } else {
          console.error("Failed to delete job");
        }
      })
      .catch((error) => console.error("Error deleting job:", error));
  };

  const handleCancel = () => {
    setOpenDialog(false);
    setOpenDeleteItemId(null);
  };

  const handleUpdate = (jobId) => {
    navigate(`/update-opening?id=${jobId}`, { state: { existingData: jobs } });
  };

  const handleShowCandidates = (job) => {
    setJobData(job);
    navigate(`/candidate?jobId=${job._id}`);
  };

  const handleCreateJobOpening = () => {
    navigate("/openingtype");
  };
  
  
  const NoJobsInstructions = () => (
    <Paper elevation={3} className="instructions-container">
      <Box p={4} textAlign="center">
        <Typography variant="h4" gutterBottom>Welcome to Interview Openings</Typography>
        <Typography variant="body1" paragraph>
          You don't have any Interview listings yet. Here's how to get started:
        </Typography>
        
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>How Job Openings Work:</Typography>
          <Typography variant="body1" paragraph>
            1. <strong>Create a job opening</strong> by defining the role, experience requirements, and skills needed.
          </Typography>
          <Typography variant="body1" paragraph>
            2. <strong>Define skill groups</strong> to organize required competencies (e.g., Technical Skills, Soft Skills).
          </Typography>
          <Typography variant="body1" paragraph>
            3. <strong>Add responsibilities</strong> to clearly communicate what the role entails.
          </Typography>
          <Typography variant="body1" paragraph>
            4. <strong>Send emails to multiple candidates</strong> while creating the job to notify them about the opportunity.
          </Typography>
          <Typography variant="body1" paragraph>
            5. Once created, you can <strong>update openings</strong>, <strong>track candidates</strong>, or <strong>remove listings</strong> when filled.
          </Typography>
        </Box>
        
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box mb={2} display="flex" alignItems="center">
            <EmailIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body1">
              Reach potential candidates instantly by sending batch emails during job creation!
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateJobOpening}
          >
            Create Your First Job Opening
          </Button>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <div className="job-list">
      {jobs.length > 0 ? (
        jobs.map((job) => (
          <div key={job._id} className="job-card">
            <h3>{job.jobName}</h3>
            <p>
              <strong>Experience Range:</strong>{" "}
              {job.experienceRange ? job.experienceRange.join(" - ") : "N/A"}{" "}
              years
            </p>
            <div className="skill-groups">
              <strong>Skills Required:</strong>
              {Array.isArray(job.skillGroups) && job.skillGroups.length > 0 ? (
                job.skillGroups.map((group, index) => (
                  <Accordion key={index}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel-${index}-content`}
                      id={`panel-${index}-header`}
                    >
                      <Typography variant="h6">{group.groupName}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>
                        <em>{group.criteria}</em>
                      </Typography>
                      <ul>
                        {Array.isArray(group.skills) && group.skills.length > 0 ? (
                          group.skills.map((skill, skillIndex) => (
                            <li key={skillIndex}>{skill}</li>
                          ))
                        ) : (
                          <li>No skills listed</li>
                        )}
                      </ul>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <p>No skill groups available</p>
              )}
            </div>

            <div>
              <strong>Responsibilities:</strong>
              <ul>
                {Array.isArray(job.responsibilities) &&
                  job.responsibilities.length > 0 ? (
                  job.responsibilities.map((responsibility, index) => (
                    <li key={index}>{responsibility}</li>
                  ))
                ) : (
                  <li>No responsibilities listed</li>
                )}
              </ul>
            </div>

            <div className="job-actions">
              <Button
                onClick={() => handleUpdate(job._id)}
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
              >
                Update
              </Button>
              <Button
                onClick={() => handleDelete(job._id)}
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
              <Button
                onClick={() => handleShowCandidates(job)}
                variant="outlined"
                color="primary"
              >
                Show Candidates
              </Button>
            </div>
          </div>
        ))
      ) : (
        <NoJobsInstructions />
      )}

      <Dialog open={openDialog} onClose={handleCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this job listing? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleConfirmDelete(openDeleteItemId)} color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default JobListing;
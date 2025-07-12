import React, { useState, useEffect, useRef } from "react";
import "../css/JobOpeningForm.css";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Slider from "@mui/material/Slider";
import axios from "axios";

const JobOpeningForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jobType = location.state?.jobType || "technical";

  // Create refs for all form field containers
  const jobNameRef = useRef(null);
  const responsibilitiesRef = useRef(null);
  const questionCategoryRef = useRef(null); //***********
  const skillGroupsRef = useRef(null);
  const managerNameRef = useRef(null);
  const managerPhoneRef = useRef(null);
  const managerEmailRef = useRef(null);
  const notificationEmailsRef = useRef(null);
  const maxQuestionsRef = useRef(null);
  const autoSkipTimeoutRef = useRef(null);

  // Form state
  const [jobName, setJobName] = useState("");
  const [experienceRange, setExperienceRange] = useState([0, 2]);
  const [responsibilities, setResponsibilities] = useState([]);

  const [questionCategory, setQuestionCategory] = useState(""); //******** */
  const [questions, setQuestions] = useState([]); //********* */
  const [categories, setCategories] = useState([]); //********** */
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [allQuestions, setAllQuestions] = useState({}); // { questionId: questionText }

  const [newResponsibility, setNewResponsibility] = useState("");
  const [skillGroups, setSkillGroups] = useState([]);
  const [newSkillGroupName, setNewSkillGroupName] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newCriteria, setNewCriteria] = useState("All of them are mandatory");
  const [assignedManager, setAssignedManager] = useState({
    name: "",
    phone: "",
    email: "",
    allowContact: false,
  });
  const [notificationEmails, setNotificationEmails] = useState([]);
  const [newNotificationEmail, setNewNotificationEmail] = useState("");
  const [maxQuestions, setMaxQuestions] = useState(10);
  const [autoSkipTimeout, setAutoSkipTimeout] = useState(30);
  const [aiLanguage, setAiLanguage] = useState("English");
  const [candidateLanguage, setCandidateLanguage] = useState("English");
  const [interviewSettings, setInterviewSettings] = useState({
    codeEditorRequired: false,
    interviewBasedOnResume: false,
    enableVirtualAvatar: false,
    allowMobileInterview: false,
  });
  const [webcamSettings, setWebcamSettings] = useState({
    webcamRequired: false,
    secondaryCameraVerification: false,
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Form validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (jobType === "technical") {
      setJobName("Full Stack Developer Intern");
      setResponsibilities([
        "Build, test, and maintain backend components using Node.js and work with SQL.",
        "Contribute to the development and maintenance of web interfaces.",
        "Tackle new projects and support existing applications, adapt to changes efficiently.",
      ]);
      // call the function to fetch categories
      fetchCategories();
      setSkillGroups([
        {
          groupName: "Backend Development",
          criteria: "All of them are mandatory",
          skills: ["Node.js"],
        },
      ]);
    } else if (jobType === "non-technical") {
      setJobName("HR Intern");
      setResponsibilities([
        "Assist in the recruitment process by screening resumes and scheduling interviews.",
        "Help organize and coordinate HR events and activities.",
        "Support the HR team in various administrative tasks.",
      ]);
      setSkillGroups([
        {
          groupName: "HR Skills",
          criteria: "All of them are mandatory",
          skills: ["Communication", "Organizational Skills"],
        },
      ]);
    }
  }, [jobType]);

  // Handle experience range slider change
  const handleChange = (event, newValue) => {
    setExperienceRange(newValue);
  };

  // Map error fields to their corresponding refs
  const errorFieldToRefMap = {
    jobName: jobNameRef,
    responsibilities: responsibilitiesRef,
    questionCategory: questionCategoryRef,
    skillGroups: skillGroupsRef,
    managerName: managerNameRef,
    managerPhone: managerPhoneRef,
    managerEmail: managerEmailRef,
    notificationEmails: notificationEmailsRef,
    maxQuestions: maxQuestionsRef,
    autoSkipTimeout: autoSkipTimeoutRef,
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    // Job name validation
    if (!jobName.trim()) {
      newErrors.jobName = "Job name is required";
    }

    // Responsibilities validation
    if (responsibilities.length === 0) {
      newErrors.responsibilities = "At least one responsibility is required";
    }

    // Category of Question validation
    if (!questionCategory.trim()) {
      newErrors.questionCategory = "Category of Question is required";
    }

    // Skills validation
    if (skillGroups.length === 0) {
      newErrors.skillGroups = "At least one skill group is required";
    } else {
      // Check if any skill group has no skills
      const emptySkillGroups = skillGroups.filter(
        (group) => group.skills.length === 0
      );
      if (emptySkillGroups.length > 0) {
        newErrors.skillGroups = "Each skill group must have at least one skill";
      }
    }

    // Manager validation
    if (!assignedManager.name.trim()) {
      newErrors.managerName = "Manager name is required";
    }

    if (!assignedManager.email.trim()) {
      newErrors.managerEmail = "Manager email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(assignedManager.email)) {
      newErrors.managerEmail = "Manager email is invalid";
    }

    if (!assignedManager.phone.trim()) {
      newErrors.managerPhone = "Manager phone number is required";
    } else if (!/^\d{10}$/.test(assignedManager.phone.replace(/[^0-9]/g, ""))) {
      newErrors.managerPhone = "Phone number should be 10 digits";
    }

    // Validate notification emails
    const invalidEmails = notificationEmails.filter(
      (email) => !/^\S+@\S+\.\S+$/.test(email)
    );
    if (invalidEmails.length > 0) {
      newErrors.notificationEmails =
        "One or more notification emails are invalid";
    }

    // Validate max questions
    if (maxQuestions < 1) {
      newErrors.maxQuestions = "Maximum questions must be at least 1";
    }

    // Validate auto skip timeout
    if (autoSkipTimeout < 5) {
      newErrors.autoSkipTimeout =
        "Auto skip timeout must be at least 5 seconds";
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errorFields: Object.keys(newErrors),
    };
  };

  // fetch the categories from the backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/questions/categories");
      console.log(response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fectching categories:", error);
    }
  };

  // fetch questions related to particular category
  const fetchQuestionsByCategory = async (categoryId) => {
    try {
      const response = await axios.get(
        `/api/questions/categories/${categoryId}/questions`
      );
      const newQuestions = response.data.reduce((acc, question) => {
        acc[question._id] = question.text; // Store question text by ID
        return acc;
      }, {});
      setAllQuestions((prev) => ({ ...prev, ...newQuestions })); // Merge with existing questions
      setQuestions(response.data); // Set questions for the current category
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  // Add a category and its selected questions
  const handleAddCategoryWithQuestions = (
    categoryId,
    categoryName,
    selectedQuestions
  ) => {
    const existingCategoryIndex = selectedCategories.findIndex(
      (cat) => cat.categoryId === categoryId
    );

    if (existingCategoryIndex !== -1) {
      // Category already exists, update its questions
      const updatedCategories = [...selectedCategories];
      const newQuestions = selectedQuestions.map((questionId) => {
        const question = questions.find((q) => q._id === questionId);
        return {
          questionId: question._id,
          questionText: question.text,
        };
      });
      updatedCategories[existingCategoryIndex].questions = [
        ...updatedCategories[existingCategoryIndex].questions,
        ...newQuestions,
      ];
      setSelectedCategories(updatedCategories);
    } else {
      // Add new category
      const newCategory = {
        categoryId,
        categoryName,
        questions: selectedQuestions.map((questionId) => {
          const question = questions.find((q) => q._id === questionId);
          return {
            questionId: question._id,
            questionText: question.text,
          };
        }),
      };
      setSelectedCategories([...selectedCategories, newCategory]);
    }
  };

  // Remove a category
  const handleRemoveCategory = (categoryId) => {
    setSelectedCategories(
      selectedCategories.filter((cat) => cat.categoryId !== categoryId)
    );
  };

  // Remove a question from a category
  const handleRemoveQuestionFromCategory = (categoryId, questionId) => {
    const updatedCategories = selectedCategories.map((cat) => {
      if (cat.categoryId === categoryId) {
        return {
          ...cat,
          questions: cat.questions.filter((q) => q.questionId !== questionId), // Compare with q.questionId
        };
      }
      return cat;
    });
    setSelectedCategories(updatedCategories);
  };

  // Mark field as touched when focused
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      setResponsibilities([...responsibilities, newResponsibility]);
      setNewResponsibility("");
      // Clear any responsibility errors
      setErrors({ ...errors, responsibilities: undefined });
    }
  };

  const handleDeleteResponsibility = (index) => {
    const updatedResponsibilities = responsibilities.filter(
      (_, i) => i !== index
    );
    setResponsibilities(updatedResponsibilities);

    // If no responsibilities left, set error
    if (updatedResponsibilities.length === 0) {
      setErrors({
        ...errors,
        responsibilities: "At least one responsibility is required",
      });
    }
  };

  const handleAddSkillGroup = () => {
    if (newSkillGroupName.trim()) {
      const updatedSkillGroups = [
        ...skillGroups,
        {
          groupName: newSkillGroupName,
          criteria: newCriteria,
          skills: [],
        },
      ];
      setSkillGroups(updatedSkillGroups);
      setNewSkillGroupName("");
      setNewCriteria("All of them are mandatory");
      // Clear any skill group errors
      setErrors({ ...errors, skillGroups: undefined });
    }
  };

  const handleDeleteSkillGroup = (index) => {
    const updatedSkillGroups = skillGroups.filter((_, i) => i !== index);
    setSkillGroups(updatedSkillGroups);

    // If no skill groups left, set error
    if (updatedSkillGroups.length === 0) {
      setErrors({
        ...errors,
        skillGroups: "At least one skill group is required",
      });
    }
  };

  const handleAddSkillToGroup = (groupIndex) => {
    if (newSkill.trim()) {
      const updatedGroups = [...skillGroups];
      updatedGroups[groupIndex].skills.push(newSkill);
      setSkillGroups(updatedGroups);
      setNewSkill("");
      // Clear any skill group errors
      setErrors({ ...errors, skillGroups: undefined });
    }
  };

  const handleDeleteSkill = (groupIndex, skillIndex) => {
    const updatedGroups = [...skillGroups];
    updatedGroups[groupIndex].skills.splice(skillIndex, 1);
    setSkillGroups(updatedGroups);

    // If a skill group now has no skills, update error
    if (updatedGroups[groupIndex].skills.length === 0) {
      setErrors({
        ...errors,
        skillGroups: "Each skill group must have at least one skill",
      });
    }
  };

  const handleAddNotificationEmail = () => {
    if (newNotificationEmail.trim()) {
      // Validate email format
      if (!/^\S+@\S+\.\S+$/.test(newNotificationEmail)) {
        setErrors({
          ...errors,
          newNotificationEmail: "Email format is invalid",
        });
        return;
      }

      setNotificationEmails([...notificationEmails, newNotificationEmail]);
      setNewNotificationEmail("");
      setErrors({
        ...errors,
        newNotificationEmail: undefined,
        notificationEmails: undefined,
      });
    }
  };

  const handleDeleteNotificationEmail = (index) => {
    setNotificationEmails(notificationEmails.filter((_, i) => i !== index));
  };

  const scrollToError = (errorFields) => {
    if (errorFields.length === 0) return;

    // Find the first error field that has a ref
    for (const field of errorFields) {
      const ref = errorFieldToRefMap[field];
      if (ref && ref.current) {
        // Scroll to the error field
        ref.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Try to focus on an input if it exists
        const input = ref.current.querySelector("input, select, textarea");
        if (input) {
          setTimeout(() => {
            input.focus();
          }, 500);
        }

        // Only scroll to the first error
        break;
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const { isValid, errorFields } = validateForm();

    if (!isValid) {
      // Mark all error fields as touched
      const newTouched = errorFields.reduce(
        (acc, field) => {
          acc[field] = true;
          return acc;
        },
        { ...touched }
      );

      setTouched(newTouched);

      // Scroll to the first error field
      setTimeout(() => {
        scrollToError(errorFields);
      }, 100);

      return;
    }

    const formData = {
      jobName,
      experienceRange,
      responsibilities,
      selectedCategories,
      skillGroups,
      assignedManager,
      notificationEmails,
      maxQuestions,
      autoSkipTimeout,
      aiLanguage,
      candidateLanguage,
      interviewSettings,
      webcamSettings,
    };

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/openings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);

        // Display a specific message about email notifications if applicable
        if (notificationEmails.length > 0) {
          setSubmitSuccess(
            `Job opening created successfully! Notification emails ${
              responseData.emailsSent ? "were sent" : "could not be sent"
            } to ${notificationEmails.length} recipient(s).`
          );
        } else {
          setSubmitSuccess("Job opening created successfully!");
        }

        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      } else {
        setSubmitError(
          responseData.message || "Error submitting the form. Please try again."
        );
      }
    } catch (error) {
      setSubmitError(
        `Network error: ${error.message}. Please check your connection and try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to determine if field has error
  const hasError = (field) => {
    return touched[field] && errors[field];
  };

  return (
    <div>
      <Header />
      <div className="job-opening-form">
        <h2>Job Opening</h2>

        <form onSubmit={handleFormSubmit}>
          {/* Job Opening Name */}
          <div
            className={`form-group ${hasError("jobName") ? "has-error" : ""}`}
            ref={jobNameRef}
          >
            <label htmlFor="jobName">
              Job Opening Name: <span className="required">*</span>
            </label>
            <input
              id="jobName"
              type="text"
              value={jobName}
              onChange={(e) => {
                setJobName(e.target.value);
                if (e.target.value.trim()) {
                  setErrors({ ...errors, jobName: undefined });
                }
              }}
              onBlur={() => handleBlur("jobName")}
              className={hasError("jobName") ? "input-error" : ""}
            />
            {hasError("jobName") && (
              <div className="error-text">{errors.jobName}</div>
            )}
          </div>

          {/* Experience Range */}
          <div className="form-group">
            <label>Experience Range (0 - 10 years):</label>
            <Slider
              value={experienceRange}
              onChange={handleChange}
              valueLabelDisplay="auto"
              min={0}
              max={10}
              step={0.5}
            />
            <p>
              Selected Range: {experienceRange[0]} - {experienceRange[1]} years
            </p>
          </div>

          {/* Job Responsibilities */}
          <div
            className={`form-group ${
              hasError("responsibilities") ? "has-error" : ""
            }`}
            ref={responsibilitiesRef}
          >
            <label>
              Job Responsibilities: <span className="required">*</span>
            </label>
            {responsibilities.map((responsibility, index) => (
              <div key={index} className="item-with-delete">
                <input type="text" value={responsibility} readOnly />
                <button
                  type="button"
                  onClick={() => handleDeleteResponsibility(index)}
                  className="delete-button"
                >
                  🗑
                </button>
              </div>
            ))}
            <div className="add-item-row">
              <input
                type="text"
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                placeholder="Add new responsibility"
              />
              <button
                type="button"
                onClick={handleAddResponsibility}
                className="add-button"
              >
                ➕
              </button>
            </div>
            {hasError("responsibilities") && (
              <div className="error-text">{errors.responsibilities}</div>
            )}
          </div>

          {/* Category and Questions Section */}
          <div
            className={`form-group ${
              hasError("selectedCategories") ? "has-error" : ""
            }`}
            ref={questionCategoryRef}
          >
            <label>
              Category and Questions: <span className="required">*</span>
            </label>
            {selectedCategories.map((category) => (
              <div
                key={category.categoryId}
                className="category-with-questions"
              >
                <div className="category-header">
                  <h4>{category.categoryName}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(category.categoryId)}
                    className="delete-button"
                  >
                    🗑
                  </button>
                </div>
                <ul className="questions-list">
                  {category.questions.map((question, index) => (
                    <li key={index} className="question-item">
                      {question.questionText}
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveQuestionFromCategory(
                            category.categoryId,
                            question.questionId
                          )
                        }
                        className="delete-button-small"
                      >
                        🗑
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="add-category-row">
              <select
                value={questionCategory}
                onChange={(e) => {
                  const categoryId = e.target.value;
                  setQuestionCategory(categoryId);
                  if (categoryId.trim()) {
                    setErrors({ ...errors, questionCategory: undefined });
                    fetchQuestionsByCategory(categoryId);
                  }
                }}
                onBlur={() => handleBlur("questionCategory")}
                className={hasError("questionCategory") ? "input-error" : ""}
                // disabled={selectedCategories.length > 0} // Disable dropdown if a category is already selected
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.category}
                  </option>
                ))}
              </select>
              {questionCategory && (
                <div className="questions-selection">
                  <select
                    multiple
                    value={[]} // No need to bind value here
                    onChange={(e) => {
                      const selectedOptions = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      );
                      const selectedCategory = categories.find(
                        (cat) => cat._id === questionCategory
                      );
                      handleAddCategoryWithQuestions(
                        questionCategory,
                        selectedCategory.category,
                        selectedOptions
                      );
                    }}
                  >
                    {questions.map((question) => (
                      <option key={question._id} value={question._id}>
                        {question.text}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* <button
                type="button"
                onClick={() => {
                  setQuestionCategory("");
                  setSelectedCategories([]);
                }}
                className="clear-button"
              >
                Clear Category
              </button> */}
            </div>
            {hasError("selectedCategories") && (
              <div className="error-text">{errors.selectedCategories}</div>
            )}
          </div>

          {/* Skills to Test */}
          <div
            className={`form-group ${
              hasError("skillGroups") ? "has-error" : ""
            }`}
            ref={skillGroupsRef}
          >
            <label>
              Skills to Test: <span className="required">*</span>
            </label>
            {skillGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="skill-group">
                <div className="skill-group-header">
                  <h4>{group.groupName}</h4>
                  <button
                    type="button"
                    onClick={() => handleDeleteSkillGroup(groupIndex)}
                    className="delete-button"
                  >
                    🗑
                  </button>
                </div>
                <p>Criteria: {group.criteria}</p>
                <ul className="skills-list">
                  {group.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="skill-item">
                      {skill}
                      <button
                        type="button"
                        style={{ backgroundColor: "#3c9dff", color: "#ffffff", border: "2px solid darkblue", padding: "10px 20px", cursor: "pointer", transition: "background-color 0.3s, transform 0.2s", marginLeft: "30px" }}
                        onClick={() =>
                          handleDeleteSkill(groupIndex, skillIndex)
                        }
                        className="delete-button-small"
                      >
                        🗑
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="add-item-row">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add new skill"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkillToGroup(groupIndex)}
                    className="add-button"
                  >
                    ➕
                  </button>
                </div>
              </div>
            ))}
            <div className="add-skill-group-row">
              <input
                type="text"
                value={newSkillGroupName}
                onChange={(e) => setNewSkillGroupName(e.target.value)}
                placeholder="Add skill group name"
              />
              <select
                value={newCriteria}
                onChange={(e) => setNewCriteria(e.target.value)}
              >
                <option>All of them are mandatory</option>
                <option>At least one is required</option>
              </select>
              <button
                type="button"
                onClick={handleAddSkillGroup}
                className="add-button"
              >
                ➕ Add Skill Group
              </button>
            </div>
            {hasError("skillGroups") && (
              <div className="error-text">{errors.skillGroups}</div>
            )}
          </div>

          {/* Interview Settings */}
          <div className="form-group">
            <h3>Interview Setup</h3>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  style={{ margin: "10px", width: "18px", height: "18px" }}
                  checked={interviewSettings.codeEditorRequired}
                  onChange={(e) =>
                    setInterviewSettings({
                      ...interviewSettings,
                      codeEditorRequired: e.target.checked,
                    })
                  }
                />
                Code Editor Required
              </label>
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  style={{ margin: "10px", width: "18px", height: "18px" }}
                  checked={interviewSettings.interviewBasedOnResume}
                  onChange={(e) =>
                    setInterviewSettings({
                      ...interviewSettings,
                      interviewBasedOnResume: e.target.checked,
                    })
                  }
                />
                Interview Based on Resume
              </label>
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  style={{ margin: "10px", width: "18px", height: "18px" }}
                  checked={interviewSettings.enableVirtualAvatar}
                  onChange={(e) =>
                    setInterviewSettings({
                      ...interviewSettings,
                      enableVirtualAvatar: e.target.checked,
                    })
                  }
                />
                Enable Virtual Avatar
              </label>
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  style={{ margin: "10px", width: "18px", height: "18px" }}
                  checked={interviewSettings.allowMobileInterview}
                  onChange={(e) =>
                    setInterviewSettings({
                      ...interviewSettings,
                      allowMobileInterview: e.target.checked,
                    })
                  }
                />
                Allow Interview from Mobile
              </label>
            </div>
          </div>

          {/* Webcam Settings */}
          <div className="form-group">
            <h3>Webcam Settings</h3>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  style={{ margin: "10px", width: "18px", height: "18px" }}
                  checked={webcamSettings.webcamRequired}
                  onChange={(e) =>
                    setWebcamSettings({
                      ...webcamSettings,
                      webcamRequired: e.target.checked,
                    })
                  }
                />
                Webcam Required
              </label>
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  style={{ margin: "10px", width: "18px", height: "18px" }}
                  checked={webcamSettings.secondaryCameraVerification}
                  onChange={(e) =>
                    setWebcamSettings({
                      ...webcamSettings,
                      secondaryCameraVerification: e.target.checked,
                    })
                  }
                />
                Secondary Camera Verification
              </label>
            </div>
          </div>

          {/* Assigned Manager */}
          <div className="form-group">
            <h3>Assigned Manager</h3>
            <div
              className={hasError("managerName") ? "has-error" : ""}
              ref={managerNameRef}
            >
              <input
                type="text"
                value={assignedManager.name}
                onChange={(e) => {
                  setAssignedManager({
                    ...assignedManager,
                    name: e.target.value,
                  });
                  if (e.target.value.trim()) {
                    setErrors({ ...errors, managerName: undefined });
                  }
                }}
                onBlur={() => handleBlur("managerName")}
                placeholder="Manager Name *"
                className={hasError("managerName") ? "input-error" : ""}
              />
              {hasError("managerName") && (
                <div className="error-text">{errors.managerName}</div>
              )}
            </div>
            <div
              className={hasError("managerPhone") ? "has-error" : ""}
              ref={managerPhoneRef}
            >
              <input
                type="text"
                value={assignedManager.phone}
                onChange={(e) => {
                  setAssignedManager({
                    ...assignedManager,
                    phone: e.target.value,
                  });
                  // Clear phone error if it's valid or empty
                  if (
                    !e.target.value ||
                    /^\d{10}$/.test(e.target.value.replace(/[^0-9]/g, ""))
                  ) {
                    setErrors({ ...errors, managerPhone: undefined });
                  }
                }}
                onBlur={() => handleBlur("managerPhone")}
                placeholder="Phone Number"
                className={hasError("managerPhone") ? "input-error" : ""}
              />
              {hasError("managerPhone") && (
                <div className="error-text">{errors.managerPhone}</div>
              )}
            </div>
            <div
              className={hasError("managerEmail") ? "has-error" : ""}
              ref={managerEmailRef}
            >
              <input
                type="email"
                value={assignedManager.email}
                onChange={(e) => {
                  setAssignedManager({
                    ...assignedManager,
                    email: e.target.value,
                  });
                  // Clear email error if valid or empty
                  if (
                    !e.target.value ||
                    /^\S+@\S+\.\S+$/.test(e.target.value)
                  ) {
                    setErrors({ ...errors, managerEmail: undefined });
                  }
                }}
                onBlur={() => handleBlur("managerEmail")}
                placeholder="Email ID *"
                className={hasError("managerEmail") ? "input-error" : ""}
              />
              {hasError("managerEmail") && (
                <div className="error-text">{errors.managerEmail}</div>
              )}
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  style={{ margin: "10px", width: "18px", height: "18px" }}
                  checked={assignedManager.allowContact}
                  onChange={(e) =>
                    setAssignedManager({
                      ...assignedManager,
                      allowContact: e.target.checked,
                    })
                  }
                />
                Allow Candidates to Contact
              </label>
            </div>
          </div>

          {/* Notification Section */}
          <div className="form-group">
            <h3>Notification Settings</h3>
            <div>
              <label>Add Candidate's Email for Notifications:</label>
              <div
                className={`add-item-row ${
                  hasError("newNotificationEmail") ? "has-error" : ""
                }`}
              >
                <input
                  type="email"
                  value={newNotificationEmail}
                  onChange={(e) => {
                    setNewNotificationEmail(e.target.value);
                    // Clear error if valid or empty
                    if (
                      !e.target.value ||
                      /^\S+@\S+\.\S+$/.test(e.target.value)
                    ) {
                      setErrors({ ...errors, newNotificationEmail: undefined });
                    }
                  }}
                  onBlur={() => handleBlur("newNotificationEmail")}
                  placeholder="Email ID"
                  className={
                    hasError("newNotificationEmail") ? "input-error" : ""
                  }
                />
                <button
                  type="button"
                  onClick={handleAddNotificationEmail}
                  className="add-button"
                >
                  ➕
                </button>
              </div>
              {hasError("newNotificationEmail") && (
                <div className="error-text">{errors.newNotificationEmail}</div>
              )}
            </div>
            <div
              className={hasError("notificationEmails") ? "has-error" : ""}
              ref={notificationEmailsRef}
            >
              {notificationEmails.length > 0 && (
                <ul className="email-list">
                  {notificationEmails.map((email, index) => (
                    <li key={index} className="email-item">
                      {email}
                      <button
                        type="button"
                        onClick={() => handleDeleteNotificationEmail(index)}
                        className="delete-button-small"
                      >
                        🗑
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {hasError("notificationEmails") && (
                <div className="error-text">{errors.notificationEmails}</div>
              )}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="form-group">
            <h3>Additional Settings</h3>
            <div
              className={hasError("maxQuestions") ? "has-error" : ""}
              ref={maxQuestionsRef}
            >
              <label>Maximum Number of Questions to Ask:</label>
              <input
                type="number"
                value={maxQuestions}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setMaxQuestions(value);
                  if (value >= 1) {
                    setErrors({ ...errors, maxQuestions: undefined });
                  }
                }}
                onBlur={() => handleBlur("maxQuestions")}
                min="1"
                className={hasError("maxQuestions") ? "input-error" : ""}
              />
              {hasError("maxQuestions") && (
                <div className="error-text">{errors.maxQuestions}</div>
              )}
            </div>
            <div
              className={hasError("autoSkipTimeout") ? "has-error" : ""}
              ref={autoSkipTimeoutRef}
            >
              <label>Auto Skip Timeout (in seconds):</label>
              <input
                type="number"
                value={autoSkipTimeout}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setAutoSkipTimeout(value);
                  if (value >= 5) {
                    setErrors({ ...errors, autoSkipTimeout: undefined });
                  }
                }}
                onBlur={() => handleBlur("autoSkipTimeout")}
                min="5"
                className={hasError("autoSkipTimeout") ? "input-error" : ""}
              />
              {hasError("autoSkipTimeout") && (
                <div className="error-text">{errors.autoSkipTimeout}</div>
              )}
            </div>
            <div>
              <label>Set AI Language for Questions:</label>
              <select
                value={aiLanguage}
                onChange={(e) => setAiLanguage(e.target.value)}
              >
                <option>English</option>
                <option>Hinglish</option>
              </select>
            </div>
            <div>
              <label>Candidate's Set Language:</label>
              <select
                value={candidateLanguage}
                onChange={(e) => setCandidateLanguage(e.target.value)}
              >
                <option>English</option>
                <option>Hinglish</option>
              </select>
            </div>
          </div>
          {/* Form success/error messages */}
          {submitSuccess && (
            <div className="success-message">
              Job opening created successfully! Redirecting...
            </div>
          )}

          {submitError && <div className="error-message">{submitError}</div>}
          <div className="form-submit">
            <button
              type="submit"
              disabled={isSubmitting}
              className={
                isSubmitting ? "submit-button loading" : "submit-button"
              }
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default JobOpeningForm;

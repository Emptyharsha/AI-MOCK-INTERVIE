import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../css/JobOpeningForm.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateOpening = ({ existingData, onSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const id = new URLSearchParams(location.search).get("id");
  // State management
  const [jobName, setJobName] = useState("");
  const [experienceRange, setExperienceRange] = useState([0, 0]);
  const [responsibilities, setResponsibilities] = useState([]);

  const [questionCategory, setQuestionCategory] = useState(""); // Selected category
  const [questions, setQuestions] = useState([]); // Questions for the selected category
  const [categories, setCategories] = useState([]); // All categories
  const [selectedCategories, setSelectedCategories] = useState([]); // Selected categories and their questions
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

  // Populate form with existing data on mount
  useEffect(() => {
    const existingData = location.state.existingData.find(
      (job) => job._id === id
    );

    if (existingData) {
      setJobName(existingData.jobName || "");
      setExperienceRange(existingData.experienceRange || [0, 0]);
      setResponsibilities(existingData.responsibilities || []);
      setSelectedCategories(existingData.selectedCategories || []);
      setSkillGroups(existingData.skillGroups || []);
      setAssignedManager(existingData.assignedManager || {});
      setNotificationEmails(existingData.notificationEmails || []);
      setMaxQuestions(existingData.maxQuestions || 10);
      setAutoSkipTimeout(existingData.autoSkipTimeout || 30);
      setAiLanguage(existingData.aiLanguage || "English");
      setCandidateLanguage(existingData.candidateLanguage || "English");
      setInterviewSettings(existingData.interviewSettings || {});
      setWebcamSettings(existingData.webcamSettings || {});
    }

    fetchCategories(); // Fetch categories on mount
  }, []);

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/questions/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch questions for the selected category
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
          questions: cat.questions.filter((q) => q.questionId !== questionId),
        };
      }
      return cat;
    });
    setSelectedCategories(updatedCategories);
  };

  // Handlers for adding and removing dynamic fields
  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      setResponsibilities([...responsibilities, newResponsibility]);
      setNewResponsibility("");
    }
  };

  const handleDeleteResponsibility = (index) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const handleAddSkillGroup = () => {
    if (newSkillGroupName.trim()) {
      setSkillGroups([
        ...skillGroups,
        {
          groupName: newSkillGroupName,
          criteria: newCriteria,
          skills: [],
        },
      ]);
      setNewSkillGroupName("");
      setNewCriteria("All of them are mandatory");
    }
  };

  const handleDeleteSkillGroup = (index) => {
    setSkillGroups(skillGroups.filter((_, i) => i !== index));
  };

  const handleAddSkillToGroup = (groupIndex) => {
    if (newSkill.trim()) {
      const updatedGroups = [...skillGroups];
      updatedGroups[groupIndex].skills.push(newSkill);
      setSkillGroups(updatedGroups);
      setNewSkill("");
    }
  };

  const handleDeleteSkill = (groupIndex, skillIndex) => {
    const updatedGroups = [...skillGroups];
    updatedGroups[groupIndex].skills.splice(skillIndex, 1);
    setSkillGroups(updatedGroups);
  };

  const handleAddNotificationEmail = () => {
    if (newNotificationEmail.trim()) {
      setNotificationEmails([...notificationEmails, newNotificationEmail]);
      setNewNotificationEmail("");
    }
  };

  const handleDeleteNotificationEmail = (index) => {
    setNotificationEmails(notificationEmails.filter((_, i) => i !== index));
  };

  // Form submission handler
  const handleFormSubmit = async () => {
    const updatedData = {
      jobName,
      experienceRange,
      responsibilities,
      skillGroups,
      assignedManager,
      notificationEmails,
      maxQuestions,
      autoSkipTimeout,
      aiLanguage,
      candidateLanguage,
      interviewSettings,
      webcamSettings,
      selectedCategories,
    };

    try {
      const response = await fetch(`/api/openings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert("Job Opening updated successfully!");
        navigate("/");
        if (onSubmit) onSubmit(updatedData);
      } else {
        alert("Error updating the job opening.");
      }
    } catch (error) {
      alert("Error updating the job opening: " + error.message);
    }
  };

  return (
    <div className="job-opening-form">
      <h2>Update Job Opening</h2>

      {/* Job Name */}
      <div>
        <label>Job Name:</label>
        <input
          type="text"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
        />
      </div>

      {/* Experience Range */}
      <div>
        <label>Experience Range (years):</label>
        <div>
          <input
            type="number"
            value={experienceRange[0]}
            min="0"
            onChange={(e) =>
              setExperienceRange([
                Math.min(Number(e.target.value), experienceRange[1]),
                experienceRange[1],
              ])
            }
          />
          -
          <input
            type="number"
            value={experienceRange[1]}
            min="0"
            onChange={(e) =>
              setExperienceRange([
                experienceRange[0],
                Math.max(Number(e.target.value), experienceRange[0]),
              ])
            }
          />
        </div>
      </div>

      {/* Responsibilities */}
      <div>
        <label>Responsibilities:</label>
        {responsibilities.map((resp, index) => (
          <div key={index}>
            {resp}{" "}
            <button onClick={() => handleDeleteResponsibility(index)}>
              Delete
            </button>
          </div>
        ))}
        <input
          type="text"
          value={newResponsibility}
          onChange={(e) => setNewResponsibility(e.target.value)}
          placeholder="Add Responsibility"
        />
        <button onClick={handleAddResponsibility}>Add</button>
      </div>

      {/* Category and Questions Section */}
      <div>
        <label>Category and Questions:</label>
        {selectedCategories.map((category) => (
          <div key={category.categoryId}>
            <h4>{category.categoryName}</h4>
            <button onClick={() => handleRemoveCategory(category.categoryId)}>
              Delete Category
            </button>
            <ul>
              {category.questions.map((question, index) => (
                <li key={index}>
                  {question.questionText}
                  <button
                    onClick={() =>
                      handleRemoveQuestionFromCategory(
                        category.categoryId,
                        question.questionId
                      )
                    }
                  >
                    Delete Question
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <select
          value={questionCategory}
          onChange={(e) => {
            const categoryId = e.target.value;
            setQuestionCategory(categoryId);
            if (categoryId.trim()) {
              fetchQuestionsByCategory(categoryId);
            }
          }}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.category}
            </option>
          ))}
        </select>
        {questionCategory && (
          <div>
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
      </div>

      {/* Skills to Test */}
      <div>
        <label>Skills to Test:</label>
        {skillGroups.map((group, index) => (
          <div key={index}>
            <h4>{group.groupName}</h4>
            <button onClick={() => handleDeleteSkillGroup(index)}>
              Delete
            </button>
            <p>Criteria: {group.criteria}</p>
            <ul>
              {group.skills.map((skill, skillIndex) => (
                <li key={skillIndex}>
                  {skill}{" "}
                  <button onClick={() => handleDeleteSkill(index, skillIndex)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add Skill"
            />
            <button onClick={() => handleAddSkillToGroup(index)}>
              Add Skill
            </button>
          </div>
        ))}
        <input
          type="text"
          value={newSkillGroupName}
          onChange={(e) => setNewSkillGroupName(e.target.value)}
          placeholder="Add Skill Group"
        />
        <button onClick={handleAddSkillGroup}>Add Skill Group</button>
      </div>

      {/* Submit */}
      <button onClick={handleFormSubmit}>Submit</button>
    </div>
  );
};

export default UpdateOpening;

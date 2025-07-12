import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";

export default function Questions() {
  const [categories, setCategories] = useState([]);
  const [todos, setTodos] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedCategoryName, setSelectedCategoryName] = useState("All");
  const [editQuestionId, setEditQuestionId] = useState(null);

  const baseURL = "/api/questions";

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseURL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchQuestions("all");
  }, []);

  const fetchQuestions = async (categoryId) => {
    try {
      setTodos([]); // Reset todos to avoid showing stale data
      const url =
        categoryId === "all"
          ? `${baseURL}/categories/questions`
          : `${baseURL}/categories/${categoryId}/questions`;

      const response = await axios.get(url);
      console.log(response.data); // Debugging: Log the API response

      const getCategoryNameById = (id) => {
        const category = categories.find((cat) => cat._id === id);
        return category ? category.category : "Unknown";
      };

      if (categoryId === "all") {
        if (Array.isArray(response.data)) {
          const allQuestions = response.data.reduce((acc, category) => {
            if (category.questions) {
              const categoryQuestions = category.questions.map((question) => ({
                ...question,
                categoryName: category.category || "Unknown",
              }));
              return [...acc, ...categoryQuestions];
            }
            return acc;
          }, []);
          setTodos(allQuestions);
        } else {
          console.error("Unexpected response structure for 'all' categories.");
        }
      } else {
        if (Array.isArray(response.data)) {
          const categoryQuestions = response.data.map((question) => ({
            ...question,
            categoryName: getCategoryNameById(categoryId), // Fetch category name using helper function
          }));
          setTodos(categoryQuestions);
        } else {
          console.error(
            "Unexpected response structure for specific category:",
            response.data
          );
        }
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const response = await axios.post(`${baseURL}/categories`, {
          category: newCategory,
        });
        setCategories([...categories, response.data.category]);
        setNewCategory("");
        setShowCategoryModal(false);
      } catch (error) {
        console.error("Error adding category:", error);
      }
    }
  };

  const handleAddQuestion = async () => {
    if (newQuestion.trim() && selectedCategoryId) {
      try {
        const response = await axios.post(
          `${baseURL}/categories/${selectedCategoryId}/questions`,
          { text: newQuestion }
        );
        setTodos(response.data.category.questions);
        setNewQuestion("");
        setShowQuestionModal(false);
      } catch (error) {
        console.error("Error adding question:", error);
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${baseURL}/categories/${categoryId}`);
      setCategories(
        categories.filter((category) => category._id !== categoryId)
      );
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleEditQuestion = async () => {
    if (newQuestion.trim() && editQuestionId) {
      try {
        const response = await axios.put(
          `${baseURL}/categories/${selectedCategoryId}/questions/${editQuestionId}`,
          { text: newQuestion }
        );
        const updatedTodos = todos.map((todo) =>
          todo._id === editQuestionId ? { ...todo, text: newQuestion } : todo
        );
        setTodos(updatedTodos);
        setNewQuestion("");
        setShowQuestionModal(false);
        setEditQuestionId("");
      } catch (error) {
        console.error("Error editing question:", error);
      }
    }
  };

  const handleEdit = (question) => {
    setNewQuestion(question.text);
    setEditQuestionId(question._id);
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await axios.delete(
        `${baseURL}/categories/${selectedCategoryId}/questions/${questionId}`
      );
      setTodos(todos.filter((todo) => todo._id !== questionId));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleCategorySelection = (categoryId, categoryName) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName || "All");
    fetchQuestions(categoryId);
  };

  return (
    <>
      <Header />
      <div className="container mt-5">
        <h5 className="text-secondary mb-3">
          The Question Bank is where you can create and organize a collection of
          interview questions under specific topics.
        </h5>
        <div className="d-flex justify-content-between align-items-center mb-3 gap-1 flex-wrap">
          <h3>Question Bank</h3>
          <div>
            <button
              className="btn btn-success me-2"
              onClick={() => setShowCategoryModal(true)}
            >
              + Add Category
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowQuestionModal(true)}
            >
              + Add New Questions
            </button>
          </div>
        </div>

        <div className="mb-3 d-flex align-items-center flex-wrap gap-1 w-sm-75">
          <button
            className={`btn me-2 ${
              selectedCategoryId === "all"
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() => handleCategorySelection("all", "All")}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              className={`btn me-2 ${
                selectedCategoryId === category._id
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() =>
                handleCategorySelection(category._id, category.category)
              }
            >
              {category.category}
            </button>
          ))}

          <button
            className="btn btn-outline-danger ms-auto"
            onClick={() => handleDeleteCategory(selectedCategoryId)}
            disabled={selectedCategoryId === "all"}
          >
            Delete Category
          </button>
        </div>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Category</th>
              <th>Question</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo, index) => (
              <tr key={todo._id}>
                <td>{index + 1}</td>
                <td>{todo.categoryName || selectedCategoryName}</td>
                <td>{todo.text}</td>
                <td>
                  <button
                    className="btn btn-outline-info btn-sm me-2"
                    onClick={() => handleEdit(todo)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeleteQuestion(todo._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Category</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCategoryModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowCategoryModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleAddCategory}
                  >
                    Add Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question Modal */}
        {showQuestionModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editQuestionId ? "Edit Question" : "Add Question"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setEditQuestionId(null);
                      setNewQuestion("");
                      setShowQuestionModal(true);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter question"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowQuestionModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={
                      editQuestionId ? handleEditQuestion : handleAddQuestion
                    }
                  >
                    {editQuestionId ? "Update" : "Add"} Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

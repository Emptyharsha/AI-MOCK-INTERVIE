import Header from "./Header";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OpeningType() {
  const [selectedOption, setSelectedOption] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleDropdownChange = (e) => {
    setSelectedOption(e.target.value);
    setError(""); // Clear any error when an option is selected
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!selectedOption) {
      setError("Please select an option before submitting");
      return;
    }

    navigate("/job-opening", { state: { jobType: selectedOption } });
  };

  return (
    <>
      {/* Header without container padding */}
      <div className="px-0">
        <Header />
      </div>

      {/* Main content */}
      <div className="container-fluid">
        <div className="row justify-content-center mt-5">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body">
                <h2 className="card-title text-center mb-4">
                  Select an Opening Type
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="openingType" className="form-label">
                      Select the type of job opening
                    </label>

                    <select
                      id="openingType"
                      value={selectedOption}
                      onChange={handleDropdownChange}
                      className={`form-select ${error ? "is-invalid" : ""}`}
                    >
                      <option value="" disabled>
                        Choose...
                      </option>
                      <option value="technical">Technical</option>
                      <option value="non-technical">Non-Technical</option>
                    </select>

                    {error && <div className="invalid-feedback">{error}</div>}
                  </div>

                  <div className="d-grid gap-2 mt-4">
                    <button
                      type="submit"
                      className={`btn ${
                        selectedOption
                          ? "btn-primary"
                          : "btn-secondary disabled"
                      }`}
                      disabled={!selectedOption}
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

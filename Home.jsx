import React,{ useState, useEffect } from 'react';
import Header from './Header';
import Logo from "./interview.webp";
import Work from "./work.webp";
import { BarChart3, FileText, Trophy, X, Menu, User } from "lucide-react";
import "../css/Home.css";
import { Link } from "react-router-dom";

const LandingPage = () => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        setIsLoggedIn(!!token);
      }, []);


    const features = [
        {
            title: "Automated Screening",
            description:
                "Pre-screen candidates with customizable AI interviews that assess skills and cultural fit.",
            icon: <FileText />,
        },
        {
            title: "Reduce Bias",
            description:
                "Our AI algorithms are designed to minimize unconscious bias in the hiring process.",
            icon: <X />,
        },
        {
            title: "Save Time",
            description:
                "Reduce interview time by 70% with automated initial screening and assessment.",
            icon: <BarChart3 />,
        },
        {
            title: "Data-Driven Insights",
            description:
                "Get comprehensive analytics on candidate performance and comparison tools.",
            icon: <Trophy />,
        },
        {
            title: "Seamless Integration",
            description:
                "Easily integrate with your existing HR systems and ATS platforms.",
            icon: <Menu />,
        },
        {
            title: "Candidate Experience",
            description:
                "Provide a flexible, responsive interview experience candidates can complete anytime.",
            icon: <FileText />,
        },
    ];

    const testimonials = [
        {
            name: "SAI KUMAR REDDY",
            position: "",
            quote:
                "UInterview has reduced our time-to-hire by 40% and improved the quality of our hires. The AI-powered analysis gives us insights we never had before.",
            icon: <User />,
        },
        {
            name: "CHARAN",
            position: "",
            quote:
                "The platform is incredibly intuitive and the candidates love the flexibility. We've seen a 30% increase in candidate satisfaction since implementing UInterview.",
            icon: <User />,
        },
        {
            name: "KUMAR SAI",
            position: "",
            quote:
                "The platform is incredibly intuitive and the candidates love the flexibility. We've seen a 30% increase in candidate satisfaction since implementing UInterview.",
            icon: <User />,
        },
        {
            name: "VENU GOPAL",
            position: "",
            quote:
                "UInterview has transformed our hiring process. The bias reduction features have helped us build a more diverse team, and the time savings are substantial.",
            icon: <User />,
        },
        
    ];

    return (
        <div className="landing-page">
            <Header />

            {/* Hero Section */}
            <section id="home" className="py-5 text-center hero-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 d-flex align-items-center home">
                            <div>
                                <h1 className="mb-4 display-4 fw-bold">Revolutionize Your HR/Technical Interviews with AI</h1>
                                <p className="mb-4 lead">Streamline your hiring process, reduce bias, and find the perfect candidates faster with our AI-powered interview platform.</p>
                                <div className="gap-3 d-flex justify-content-center">
                                    <Link to={isLoggedIn ? "/admin" : "/signup"} className="auth-link">
                                        <button className="btn-primary btn-lg auth" style={{ color: "white" }}>
                                        {isLoggedIn ? "Go to Admin" : "Get Started"}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <img src={Logo} alt="AI Interview" className="rounded img-fluid" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-5">
                <div className="container">
                    <div className="mb-5 text-center">
                        <h2 className="fw-bold">Why Choose AInterview?</h2>
                        <p className="lead text-muted">Our AI-powered platform transforms your hiring process</p>
                    </div>
                    <div className="row g-4">
                        {features.map((feature, index) => (
                            <div className="col-md-6 col-lg-4" key={index}>
                                <div className="p-4 border-0 shadow-sm card h-100 feature-card">
                                    <div className="card-body">
                                        <div className="mb-3 d-flex align-items-center">
                                            <div className="p-3 bg-primary bg-opacity-10 rounded-circle me-3">
                                                {feature.icon}
                                            </div>
                                            <h4 className="mb-0 card-title">{feature.title}</h4>
                                        </div>
                                        <p className="card-text text-muted">{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-5 bg-light">
                <div className="container">
                    <div className="mb-5 text-center">
                        <h2 className="fw-bold">How It Works</h2>
                        <p className="lead text-muted">Simple steps to transform your hiring process</p>
                    </div>
                    <div className="row align-items-center">
                        <div className="mb-4 col-lg-6 mb-lg-0 ">
                            <img src={Work} alt="Platform interface" className="rounded shadow-lg img-fluid work" />
                        </div>
                        <div className="col-lg-6 position-relative">
                            {/* Vertical line connecting the steps */}
                            <div className="position-absolute h-100" style={{ width: '2px', backgroundColor: '#dee2e6', left: '34px', top: '0', zIndex: '1' }}></div>

                            <div className="mb-4 d-flex how-it-works-box position-relative">
                                <div className="p-3 text-white bg-primary rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', position: 'relative', zIndex: '2' }}>1</div>
                                <div>
                                    <h4>Create Interview Templates</h4>
                                    <p className="text-muted">Design custom interview templates with AI-powered questions tailored to each role.</p>
                                </div>
                            </div>

                            <div className="mb-4 d-flex how-it-works-box position-relative">
                                <div className="p-3 text-white bg-primary rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', position: 'relative', zIndex: '2' }}>2</div>
                                <div>
                                    <h4>Send to Candidates</h4>
                                    <p className="text-muted">Automatically send interview invitations to candidates with personalized links.</p>
                                </div>
                            </div>

                            <div className="mb-4 d-flex how-it-works-box position-relative">
                                <div className="p-3 text-white bg-primary rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', position: 'relative', zIndex: '2' }}>3</div>
                                <div>
                                    <h4>AI Analyzes Responses</h4>
                                    <p className="text-muted">Our AI analyzes responses for skills, competencies, and cultural alignment.</p>
                                </div>
                            </div>

                            <div className="d-flex how-it-works-box position-relative">
                                <div className="p-3 text-white bg-primary rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', position: 'relative', zIndex: '2' }}>4</div>
                                <div>
                                    <h4>Review Insights & Hire</h4>
                                    <p className="text-muted">Access comprehensive reports and make data-driven hiring decisions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Testimonials */}
            <section id="testimonials" className="py-5">
                <div className="container">
                    <div className="mb-5 text-center">
                        <h2 className="fw-bold">Trusted by HR Leaders</h2>
                        <p className="lead text-muted">See what our customers say about AIHire</p>
                    </div>
                    <div className="row">
                        {testimonials.map((testimonial, index) => (
                            <div className="mb-4 col-lg-4" key={index}>
                                <div className="border-0 shadow-sm card h-100 testimonial-card">
                                    <div className="p-4 card-body">
                                        <div className="mb-4 d-flex">
                                            <div className="p-3 bg-primary bg-opacity-10 rounded-circle me-3">
                                                {testimonial.icon}
                                            </div>
                                            <div className="ms-3">
                                                <h5 className="mb-1">{testimonial.name}</h5>
                                                <p className="mb-0 text-muted small">{testimonial.position}</p>
                                            </div>
                                        </div>
                                        <p className="mb-0">"{testimonial.quote}"</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-4 footer" >
                <div className="text-center">
                    <p className="mb-0 text-white textt">&copy; 2025 UInterview. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
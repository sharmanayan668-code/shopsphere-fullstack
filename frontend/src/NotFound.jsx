import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";
import notFoundImage from "./assets/not-found.svg";

function NotFound() {
  return (
    <div className="not-found">
      <img src={notFoundImage} alt="404 Page Not Found" />

      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>

      <Link to="/" className="home-btn">
        Go to Home
      </Link>
    </div>
  );
}

export default NotFound;
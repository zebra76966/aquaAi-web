import React from "react";
import { Link } from "react-router-dom";

import "./CommerceHub.css";


export default function CommerceShell({ title, subtitle, children, actions }) {
  return (
    <div className="commerce-root">
      <div className="commerce-shell">
        <div className="commerce-header">
          <div className="commerce-title-block">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="commerce-nav">
            <Link className="commerce-ghost-btn" to="/marketplace/listings/1">Listing</Link>
            <Link className="commerce-ghost-btn" to="/reservations">My Reservations</Link>
            <Link className="commerce-ghost-btn" to="/breeder/reservations">Breeder Ops</Link>
            <Link className="commerce-ghost-btn" to="/notifications">Notifications</Link>
            {actions}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

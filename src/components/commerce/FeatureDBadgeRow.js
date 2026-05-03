import React from "react";


export default function FeatureDBadgeRow({ badges = [], emptyLabel = "No Feature D badges yet." }) {
  if (!badges.length) {
    return <p className="commerce-muted">{emptyLabel}</p>;
  }

  return (
    <div className="commerce-badge-row">
      {badges.map((badge) => (
        <div className="commerce-badge-chip" key={badge.code}>
          <strong>{badge.name}</strong>
          <span>{badge.description}</span>
        </div>
      ))}
    </div>
  );
}

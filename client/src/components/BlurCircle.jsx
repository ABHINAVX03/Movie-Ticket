import React from "react";

const BlurCircle = ({
  top = "auto",
  left = "auto",
  right = "auto",
  bottom = "auto",
  size = "15rem", // customizable size
}) => {
  return (
    <div
      className="absolute -z-50 rounded-full bg-primary/30 blur-3xl"
      style={{
        top,
        left,
        right,
        bottom,
        height: size,
        width: size,
      }}
    />
  );
};

export default BlurCircle;

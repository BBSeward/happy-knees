"use client"; // Marking this component as a client component

import React, { useState } from "react";
import { TextInput, NumberInput, Textarea, Button, Group, CloseButton } from "@mantine/core";
import { MantineTheme } from "@mantine/core";

const inputStyles = {
  root: {
    position: "relative" as const,
    marginTop: "15px",
  },
  label: {
    position: "absolute" as const,
    top: "-10px",
    left: "10px",
    padding: "0 5px",
    background: "linear-gradient(180deg, transparent 0%, rgb(44, 46, 51) 90%)",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "0.9rem",
    zIndex: 1,
  },
  input: {
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "4px",
    padding: "8px 12px",
    fontSize: "1rem",
    backgroundColor: "rgb(44, 46, 51)",
    color: "rgba(255, 255, 255, 0.9)",
    "&:focus": {
      borderColor: "rgba(255, 255, 255, 0.5)",
      backgroundColor: "rgb(44, 46, 51)",
    },
    "&:hover": {
      backgroundColor: "rgb(44, 46, 51)",
    },
  },
} as const;

export default function CustomInputForm() {
  const [formData, setFormData] = useState({
    title: "",
    bike: "",
    frameSize: "",
    saddleHeight: "",
    stemLength: "",
    hoodsToSeatReach: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string | number,
    name?: string
  ) => {
    // Handle both direct events and Mantine's NumberInput value
    const value = typeof e === "object" ? e.target.value : e;
    const fieldName = typeof e === "object" ? e.target.name : name;

    // If it's a number value, ensure it's an integer
    const finalValue = typeof value === "number" ? Math.round(value) : value;

    if (fieldName) {
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: finalValue,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData); // For now, just log the form data
  };

  // Clear individual fields
  const clearField = (field: keyof typeof formData) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: "",
    }));
  };

  return (
    <div
      className="form-group"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "100%",
        maxWidth: "300px",
        margin: "5px 10px 10px 10px",
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <TextInput
          label="Fit Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          styles={{ ...inputStyles, root: { ...inputStyles.root, marginTop: "0px" } }}
        />

        <div
          style={{
            display: "flex",
            gap: "10px",
            width: "100%",
            justifyContent: "space-between", // Added this to push items to edges
          }}
        >
          <TextInput
            label="Bike"
            name="bike"
            value={formData.bike}
            onChange={handleChange}
            styles={inputStyles}
            style={{ flex: 1 }}
          />

          <NumberInput
            label="Frame Size"
            name="frameSize"
            value={formData.frameSize}
            onChange={(value) => handleChange(value, "frameSize")}
            rightSection={<div style={{ paddingRight: "10px" }}>cm</div>}
            hideControls
            allowDecimal={false}
            styles={{
              ...inputStyles,
              rightSection: {
                width: "40px",
                justifyContent: "flex-end",
              },
              input: {
                ...inputStyles.input,
                width: "120px",
                textAlign: "right",
                paddingRight: "45px",
              },
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <NumberInput
            label="Saddle Height"
            name="saddleHeight"
            value={formData.saddleHeight}
            onChange={(value) => handleChange(value, "saddleHeight")}
            rightSection={<div style={{ paddingRight: "10px" }}>mm</div>}
            hideControls
            allowDecimal={false}
            styles={{
              ...inputStyles,
              root: {
                ...inputStyles.root,
                width: "150px",
              },
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            width: "100%",
          }}
        >
          <NumberInput
            label="Stem Length"
            name="stemLength"
            value={formData.stemLength}
            onChange={(value) => handleChange(value, "stemLength")}
            rightSection={<div style={{ paddingRight: "10px" }}>mm</div>}
            hideControls
            allowDecimal={false}
            styles={inputStyles}
            style={{ flex: 1 }}
          />

          <NumberInput
            label="Hoods to Seat"
            name="hoodsToSeatReach"
            value={formData.hoodsToSeatReach}
            onChange={(value) => handleChange(value, "hoodsToSeatReach")}
            rightSection={<div style={{ paddingRight: "10px" }}>mm</div>}
            hideControls
            allowDecimal={false}
            styles={inputStyles}
            style={{ flex: 1 }}
          />
        </div>

        <Textarea
          label="Fit Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          autosize
          minRows={6}
          maxRows={10}
          styles={inputStyles}
        />

        <Group style={{ justifyContent: "center" }} mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </div>
  );
}

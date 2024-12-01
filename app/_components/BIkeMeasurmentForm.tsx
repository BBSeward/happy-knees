"use client"; // Marking this component as a client component

import React, { useState } from "react";
import { TextInput, NumberInput, Textarea, Button, Group, CloseButton } from "@mantine/core";

export default function CustomInputForm() {
  const [formData, setFormData] = useState({
    bike: "",
    frameSize: "",
    saddleHeight: "",
    stemLength: "",
    hoodsToSeatReach: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "100%",
        maxWidth: "300px",
        margin: "20px",
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Bike input (TextInput) without close button */}
        <TextInput
          label="Bike"
          name="bike"
          value={formData.bike}
          onChange={handleChange}
          placeholder="Enter bike name"
          autoComplete="off" // Disable autocomplete
        />

        {/* Frame Size input (NumberInput) with unit "cm" inside the input box and without close button */}
        <NumberInput
          label="Frame Size"
          name="frameSize"
          value={formData.frameSize}
          onChange={(value) => setFormData((prevData) => ({ ...prevData, frameSize: value }))}
          placeholder="Enter frame size"
          rightSection={<div style={{ paddingRight: "10px" }}>cm</div>} // Unit inside the input box
          autoComplete="off" // Disable autocomplete
        />

        {/* Saddle Height input (NumberInput) with unit "mm" inside the input box and without close button */}
        <NumberInput
          label="Saddle Height"
          name="saddleHeight"
          value={formData.saddleHeight}
          onChange={(value) => setFormData((prevData) => ({ ...prevData, saddleHeight: value }))}
          placeholder="Enter saddle height"
          rightSection={<div style={{ paddingRight: "10px" }}>mm</div>} // Unit inside the input box
          autoComplete="off" // Disable autocomplete
        />

        {/* Stem Length input (NumberInput) with unit "mm" inside the input box and without close button */}
        <NumberInput
          label="Stem Length"
          name="stemLength"
          value={formData.stemLength}
          onChange={(value) => setFormData((prevData) => ({ ...prevData, stemLength: value }))}
          placeholder="Enter stem length"
          rightSection={<div style={{ paddingRight: "10px" }}>mm</div>} // Unit inside the input box
          autoComplete="off" // Disable autocomplete
        />

        {/* Hoods to Seat Reach input (NumberInput) with unit "mm" inside the input box and without close button */}
        <NumberInput
          label="Hoods to Seat Reach"
          name="hoodsToSeatReach"
          value={formData.hoodsToSeatReach}
          onChange={(value) => setFormData((prevData) => ({ ...prevData, hoodsToSeatReach: value }))}
          placeholder="Enter hoods to seat reach"
          rightSection={<div style={{ paddingRight: "10px" }}>mm</div>} // Unit inside the input box
          autoComplete="off" // Disable autocomplete
        />

        {/* Notes input (Textarea) with close button */}
        <div style={{ position: "relative" }}>
          <Textarea
            label="Fit Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter fit notes"
            autosize
            minRows={4}
            autoComplete="off" // Disable autocomplete
            rightSection={
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  width: "100%",
                  height: "100%", // Make the container fill the full height
                  cursor: "pointer", // Make it look clickable
                }}
              >
                <CloseButton
                  size="lg" // Increase the size of the CloseButton
                  onClick={() => setFormData((prevData) => ({ ...prevData, notes: "" }))} // Clear the input when clicked
                />
              </div>
            }
          />
        </div>

        {/* Submit Button */}
        <Group style={{ justifyContent: "center" }} mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </div>
  );
}

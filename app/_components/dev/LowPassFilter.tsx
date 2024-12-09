/*
Here are the key updates with the equations written in plain text:

Time Interval (Δt) Calculation:

deltaT = (currentTimestamp - previousTimestamp) / 1000
(Assuming timestamps are in milliseconds; adju  st if using seconds or another unit.)

Alpha Calculation:

alpha = deltaT / (RC + deltaT)
Where:

RC = 1 / (2 * Math.PI * cutoffFrequency) (This represents the time constant for the low-pass filter.)

*/ 

type DataPoint = { value: number; timestamp: number };

class LowPassFilter {
  private alpha: number; // Smoothing factor
  private previousFilteredValue: number | null = null; // Store the previous filtered value
  private previousTimestamp: number | null = null; // Store the timestamp of the last data point

  constructor(private cutoffFrequency: number) {
    this.alpha = 0; // Initialize alpha, it will be dynamically updated
  }

  applyFilter(newDataPoint: DataPoint): number {
    if (this.previousFilteredValue === null || this.previousTimestamp === null) {
      // Initialize with the first value and timestamp
      this.previousFilteredValue = newDataPoint.value;
      this.previousTimestamp = newDataPoint.timestamp;
      return newDataPoint.value;
    }

    // Calculate the time interval (Δt) based on the current and previous timestamps
    const deltaT = (newDataPoint.timestamp - this.previousTimestamp) / 1000; // Convert ms to seconds

    // Dynamically calculate alpha
    const rc = 1 / (2 * Math.PI * this.cutoffFrequency); // Time constant RC
    this.alpha = deltaT / (rc + deltaT);

    // Apply the low-pass filter formula
    const filteredValue =
      this.alpha * newDataPoint.value +
      (1 - this.alpha) * this.previousFilteredValue;

    // Update stored values
    this.previousFilteredValue = filteredValue;
    this.previousTimestamp = newDataPoint.timestamp;

    return filteredValue;
  }
}

// Example Usage
const cutoffFrequency = 10; // 10 Hz cutoff

const filter = new LowPassFilter(cutoffFrequency);

const dataStream: DataPoint[] = [
  { value: 100, timestamp: 1000 },
  { value: 102, timestamp: 1030 }, // 30 ms later
  { value: 105, timestamp: 1065 }, // 35 ms later
  { value: 108, timestamp: 1100 }, // 35 ms later
];

dataStream.forEach((dataPoint) => {
  const filteredValue = filter.applyFilter(dataPoint);
  console.log(`Filtered Value: ${filteredValue}`);
});

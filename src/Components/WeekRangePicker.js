import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';

// Helper function to format the date in dd-mm-yyyy format
const formatDate = (date) => {
  const dd = date.getDate().toString().padStart(2, '0'); // Day with leading zero if needed
  const mm = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based, so add 1 and pad with zero
  const yyyy = date.getFullYear(); // Get the full year
  return `${dd}-${mm}-${yyyy}`; // Return the formatted date in dd-mm-yyyy format
};

// Function to generate week ranges starting from the given date
const generateWeekRanges = (startDate, numberOfWeeks) => {
  const weekRanges = [];

  // Adjust the start date to the most recent Monday
  const startDay = startDate.getDay();
  const daysToSubtract = startDay === 0 ? 6 : startDay - 1; // If Sunday (0), subtract 6, otherwise adjust to Monday
  const mondayStartDate = new Date(startDate);
  mondayStartDate.setDate(startDate.getDate() - daysToSubtract); // Set the date to the most recent Monday

  // Generate the week ranges
  for (let i = 0; i < numberOfWeeks; i++) {
    const start = new Date(mondayStartDate);
    start.setDate(mondayStartDate.getDate() + i * 7); // Each subsequent week starts exactly 7 days after the previous one
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // End is 6 days after the start (7-day week)

    // Store the start and end of each 7-day range in dd-mm-yyyy format
    weekRanges.push({
      start: formatDate(start),
      end: formatDate(end),
    });
  }

  return weekRanges;
};

const WeekRangePicker = ({ numberOfWeeks = 7, onWeekSelect }) => {
  const [startDate, setStartDate] = useState(new Date());  // Default start date is today
  const [weekRanges, setWeekRanges] = useState([]);       // Holds the generated weeks
  const [selectedWeek, setSelectedWeek] = useState('');    // Selected week range state

  // Generate week ranges when component mounts or when startDate or numberOfWeeks changes
  useEffect(() => {
    const ranges = generateWeekRanges(startDate, numberOfWeeks);
    setWeekRanges(ranges);

    // Set the default selected week if it's the first render
    if (!selectedWeek && ranges.length > 0) {
      const currentWeek = ranges[0]; // Default to the first week
      const weekRange = `${currentWeek.start} - ${currentWeek.end}`;
      setSelectedWeek(weekRange);
      onWeekSelect(weekRange); // Call the parent function with the first week's range
    }
  }, [startDate, numberOfWeeks]);  // Removed selectedWeek from dependencies

  const handleWeekChange = (event) => {
    const selectedRange = event.target.value;
    setSelectedWeek(selectedRange);  // Update the selected week
    onWeekSelect(selectedRange);     // Notify the parent component with the new selected week
  };

  return (
    <div className='week-range-picker'>
      {/* Week range selector dropdown */}
      <select onChange={handleWeekChange} value={selectedWeek}>
        {weekRanges.map((range) => (
          <option key={range.start} value={`${range.start} - ${range.end}`}>
            {range.start} - {range.end}
          </option>
        ))}
      </select>
    </div>
  );
};

export default WeekRangePicker;

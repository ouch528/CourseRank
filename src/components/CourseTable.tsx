import React from 'react';
import type { SelectedCourse } from '../types';
import type { CourseData } from '../data/courses';
import { AlertTriangle } from 'lucide-react';

interface CourseTableProps {
  selectedCourses: SelectedCourse[];
  courseData: CourseData[];
}

const formatRate = (rate: number | null | undefined): string => {
  if (rate === null || rate === undefined || Number.isNaN(rate)) return '-';
  if (rate === 0 || rate === Infinity || !isFinite(rate)) return '-';
  return rate.toFixed(2);
};

const getStatusDisplay = (tf: boolean | null | undefined, rate: number | null | undefined) => {
  // Handle cases where rate is not available or special values
  if (rate === null || rate === undefined || rate === 0 || rate === Infinity || !isFinite(rate)) {
    return { text: 'Full/Not Available', class: 'bg-red-100 text-red-800' };
  }
  
  // Rate is available, determine status based on rate value
  if (rate >= 1) {
    return { text: 'Oversubscribed', class: 'bg-red-100 text-red-800' };
  } else {
    return { text: 'Undersubscribed', class: 'bg-green-100 text-green-800' };
  }
};

const getFirstOversubscribedRound = (course: CourseData): number => {
  // Check each round in order
  const rounds = [0, 1, 2, 3];
  
  for (const round of rounds) {
    const rate = course[`rd${round}_rate` as keyof CourseData] as number;
    // Only consider valid numeric rates
    if (rate !== null && rate !== undefined && isFinite(rate) && rate >= 1) {
      return round;
    }
  }
  
  return 4; // Default if never oversubscribed
};

const getRateForRound = (course: CourseData, round: number): number => {
  const rate = course[`rd${round}_rate` as keyof CourseData] as number;
  return rate === null || rate === undefined || !isFinite(rate) ? Infinity : rate;
};

export function CourseTable({ selectedCourses, courseData }: CourseTableProps) {
  if (!Array.isArray(courseData) || !Array.isArray(selectedCourses)) {
    return (
      <div className="mt-8 p-4 flex items-center justify-center bg-yellow-50 rounded-lg border border-yellow-200">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
        <p className="text-yellow-700">Unable to load course data. Please try again later.</p>
      </div>
    );
  }

  const filteredCourses = selectedCourses
    .map(selected => {
      const courseInfo = courseData.find(
        c => c.courseCode.trim() === selected.courseCode.trim() && 
             c.courseClass.trim() === selected.classCode.trim()
      );

      if (!courseInfo) {
        console.log('No match found for:', selected.courseCode, selected.classCode);
        console.log('Available courses:', courseData.map(c => `${c.courseCode}-${c.courseClass}`));
        return null;
      }

      return {
        ...selected,
        ...courseInfo
      };
    })
    .filter((course): course is NonNullable<typeof course> => course !== null)
    .sort((a, b) => {
      // Get first oversubscribed round for both courses
      const aFirstOver = getFirstOversubscribedRound(a);
      const bFirstOver = getFirstOversubscribedRound(b);

      // First sort by first oversubscribed round (ascending)
      if (aFirstOver !== bFirstOver) {
        return aFirstOver - bFirstOver;
      }

      // Then sort by priority (descending)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      // Finally sort by the rate of the first oversubscribed round (descending)
      // Only compare rates if both courses become oversubscribed
      if (aFirstOver < 4 && bFirstOver < 4) {
        const aRate = getRateForRound(a, aFirstOver);
        const bRate = getRateForRound(b, bFirstOver);
        return bRate - aRate; // Descending order
      }

      // If we get here, either both courses never become oversubscribed
      // or we've exhausted all sorting criteria
      return a.courseCode.localeCompare(b.courseCode);
    });

  if (filteredCourses.length === 0) {
    return (
      <div className="mt-8 p-4 text-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No matching course data found. Please check if the course codes and class codes match exactly with the uploaded data.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Course Code</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Class</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Priority</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">1st Oversubscribed</th>
            <th scope="col" colSpan={2} className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Round 0</th>
            <th scope="col" colSpan={2} className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Round 1</th>
            <th scope="col" colSpan={2} className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Round 2</th>
            <th scope="col" colSpan={2} className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Round 3</th>
          </tr>
          <tr>
            <th scope="col"></th>
            <th scope="col"></th>
            <th scope="col"></th>
            <th scope="col"></th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Rate</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Rate</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Rate</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {filteredCourses.map((course) => {
            const firstOversubscribed = getFirstOversubscribedRound(course);
            return (
              <tr key={course.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{course.courseCode}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{course.classCode}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {course.priority}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    firstOversubscribed === 4 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {firstOversubscribed === 4 ? 'Never' : `Round ${firstOversubscribed}`}
                  </span>
                </td>
                {[0, 1, 2, 3].map(round => {
                  const rate = course[`rd${round}_rate` as keyof CourseData] as number;
                  const status = getStatusDisplay(
                    course[`rd${round}_TF` as keyof CourseData],
                    rate
                  );
                  return (
                    <React.Fragment key={round}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.class}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatRate(rate)}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
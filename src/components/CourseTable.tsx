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
  if (!isFinite(rate)) return '∞';
  return rate.toFixed(2);
};

const getStatusDisplay = (tf: boolean | null | undefined, rate: number | null | undefined) => {
  if (rate === null || rate === undefined || tf === null || tf === undefined) {
    return { text: 'Full/Not Available', class: 'bg-gray-100 text-gray-800' };
  }
  
  if (rate >= 1) {
    return { text: 'Oversubscribed', class: 'bg-red-100 text-red-800' };
  }
  
  if (rate < 1) {
    return { text: 'Undersubscribed', class: 'bg-green-100 text-green-800' };
  }
  
  return { text: 'Full/Not Available', class: 'bg-gray-100 text-gray-800' };
};

const hasRound0Data = (courses: (SelectedCourse & CourseData)[]): boolean => {
  return courses.some(course => 
    course.rd0_TF !== null && course.rd0_TF !== undefined &&
    course.rd0_rate !== null && course.rd0_rate !== undefined
  );
};

export const getFirstOversubscribedRound = (course: CourseData): number => {
  const rounds = [
    { tf: course.rd0_TF, rate: course.rd0_rate },
    { tf: course.rd1_TF, rate: course.rd1_rate },
    { tf: course.rd2_TF, rate: course.rd2_rate },
    { tf: course.rd3_TF, rate: course.rd3_rate }
  ];

  for (let i = 0; i < rounds.length; i++) {
    if (rounds[i].rate && rounds[i].rate >= 1) {
      return i;
    }
  }
  return 4;
};

export const sortCourses = (courses: (SelectedCourse & CourseData)[]) => {
  return [...courses].sort((a, b) => {
    // Sort by first oversubscribed round
    const aFirstOver = getFirstOversubscribedRound(a);
    const bFirstOver = getFirstOversubscribedRound(b);
    if (aFirstOver !== bFirstOver) {
      return aFirstOver - bFirstOver;
    }
    
    // Then by priority if oversubscribed round is the same
    return b.priority - a.priority;
  });
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

      return courseInfo ? {
        ...selected,
        ...courseInfo
      } : null;
    })
    .filter((course): course is NonNullable<typeof course> => course !== null);

  const sortedCourses = sortCourses(filteredCourses);

  if (sortedCourses.length === 0) {
    return (
      <div className="mt-8 p-4 text-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No matching course data found.</p>
      </div>
    );
  }

  const showRound0 = hasRound0Data(sortedCourses);
  const rounds = showRound0 ? [0, 1, 2, 3] : [1, 2, 3];

  return (
    <div className="mt-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Course Status Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Course Code</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Class</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Priority</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">First Oversubscribed</th>
                {rounds.map(round => (
                  <th key={round} scope="col" colSpan={2} className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                    Round {round}
                  </th>
                ))}
              </tr>
              <tr>
                <th scope="col"></th>
                <th scope="col"></th>
                <th scope="col"></th>
                <th scope="col"></th>
                {rounds.map(round => (
                  <React.Fragment key={round}>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Rate</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedCourses.map((course) => {
                const firstOver = getFirstOversubscribedRound(course);
                return (
                  <tr key={`${course.courseCode}-${course.classCode}`}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      {course.courseCode}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {course.classCode}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {course.priority}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        firstOver === 4 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {firstOver === 4 ? 'Never' : `Round ${firstOver}`}
                      </span>
                    </td>
                    {rounds.map(round => {
                      const tf = course[`rd${round}_TF` as keyof CourseData];
                      const rate = course[`rd${round}_rate` as keyof CourseData] as number | undefined;
                      const status = getStatusDisplay(tf, rate);
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
      </div>
    </div>
  );
}
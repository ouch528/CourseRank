import React from 'react';
import { type CourseData } from '../data/courses';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RankingDisplayProps {
  courseInfo: CourseData | null;
  priority: number;
}

export function RankingDisplay({ courseInfo, priority }: RankingDisplayProps) {
  if (!courseInfo) return null;

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {courseInfo.courseCode} ({courseInfo.courseClass})
        </h2>
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800">
          Priority: {priority}
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Round 0</h3>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">Status:</p>
            <p className="flex items-center text-lg font-medium">
              {courseInfo.rd0_TF ? (
                <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="mr-2 h-5 w-5 text-red-500" />
              )}
              {courseInfo.rd0_TF ? 'Available' : 'Not Available'}
            </p>
            <p className="text-sm text-gray-600">Rate:</p>
            <p className="text-lg font-medium">{courseInfo.rd0_rate.toFixed(2)}</p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Round 1</h3>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">Status:</p>
            <p className="flex items-center text-lg font-medium">
              {courseInfo.rd1_TF ? (
                <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="mr-2 h-5 w-5 text-red-500" />
              )}
              {courseInfo.rd1_TF ? 'Available' : 'Not Available'}
            </p>
            <p className="text-sm text-gray-600">Rate:</p>
            <p className="text-lg font-medium">{courseInfo.rd1_rate.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
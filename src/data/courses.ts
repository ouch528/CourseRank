import { parse } from 'papaparse';

export interface CourseData {
  courseCode: string;
  courseClass: string;
  rd0_TF: boolean;
  rd0_rate: number;
  rd1_TF: boolean;
  rd1_rate: number;
  rd2_TF: boolean;
  rd2_rate: number;
  rd3_TF: boolean;
  rd3_rate: number;
}

export let courseClassMap: { [key: string]: string[] } = {
  'ACC1701': ['LV1', 'LV2'],
  'ACC1701X': ['LX1', 'LX2'],
  'ACC2706': ['SA1'],
  'ACC2707': ['SA1', 'SA2'],
  'ACC2708': ['SA1'],
  'ACC2709': ['SA1', 'SA2', 'SA3'],
  'ACC3701': ['SA1', 'SA2'],
  'ACC3702': ['SA1', 'SA2']
};

export const updateCourseClassMap = (courseData: CourseData[]) => {
  const newMap: { [key: string]: Set<string> } = {};
  
  courseData.forEach(course => {
    if (!newMap[course.courseCode]) {
      newMap[course.courseCode] = new Set();
    }
    newMap[course.courseCode].add(course.courseClass);
  });
  
  courseClassMap = Object.fromEntries(
    Object.entries(newMap).map(([code, classes]) => [code, Array.from(classes).sort()])
  );
};

export const programmeCategories = [
  "UTown/USP courses",
  "Major core and Primary Major 1st Specialisation courses",
  "Primary Major courses",
  "Second Major Specialisation courses",
  "Faculty Requirement courses",
  "Second Major courses",
  "Restricted/Direct Minor courses",
  "Unrestricted Elective / General Education courses"
] as const;

export type ProgrammeCategory = typeof programmeCategories[number];

const processCSVData = (data: any[]): CourseData[] => {
  return data.map(row => ({
    courseCode: row.course_code,
    courseClass: row.course_class,
    rd0_TF: row.Rd0_TF === 'true',
    rd0_rate: row.Rd0_rate === 'inf' ? Infinity : Number(row.Rd0_rate),
    rd1_TF: row.Rd1_TF === 'true',
    rd1_rate: row.Rd1_rate === 'inf' ? Infinity : Number(row.Rd1_rate),
    rd2_TF: row.Rd2_TF === 'true',
    rd2_rate: row.Rd2_rate === 'inf' ? Infinity : Number(row.Rd2_rate),
    rd3_TF: row.Rd3_TF === 'true',
    rd3_rate: row.Rd3_rate === 'inf' ? Infinity : Number(row.Rd3_rate)
  }));
};

// Load and parse the CSV file
export const loadCourseData = async (): Promise<CourseData[]> => {
  try {
    const response = await fetch('/main.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const processedData = processCSVData(results.data);
          updateCourseClassMap(processedData);
          resolve(processedData);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
};

export let courseData: CourseData[] = [];

// Initialize course data
loadCourseData().then(data => {
  courseData = data;
});
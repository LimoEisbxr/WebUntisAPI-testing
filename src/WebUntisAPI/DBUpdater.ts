import { getAllTeachers } from './APIFunctions.js';

export function updateDB() {
    getAllTeachers();
    console.log('DB updated!');
}

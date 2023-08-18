const express = require('express');
const router = express.Router();
const attendanceController = require('../../controllers/Attendance/AttendanceController');
const middlewareController = require('../../controllers/Middleware/middlewareController');

/* get list user  */
router.get('/get-all-attendance', middlewareController.verifyToken, attendanceController.getAllAttendance);
router.get(
    '/get-attendance-panigation',
    middlewareController.verifyToken,
    attendanceController.getAllAttendancePanigation,
);

router.get(
    '/attendance-management/get-list-months',
    middlewareController.verifyToken,
    attendanceController.getDetailAttendanceByMonths,
);
router.get(
    '/attendance-management/get-list-years',
    middlewareController.verifyToken,
    attendanceController.getDetailAttendanceByYears,
);

router.post('/add-attendance', middlewareController.verifyToken, attendanceController.addAttendance);
router.get('/get-detail-attendance', middlewareController.verifyToken, attendanceController.getDetailAttendance);
router.put('/update-attendance', middlewareController.verifyToken, attendanceController.updateAttendance);
router.delete('/detele-attendance', middlewareController.verifyToken, attendanceController.deleteAtendance);

module.exports = router;

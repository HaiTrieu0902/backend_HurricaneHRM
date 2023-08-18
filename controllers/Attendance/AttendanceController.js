const { EmployeeModel, DepartmentModel, AttendanceModel } = require('../../models');
const moment = require('moment');
const PAGE_SIZE = 4;

const attendanceController = {
    getAllAttendance: async (req, res) => {},
    getAllAttendancePanigation: async (req, res) => {},

    getDetailAttendance: async (req, res) => {},

    getDetailAttendanceByMonths: async (req, res) => {},
    getDetailAttendanceByYears: async (req, res) => {},

    addAttendance: async (req, res) => {
        try {
            res.status(200).json({ message: 'hihi' });
            const date = moment(req.body.date, 'DD/MM/YYYY');
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    updateAttendance: async (req, res) => {},
    deleteAtendance: async (req, res) => {},
};
module.exports = attendanceController;

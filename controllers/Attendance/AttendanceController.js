const { EmployeeModel, DepartmentModel, AttendanceModel } = require('../../models');
const moment = require('moment');
const PAGE_SIZE = 4;

const getEmployee = async () => {
    const employees = await DepartmentModel.find({}, '-_id employee_id employee_name').lean();
    return new Map(employees.map((employee) => [employee.employee_id, employee.employee_name]));
};

const getDepartments = async () => {
    const departments = await DepartmentModel.find({}, '-_id department_id name').lean();
    return new Map(departments.map((department) => [department.department_id, department.name]));
};

const calculateHours = async (check_in, check_out, ot_start_time, ot_end_time) => {
    const checkInTime = moment(check_in, 'HH:mm');
    const checkOutTime = moment(check_out, 'HH:mm');
    const OTStart = moment(ot_start_time, 'HH:mm');
    const OTEnd = moment(ot_end_time, 'HH:mm');
    const workingHours =
        checkOutTime.diff(checkInTime, 'hours') + (checkOutTime.diff(checkInTime, 'minutes') % 60) / 60;

    const OTHours = OTEnd.diff(OTStart, 'hours') + (OTEnd.diff(OTStart, 'minutes') % 60) / 60;

    return OTHours > 0 ? workingHours + OTHours : workingHours;
};

const attendanceController = {
    getAllAttendance: async (req, res) => {},
    getAllAttendancePanigation: async (req, res) => {},

    getDetailAttendance: async (req, res) => {},

    getDetailAttendanceByMonths: async (req, res) => {},
    getDetailAttendanceByYears: async (req, res) => {},

    addAttendance: async (req, res) => {
        try {
            const date = moment(req.body.date, 'DD/MM/YYYY');
            const employeesMap = await getEmployee();
            const { check_in, check_out, ot_start_time, ot_end_time } = req.body;
            const working_hours = await calculateHours(check_in, check_out, ot_start_time, ot_end_time);

            const newAttendance = await new AttendanceModel({
                employee_id: req.body.employee_id,
                user_id: req.body.user_id,
                date: date,
                check_in: req.body.check_in,
                check_out: req.body.check_out,
                working_hours: working_hours,
                ot_start_time: req.body.ot_start_time,
                ot_end_time: req.body.ot_end_time,
                note: req.body.note,
                name_employee: employeesMap.get(req.body.employee_id),
                department_id: req.body.department_id,
            });

            const attendance = await newAttendance.save();
            const { _id, ...attendanceData } = attendance.toObject();
            res.status(200).json({
                status: 200,
                message: 'Create attendance Successfully',
                data: attendanceData,
            });
        } catch (error) {
            console.log('newAttendance', error);
            res.status(500).json({ error: error });
        }
    },

    updateAttendance: async (req, res) => {},
    deleteAtendance: async (req, res) => {},
};

module.exports = attendanceController;

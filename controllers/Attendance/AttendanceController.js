const { EmployeeModel, DepartmentModel, AttendanceModel } = require('../../models');
const moment = require('moment');
const PAGE_SIZE = 10;

const getEmployees = async () => {
    const employees = await EmployeeModel.find({}, '-_id employee_id employee_name').lean();
    console.log('📢 [AttendanceController.js:7]', employees);
    return new Map(employees.map((employee) => [employee.employee_id, employee.employee_name]));
};

const getDepartments = async () => {
    const departments = await DepartmentModel.find({}, '-_id department_id name').lean();
    console.log('📢 [AttendanceController.js:13]', departments);
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
    getAllAttendance: async (req, res) => {
        try {
            const totalAttendance = await AttendanceModel.countDocuments({});
            const totalPage = Math.ceil(totalAttendance / PAGE_SIZE);
            const data = await AttendanceModel.find({}, '-_id -__v'); // -_id

            /* get data employeedMap*/
            const employeeMap = await getEmployees();

            /* get data department*/
            const departmentMap = await getDepartments();

            const attendanceDataWithExtraFields = await Promise.all(
                data.map(async (attendance) => {
                    const { employee_id, department_id, ...attendanceData } = attendance.toObject();
                    const employee_name = employeeMap.get(employee_id) || 'Unknown';
                    console.log('employee_name', employee_name);
                    console.log('employee_id', employee_id);

                    const department_name = departmentMap.get(department_id) || 'Unknown';
                    console.log('department_name', department_name);
                    console.log('department_id', department_id);
                    return {
                        ...attendanceData,
                        employee_id,
                        department_id,
                        employee_name,
                        department_name,
                    };
                }),
            );

            res.status(200).json({
                status: 200,
                message: 'Get All Attendance successfully',
                data: attendanceDataWithExtraFields,
                totalPage: totalPage,
                per_page: PAGE_SIZE,
            });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getAllAttendancePanigation: async (req, res) => {
        try {
            const page = req.query?.page;
            const totalAttendance = await AttendanceModel.countDocuments({});
            const totalPage = Math.ceil(totalAttendance / PAGE_SIZE);

            /* get data employeedMap*/
            const employeeMap = await getEmployees();
            /* get data department*/
            const departmentMap = await getDepartments();

            if (page) {
                const skipAuth = (parseInt(page) - 1) * PAGE_SIZE;
                const data = await AttendanceModel.find({}, '-_id -__v').skip(skipAuth).limit(PAGE_SIZE);
                const attendanceDataWithExtraFields = await Promise.all(
                    data.map(async (attendance) => {
                        const { employee_id, department_id, ...attendanceData } = attendance.toObject();
                        const employee_name = employeeMap.get(employee_id) || 'Unknown';
                        const department_name = departmentMap.get(department_id) || 'Unknown';
                        return {
                            ...attendanceData,
                            employee_id,
                            department_id,
                            employee_name,
                            department_name,
                        };
                    }),
                );

                if (data?.length > 0) {
                    res.status(200).json({
                        page: parseInt(page),
                        message: `Get page ${page} attendance successfully`,
                        status: 200,
                        data: attendanceDataWithExtraFields,
                        total: data.length,
                        totalPage: totalPage,
                    });
                } else {
                    return res.status(401).json('Page not found values');
                }
            } else {
                return res.status(401).json('get failed data');
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getDetailAttendance: async (req, res) => {},

    getDetailAttendanceByMonths: async (req, res) => {},
    getDetailAttendanceByYears: async (req, res) => {},

    addAttendance: async (req, res) => {
        try {
            const date = moment(req.body.date, 'DD/MM/YYYY');
            const { check_in, check_out, ot_start_time, ot_end_time } = req.body;
            const working_hours = await calculateHours(check_in, check_out, ot_start_time, ot_end_time);
            const employee = await EmployeeModel.findOne({ employee_id: req.body.employee_id });
            if (!employee) {
                return res.status(401).json({ error: 'Not found employee_id, please try it again!' });
            }
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
                employee_name: employee?.employee_name,
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
    deleteAtendance: async (req, res) => {
        try {
            const attendanceId = req.query?.attendanceId;
            if (!attendanceId) {
                res.status(400).json({
                    message: 'Bad Request: Missing attendanceId in the query parameters',
                    status: 400,
                });
                return;
            }
            const data = await AttendanceModel.deleteOne({ attendance_id: attendanceId });
            if (data.deletedCount === 0) {
                res.status(404).json('Not found Attendance');
            } else {
                res.status(200).json(`Delete attendance ${attendanceId} successful`);
            }
        } catch (error) {
            res.status(500).json({ message: '`Delete attendance failed`', error: error });
        }
    },
};

module.exports = attendanceController;

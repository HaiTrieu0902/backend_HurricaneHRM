const mongoose = require('mongoose');
const AttendanceSchema = new mongoose.Schema(
    {
        attendance_id: {
            type: String,
            require: true,
        },
        employee_id: {
            type: String,
            require: true,
        },
        user_id: {
            type: String,
            require: true,
            minlength: 10,
            maxlength: 255,
        },
        date: {
            type: Date,
            require: true,
        },
        check_in: {
            type: String,
            require: true,
        },
        check_out: {
            type: String,
            require: true,
        },
        working_hours: {
            type: Number,
            require: true,
        },
        ot_start_time: {
            type: String,
            require: true,
        },
        ot_end_time: {
            type: String,
            require: true,
        },
        name_employee: {
            type: String,
            minlength: 6,
            maxlength: 255,
            require: true,
        },
        department_id: {
            type: Number,
            require: true,
        },
        note: {
            type: String,
            require: true,
        },
    },
    { timestamps: true },
);
const Attendance = mongoose.model('Attendance', AttendanceSchema);
module.exports = Attendance;

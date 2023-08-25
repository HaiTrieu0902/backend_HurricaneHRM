const mongoose = require('mongoose');
const AttendanceSchema = new mongoose.Schema(
    {
        attendance_id: {
            type: String,
            require: true,
            unique: true,
        },
        employee_id: {
            type: String,
            require: true,
        },
        user_id: {
            type: String,
            require: true,
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
            default: null,
        },
        ot_end_time: {
            type: String,
            default: null,
        },
        name_employee: {
            type: String,
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

AttendanceSchema.pre('save', function (next) {
    const attendance = this;
    if (!attendance.isNew) {
        // Chỉ thực hiện khi tạo mới người dùng, không thực hiện khi update
        return next();
    }
    Attendance.findOne({}, {}, { sort: { attendance_id: -1 } }, function (err, lastAttendace) {
        if (err) {
            return next(err);
        }

        let lastAttendanceId = 1000;
        if (lastAttendace) {
            lastAttendanceId = lastAttendace.attendance_id;
        }
        attendance.attendance_id = lastAttendanceId + 1;
        next();
    });
});

const Attendance = mongoose.model('Attendance', AttendanceSchema);
module.exports = Attendance;

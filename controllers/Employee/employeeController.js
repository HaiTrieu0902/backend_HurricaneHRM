const { EmployeeModel, DepartmentModel, MarriageModel } = require('../../models');
const PAGE_SIZE = 10;
const moment = require('moment');

const getMarriages = async () => {
    const marriages = await MarriageModel.find({}, '-_id marriage_id name').lean();
    return new Map(marriages.map((marriage) => [marriage.marriage_id, marriage.name]));
};

const getDepartments = async () => {
    const departments = await DepartmentModel.find({}, '-_id department_id name').lean();
    return new Map(departments.map((department) => [department.department_id, department.name]));
};

const employeeController = {
    /* Cách 1 : truy vấn từ cách bình thường */
    getAllEmployee: async (req, res) => {
        try {
            const totalEmployee = await EmployeeModel.countDocuments({});
            const totalPage = Math.ceil(totalEmployee / PAGE_SIZE);
            const employees = await EmployeeModel.find({}, '-_id -__v'); // -_id

            /* get data marriageMap*/
            const marriageMap = await getMarriages();
            /* get data department*/
            const departmentMap = await getDepartments();

            const employeeDataWithExtraFields = await Promise.all(
                employees.map(async (employee) => {
                    const { marriage_id, department_id, ...employeeData } = employee.toObject();
                    const marriage_name = marriageMap.get(marriage_id) || 'Unknown';
                    const department_name = departmentMap.get(department_id) || 'Unknown';
                    return {
                        ...employeeData,
                        marriage_id,
                        department_id,
                        marriage_name,
                        department_name,
                    };
                }),
            );

            res.status(200).json({
                status: 200,
                message: 'Get all employee successfully',
                data: employeeDataWithExtraFields,
                totalPage: totalPage,
                per_page: PAGE_SIZE,
            });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getAllEmployeePanigation: async (req, res) => {
        try {
            const page = req.query?.page;
            /* Tính tổng trang page */
            const totalEmployee = await EmployeeModel.countDocuments({});
            const totalPage = Math.ceil(totalEmployee / PAGE_SIZE);

            /* get data marriageMap*/
            const marriageMap = await getMarriages();
            /* get data department*/
            const departmentMap = await getDepartments();

            /* Render data panigation */
            if (page) {
                const skipAuth = (parseInt(page) - 1) * PAGE_SIZE;
                const data = await EmployeeModel.find({}, '-_id -__v').skip(skipAuth).limit(PAGE_SIZE);

                const employeeDataWithExtraFields = await Promise.all(
                    data.map(async (employee) => {
                        const { marriage_id, department_id, ...employeeData } = employee.toObject();
                        const marriage_name = marriageMap.get(marriage_id) || 'Unknown';
                        const department_name = departmentMap.get(department_id) || 'Unknown';
                        return {
                            ...employeeData,
                            marriage_id,
                            department_id,
                            marriage_name,
                            department_name,
                        };
                    }),
                );

                if (data?.length > 0) {
                    res.status(200).json({
                        page: parseInt(page),
                        message: `get list page ${page} pagination success`,
                        status: 200,
                        data: employeeDataWithExtraFields,
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

    getDetailEmployee: async (req, res) => {
        try {
            const idEmployee = req.params?.id;
            const data = await EmployeeModel.findOne({ employee_id: idEmployee }, '-_id -__v');
            if (data) {
                res.status(200).json({
                    message: 'Successfully',
                    status: 200,
                    data: data,
                });
            } else {
                res.status(401).json({
                    message: 'Not Found Employee',
                });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    addEmployee: async (req, res) => {
        try {
            const dateOfBirth = moment(req.body.date_of_birth, 'DD/MM/YYYY');
            const today = moment();
            const age = today.diff(dateOfBirth, 'years');

            if (age < 18) {
                return res.status(400).json({
                    error: 'Invalid date_of_birth',
                    message: 'The employee must be at least 18 years old.',
                });
            }

            const newEmployee = await new EmployeeModel({
                employee_name: req.body.employee_name,
                card_number: req.body.card_number,
                gender: req.body.gender,
                email: req.body.email,
                mother_name: req.body.mother_name,
                date_of_birth: req.body.date_of_birth,
                place_of_birth: req.body.place_of_birth,
                home_address: req.body.home_address,
                mobile_no: req.body.mobile_no,
                marriage_id: req.body.marriage_id,
                bank_account: req.body.bank_account,
                bank_name: req.body.bank_name,
                department_id: req.body.department_id,
                position: req.body.position,
                basic_salary: req.body.basic_salary,
                account_user_id: req.body.account_user_id,
                benefits: req.body.benefits,
                academic_level: req.body.academic_level,
            });
            const employee = await newEmployee.save();
            // Xóa trường _id của MongoDB khỏi đối tượng employee
            const { _id, ...employeeData } = employee.toObject();
            res.status(200).json({
                status: 200,
                message: 'Create employee Successfully',
                data: employeeData,
            });
        } catch (error) {
            res.status(500).json({ error: 'data duplication error', message: error?.keyValue });
        }
    },

    updateEmployees: async (req, res) => {
        try {
            const idEmployee = req.params?.id;
            if (!idEmployee) {
                res.status(400).json({
                    message: 'Bad Request: Missing idEmployee in the query parameters',
                    status: 400,
                });
                return;
            }
            const updatedData = {
                employee_name: req.body.employee_name,
                card_number: req.body.card_number,
                gender: req.body.gender,
                email: req.body.email,
                mother_name: req.body.mother_name,
                date_of_birth: req.body.date_of_birth,
                place_of_birth: req.body.place_of_birth,
                home_address: req.body.home_address,
                mobile_no: req.body.mobile_no,
                marriage_id: req.body.marriage_id,
                bank_account: req.body.bank_account,
                bank_name: req.body.bank_name,
                department_id: req.body.department_id,
                position: req.body.position,
                basic_salary: req.body.basic_salary,
                user_update_id: req.body.user_update_id,
                benefits: req.body.benefits,
                academic_level: req.body.academic_level,
            };

            const data = await EmployeeModel.findOneAndUpdate({ employee_id: idEmployee }, updatedData, {
                new: true,
            }).select('-_id -__v');
            if (data) {
                res.status(200).json({
                    message: `Update employee successfully`,
                    status: 200,
                    data: data,
                });
            } else {
                res.status(401).json({
                    message: 'Update employee failed',
                    status: 401,
                });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    /* Xóa một */
    deleteEmployees: async (req, res) => {
        try {
            const employeeId = req.query?.employeeId;
            if (!employeeId) {
                res.status(400).json({
                    message: 'Bad Request: Missing employeeId in the query parameters',
                    status: 400,
                });
                return;
            }
            const data = await EmployeeModel.deleteOne({ employee_id: employeeId });
            if (data.deletedCount === 0) {
                res.status(404).json('Not found employee');
            } else {
                res.status(200).json(`Delete employee successful`);
            }
        } catch (error) {
            res.status(500).json('Delete employee failed');
        }
    },

    /* Xóa nhiều */
    deleteEmployeeMultiple: async (req, res) => {
        try {
            const employeeIds = req.body?.employeeIds;
            if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
                res.status(400).json({
                    message: 'Bad Request: Missing or invalid employeeIds in the request body',
                    status: 400,
                });
                return;
            }

            const deletionResults = await EmployeeModel.deleteMany({ employee_id: { $in: employeeIds } });
            const deletedCount = deletionResults.deletedCount;

            if (deletedCount === 0) {
                res.status(404).json('No employees found');
            } else if (deletedCount === employeeIds.length) {
                res.status(200).json(`Successfully deleted all ${deletedCount} employees`);
            } else {
                res.status(200).json(`Successfully deleted ${deletedCount} employees`);
            }
        } catch (error) {
            res.status(500).json('Delete employees failed');
        }
    },
};

module.exports = employeeController;

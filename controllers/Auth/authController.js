const { UserModel } = require('../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const authController = {
    // Register
    register: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(saltRounds);
            const hashed = await bcrypt.hash(req.body.password, salt);
            /* Create new uSer*/
            if (req.body.username.length < 6) {
                return res.status(500).json({ error: 'User required min length >= 6 character' });
            }
            const newUser = await new UserModel({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
                role: req.body.role,
                department: req.body.department,
            });
            const user = await newUser.save();

            res.status(200).json({
                status: 200,
                message: 'User has registed successfully',
                data: {
                    username: user?.username,
                    email: user?.email,
                },
            });
        } catch (error) {
            res.status(500).json({ error: 'data duplication error', message: error?.keyValue });
        }
    },

    //Login
    login: async (req, res) => {
        try {
            const user = await UserModel.findOne({ username: req.body.username });
            if (!user) {
                return res.status(404).json('Not found username address');
            }

            const validatePassword = await bcrypt.compare(req.body.password, user?.password);
            if (!validatePassword) {
                return res.status(400).json('Password is wrong, try again!');
            }
            if (user && validatePassword) {
                /* token : Không chưa thời gian có hạn, nếu set thì token trở nên ngắn hạn phù hợp với (Ngân hàng,Giáo dục...) */
                const token = jwt.sign(
                    { id: user._id, username: user?.username, email: user?.email },
                    process.env.JWT_KEY_TOKEN,
                );

                /* create cookies: ngăn chặn tấn công  */
                res.cookie('access_token', token, {
                    httpOnly: true,
                    // secure: false,
                    path: '/',
                    sameSized: 'strict',
                });
                res.status(200).json({
                    status: 200,
                    message: 'Login successfully',
                    data: {
                        user_id: user?.user_id,
                        username: user?.username,
                        email: user?.email,
                        token: token,
                    },
                });
            }
        } catch (error) {
            res.status(500).json({ status: 500, message: 'Error: Username not exits' });
        }
    },

    /* Logout*/
    logout: async (req, res) => {
        try {
            res.clearCookie('access_token');
            res.status(200).json({ message: 'Logged out' });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    /* Change Password */
    changePassword: async (req, res) => {
        try {
            const user = await UserModel.findOne({ username: req.body.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const match = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!match) {
                return res.status(500).json({ error: 'Your current password is incorrect' });
            }

            if (req.body.newPassword !== req.body.confirmPassword) {
                return res.status(500).json({ error: 'New Password and Confirm Password do not match' });
            }

            const salt = await bcrypt.genSalt(saltRounds);
            const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

            await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });

            res.status(200).json({ message: 'Change Password Success' });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    /* Forgot-password  */
    forgotPassword: async (req, res) => {
        try {
            const user = await UserModel.findOne({ username: req.body.username });
            if (!user) {
                return res.status(404).json({ error: 'Not Foud User' });
            }
            
            if(req.body.newPassword === req.body.confirmPassword) {
                const salt = await bcrypt.genSalt(saltRounds);
                const hashedPassword = await bcrypt.hash(req.body.confirmPassword, salt);
                const updateResult = await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });
                if (updateResult) {
                    return res.status(200).json({ message: 'Change Password Success' });
                } else {
                    return res.status(401).json({ message: 'Change Password Failed' });
                }

            }else {
                return  res.status(500).json({ message: 'New Password and Confirm Password not match' });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

};

module.exports = authController;

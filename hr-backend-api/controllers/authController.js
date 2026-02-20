const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. หา User ใน Database
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = users[0];

        // 2. เช็ค Password (ใน Demo เราตั้งรหัสแบบ Plain Text ว่า 123456)
        // ถ้าใช้ bcrypt: const isMatch = await bcrypt.compare(password, user.password_hash);
        const isMatch = true; // สมมติว่าพาสเวิร์ดถูกเสมอไปก่อนเพื่อทดสอบ API
        // ถ้าอยากเช็คจริงๆ ใช้: const isMatch = (password === '123456');

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. หาข้อมูลบริษัทและสิทธิ์ (Role)
        const [roles] = await db.execute(`
            SELECT ucr.company_id, c.name_th, r.name as role_name 
            FROM user_company_roles ucr
            JOIN companies c ON ucr.company_id = c.id
            JOIN roles r ON ucr.role_id = r.id
            WHERE ucr.user_id = ?
        `, [user.id]);

        // 4. สร้าง Token
        const payload = {
            id: user.id,
            username: user.username,
            is_super_admin: user.is_super_admin
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'mysecretkey', { expiresIn: '1d' });

        // 5. ส่งผลลัพธ์กลับไปให้ Frontend
        res.json({
            message: "Login Success",
            token,
            user: {
                id: user.id,
                username: user.username,
                is_super_admin: user.is_super_admin
            },
            available_companies: roles 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
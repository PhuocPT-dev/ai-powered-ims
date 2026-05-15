import bcrypt from 'bcrypt';

// Số vòng trộn muối (Salt Rounds). Số càng to càng an toàn nhưng server mã hóa càng chậm. 
// 10 là mức cân bằng hoàn hảo cho doanh nghiệp.
const SALT_ROUNDS = 10;

export class PasswordUtil {
    //Hàm 1: Băm mật khẩu (Dùng khi người dùng đăng ký)
    static async hash(plainPassword: string): Promise<string> {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        return hashedPassword;
    }

    //Hàm 2 : So sánh mật khẩu (Dùng khi người dùng đăng nhập)
    static async compare(plainPassword: string, hashedPasswordInDB: string): Promise<boolean> {
        const isMatch = await bcrypt.compare(plainPassword, hashedPasswordInDB);
        return isMatch;
    }
}

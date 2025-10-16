import bcrypt from "bcrypt";

class HashingService {
  static async hash(value) {
    const saltRound = 10;
    return await bcrypt.hash(value, saltRound);
  }

  static async compare(value, hashedValue) {
    return await bcrypt.compare(value, hashedValue);
  }
}


export default HashingService;
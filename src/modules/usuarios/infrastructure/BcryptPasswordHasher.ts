import bcrypt from "bcryptjs";
import type { PasswordHasher } from "@/modules/usuarios/domain/PasswordHasher";

// Coste del hash. 12 es un equilibrio razonable entre seguridad y latencia para
// login/registro. bcryptjs es JS puro (sin binarios nativos): funciona igual en
// Windows, en el build de Vercel y en el runtime de Node.
const SALT_ROUNDS = 12;

export class BcryptPasswordHasher implements PasswordHasher {
  hash(passwordPlano: string): Promise<string> {
    return bcrypt.hash(passwordPlano, SALT_ROUNDS);
  }

  verificar(passwordPlano: string, hash: string): Promise<boolean> {
    return bcrypt.compare(passwordPlano, hash);
  }
}

// Contrato de hashing de contraseñas. La implementación concreta (bcrypt) vive en
// infraestructura; el dominio y la aplicación solo dependen de esta interfaz.
export interface PasswordHasher {
  hash(passwordPlano: string): Promise<string>;
  verificar(passwordPlano: string, hash: string): Promise<boolean>;
}

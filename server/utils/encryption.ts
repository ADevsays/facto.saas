import crypto from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'

function getSecretKey() {
  const secret = useRuntimeConfig().encryptionKey || 'default-secret-key-32-chars-long'
  return crypto.createHash('sha256').update(String(secret)).digest()
}

export function encryptProviderKey(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  
  // Formato: iv:datos_encriptados:authTag
  return `${iv.toString('hex')}:${encrypted}:${authTag}`
}

export function decryptProviderKey(encoded: string): string {
  if (!encoded) return ''
  
  const parts = encoded.split(':')
  if (parts.length === 3) {
    try {
      const [ivHex, encryptedHex, authTagHex] = parts
      const decipher = crypto.createDecipheriv(
        ALGORITHM,
        getSecretKey(),
        Buffer.from(ivHex, 'hex')
      )
      decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
      
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch (error) {
      console.error('[Decryption] Falló el descifrado AES, intentando fallback a Base64:', error)
      return Buffer.from(encoded, 'base64').toString('utf-8')
    }
  }
  
  // Fallback de retrocompatibilidad para llaves antiguas en Base64
  return Buffer.from(encoded, 'base64').toString('utf-8')
}

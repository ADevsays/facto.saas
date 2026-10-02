import { describe, it } from 'node:test'
import assert from 'node:assert'

interface MembershipRecord {
  id: string
  email: string
  active: boolean
  used: boolean
  whop_membership_id: string
}

class MockMembershipService {
  private store = new Map<string, MembershipRecord>()

  seed(token: string, record: MembershipRecord) {
    this.store.set(token, record)
  }

  async getSession(token?: string, email?: string) {
    if (!token && !email) {
      throw { statusCode: 400, message: 'Token or email is required' }
    }

    if (token) {
      const record = this.store.get(token)
      if (!record) {
        throw { statusCode: 404, message: 'No se encontró un pago activo para este token' }
      }
      if (record.used) {
        throw { statusCode: 409, message: '¡Este cupo ya fue configurado con éxito y tu anuncio se encuentra activo en Facto!' }
      }
      if (!record.active) {
        throw { statusCode: 404, message: 'La membresía no está activa' }
      }
      return { ok: true, membership: record }
    }

    if (email) {
      for (const record of this.store.values()) {
        if (record.email.toLowerCase() === email.toLowerCase() && record.active && !record.used) {
          return { ok: true, membership: record }
        }
      }
      throw { statusCode: 404, message: 'No active unused membership found for this email' }
    }

    throw { statusCode: 404, message: 'No active unused membership found' }
  }

  markUsed(token: string) {
    const record = this.store.get(token)
    if (record) {
      record.used = true
    }
  }
}

describe('Ads Session & Token Validation Lifecycle', () => {
  it('should validate active unused membership token with 200 OK', async () => {
    const service = new MockMembershipService()
    const validToken = 'token-active-123'
    service.seed(validToken, {
      id: validToken,
      email: 'sponsor@startup.io',
      active: true,
      used: false,
      whop_membership_id: 'mem_123'
    })

    const res = await service.getSession(validToken)
    assert.strictEqual(res.ok, true)
    assert.strictEqual(res.membership.email, 'sponsor@startup.io')
  })

  it('should throw HTTP 409 when token was already used', async () => {
    const service = new MockMembershipService()
    const usedToken = 'token-used-456'
    service.seed(usedToken, {
      id: usedToken,
      email: 'sponsor@startup.io',
      active: true,
      used: true,
      whop_membership_id: 'mem_456'
    })

    await assert.rejects(async () => {
      await service.getSession(usedToken)
    }, (err: any) => {
      return err.statusCode === 409 && err.message.includes('ya fue configurado')
    })
  })

  it('should throw HTTP 404 on invalid or non-existent token', async () => {
    const service = new MockMembershipService()
    await assert.rejects(async () => {
      await service.getSession('non-existent-token')
    }, (err: any) => {
      return err.statusCode === 404
    })
  })
})

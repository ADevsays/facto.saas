import { describe, it } from 'node:test'
import assert from 'node:assert'
import { AD_ANALYTICS_EVENTS } from '../const/analytics'

describe('Ad analytics events', () => {
  it('uses distinct events for the bid and auction modals', () => {
    assert.strictEqual(AD_ANALYTICS_EVENTS.bidModalOpened, 'ad_bid_modal_opened')
    assert.strictEqual(AD_ANALYTICS_EVENTS.auctionModalOpened, 'ad_auction_modal_opened')
    assert.notStrictEqual(AD_ANALYTICS_EVENTS.bidModalOpened, AD_ANALYTICS_EVENTS.auctionModalOpened)
  })
})

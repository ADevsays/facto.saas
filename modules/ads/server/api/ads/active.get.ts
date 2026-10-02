import { adsService } from '../../services/ads'

export default defineEventHandler(async () => {
  return await adsService.getActiveAds()
})

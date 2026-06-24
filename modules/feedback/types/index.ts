export interface FeedbackReport {
  id: string
  details: string
  image_url: string | null
  status: 'pending' | 'resolved'
  created_at: string
}

export interface FeedbackSubmission {
  details: string
  imageFile?: File
}

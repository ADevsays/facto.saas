export interface FaqItem {
  question: string
  answer: string
}

export const YOUTUBE_THUMBNAIL_FAQS: FaqItem[] = [
  {
    question: 'Where does this tool get the different thumbnail resolutions from?',
    answer: 'YouTube automatically stores multiple compressed versions of each thumbnail on its servers (public CDNs `img.youtube.com`). The MaxRes HD version (1280x720) corresponds to `maxresdefault.jpg`, SD (640x480) to `sddefault.jpg`, HQ (480x360) to `hqdefault.jpg`, MQ (320x180) to `mqdefault.jpg` and Default (120x90) to `default.jpg`. This tool queries and inspects these variants directly without watermarks.',
  },
  {
    question: 'Why is the MaxRes HD version sometimes unavailable or showing a gray image?',
    answer: 'YouTube generates the MaxRes version (1280x720) only when the creator uploaded the video in 720p resolution or higher and attached a custom thumbnail. If the video is old, low resolution, or does not have a custom thumbnail, the MaxRes version will not exist on the servers and the recommended options are SD or HQ.',
  },
  {
    question: 'Is it legal to download and get inspired by thumbnails from other channels?',
    answer: 'Yes. Getting thumbnails to analyze their composition, color palette, typography and contrast for research purposes or content strategy study is completely valid. However, you should not re-upload other authors\' thumbnails exactly as they are for your own videos.',
  },
  {
    question: 'What is the recommended resolution for YouTube thumbnails in 2026?',
    answer: 'The recommended resolution by YouTube is 1280 x 720 pixels with a minimum width of 640 pixels, always keeping the 16:9 aspect ratio and a file size under 2MB in JPG, PNG, or WEBP formats.',
  },
]

export const YOUTUBE_THUMBNAIL_ARTICLES = [
  {
    title: 'Thumbnail Strategy for Content-Creating Founders',
    highlightWord: 'Founders',
    content: `For a SaaS founder, YouTube is not an entertainment channel: it is an organic customer acquisition engine. The thumbnail accounts for up to 80% of a user's click decision.

Analyzing the high-resolution thumbnails of your competitors or industry leaders allows you to identify winning visual patterns: the use of faces with authentic emotions, aggressive contrasts in dark mode, and texts of maximum 3 to 4 words.

This tool allows you to directly extract the original files saved in the YouTube CDNs so you can study them, archive them, or use them in your design benchmarks.`,
  },
  {
    title: 'How YouTube Servers Store Thumbnails',
    highlightWord: 'Servers',
    content: `Every time a video is published on YouTube, the platform processes the selected thumbnail and generates 5 standardized copies on its CDN servers (img.youtube.com/vi/{ID}).

Each copy has a predefined codename: maxresdefault.jpg (1280x720), sddefault.jpg (640x480), hqdefault.jpg (480x360), mqdefault.jpg (320x180), and default.jpg (120x90).

Facto does not require a backend or intermediate storage: our composable detects the video ID and instantly accesses these public servers from your browser.`,
  }
]

export const FOUNDER_THUMBNAIL_TIPS = YOUTUBE_THUMBNAIL_ARTICLES.map(a => ({
  title: a.title,
  description: a.content
}))

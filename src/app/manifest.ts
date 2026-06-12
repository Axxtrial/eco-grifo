import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EcoGrifo',
    short_name: 'EcoGrifo',
    description: 'App de monitoreo inteligente de grifos domésticos',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#080710',
    theme_color: '#080710',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}

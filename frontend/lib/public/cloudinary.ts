const IMAGE_UPLOAD = "/image/upload/"
const VIDEO_UPLOAD = "/video/upload/"

export function cloudinaryImage(url: string, transforms: string): string {
  if (!url.includes(IMAGE_UPLOAD)) return url
  if (url.includes(`${IMAGE_UPLOAD}${transforms}/`)) return url
  return url.replace(IMAGE_UPLOAD, `${IMAGE_UPLOAD}${transforms}/`)
}

export function cloudinaryVideo(url: string, transforms: string): string {
  if (!url.includes(VIDEO_UPLOAD)) return url
  if (url.includes(`${VIDEO_UPLOAD}${transforms}/`)) return url
  return url.replace(VIDEO_UPLOAD, `${VIDEO_UPLOAD}${transforms}/`)
}

export const CLOUDINARY_TRANSFORMS = {
  productCard: "f_auto,q_auto,w_900,c_limit",
  og: "f_auto,q_auto,w_1200,h_630,c_fill",
  video: "q_auto,vc_auto,w_1280,c_limit",
} as const

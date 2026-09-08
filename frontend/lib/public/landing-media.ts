import {
  CLOUDINARY_TRANSFORMS,
  cloudinaryImage,
  cloudinaryVideo,
} from "@/lib/public/cloudinary"
import { PAGE_IMAGES } from "@/lib/public/page-images"

const HERO_BANNER_RAW =
  "https://res.cloudinary.com/dn2ycbmrc/image/upload/v1788002660/Pink_Hue_Minimalist_Simple_Futuristic_Crypto_NFT_Blockchain_Article_Blog_Banner_hanoin.png"
const ICBUCKET_RAW =
  "https://res.cloudinary.com/dn2ycbmrc/image/upload/v1788002708/test_c2owra.jpg"
const ICFALCON_RAW =
  "https://res.cloudinary.com/dn2ycbmrc/image/upload/v1788002696/tetet_dbsvek.jpg"
const ICBUCKET_VIDEO_RAW =
  "https://res.cloudinary.com/dn2ycbmrc/video/upload/v1788002750/Copy_of_Black_and_Blue_Simple_Countdown_Video_Collage_c09apn.mp4"

export const LANDING_MEDIA = {
  heroMockup: PAGE_IMAGES.landing.heroPhone,
  heroDesktop: PAGE_IMAGES.landing.heroDesktop,
  laptopMockup: PAGE_IMAGES.landing.laptopMockup,
  bucketMockup: PAGE_IMAGES.icbucket.heroPhone,
  paymentFlow: PAGE_IMAGES.landing.paymentFlow,
  heroBanner: cloudinaryImage(HERO_BANNER_RAW, CLOUDINARY_TRANSFORMS.productCard),
  icbucket: cloudinaryImage(ICBUCKET_RAW, CLOUDINARY_TRANSFORMS.productCard),
  icfalcon: cloudinaryImage(ICFALCON_RAW, CLOUDINARY_TRANSFORMS.productCard),
  icbucketIntegrateVideo: cloudinaryVideo(ICBUCKET_VIDEO_RAW, CLOUDINARY_TRANSFORMS.video),
  ogImage: cloudinaryImage(HERO_BANNER_RAW, CLOUDINARY_TRANSFORMS.og),
} as const

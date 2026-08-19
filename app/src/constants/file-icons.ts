export const fileIcons = {
  image: require('../../assets/Icons8/files/icons8-image-file-48.png'),
  heic: require('../../assets/Icons8/files/icons8-heic-48.png'),
  pdf: require('../../assets/Icons8/files/icons8-pdf-48.png'),
  sheet: require('../../assets/Icons8/files/icons8-xls-import-48.png'),
  document: require('../../assets/Icons8/files/icons8-document-48.png'),
  code: require('../../assets/Icons8/files/icons8-code-file-48.png'),
  archive: require('../../assets/Icons8/files/icons8-zip-48.png'),
  video: require('../../assets/Icons8/files/icons8-mov-48.png'),
  audio: require('../../assets/Icons8/files/icons8-ogg-48.png'),
  font: require('../../assets/Icons8/files/icons8-otf-48.png'),
  config: require('../../assets/Icons8/files/icons8-file-configuration-48.png'),
  copy: require('../../assets/Icons8/files/icons8-copy-48.png'),
  download: require('../../assets/Icons8/files/icons8-file-download-48.png'),
  delete: require('../../assets/Icons8/files/icons8-trash-can-48.png'),
  view: require('../../assets/Icons8/files/icons8-view-48.png'),
  addImage: require('../../assets/Icons8/files/icons8-image-file-add-48.png'),
} as const

export type FileIconName = keyof typeof fileIcons

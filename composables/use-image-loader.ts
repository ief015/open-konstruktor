
const images: Map<string, HTMLImageElement> = new Map();

export default function useImageLoader() {

  const findImage = (src: string): HTMLImageElement => {
    const image = images.get(src);
    if (image) {
      return image;
    }
    const newImage = new Image();
    newImage.src = src;
    images.set(src, newImage);
    return newImage;
  };

  return {
    findImage,
  };
}
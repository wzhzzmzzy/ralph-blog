export const checkMobile = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  return {
    isMobile,
    isDesktop: !isMobile
  }
}

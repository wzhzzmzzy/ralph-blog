export const useEnv = () => {
  const isMobile = /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return {
    isMobile,
    isDesktop: !isMobile
  }
}

export const playSuccessSound = () => {
  const audio = new Audio('/success.mp3');
  audio.play();
};

export const playFailureSound = () => {
  const audio = new Audio('/failure.mp3');
  audio.play();
};


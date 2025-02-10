const scrollToMessage = (
  id: string,
  behavior: "smooth" | "auto" = "smooth",
  block = "start" as ScrollLogicalPosition
) => {
  const replayTargetElem = document.getElementsByClassName(id!)[0];
  // const pinMessageContainer = document.querySelector("#pinMessagesContainer");

  replayTargetElem?.scrollIntoView({ block, behavior });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        scrollToElem();
        observer.unobserve(replayTargetElem);
      }
    });
  });

  const scrollToElem = () => {
    if (!replayTargetElem) return;

    replayTargetElem.classList.add("highLightedMessage");

    // if (0) {
    //     return; // for now
    //     // if the pin message container is available, we should scroll the message more to get the move the message from under the container.
    //     const msgPosition = checkElementPosition(replayTargetElem)
    //     const extraScrollAmount = pinMessageContainer.clientHeight * (msgPosition == 'bottom' ? 1 : -1)
    //     window.scrollBy({ top: extraScrollAmount })
    // }

    setTimeout(
      () => replayTargetElem.classList.remove("highLightedMessage"),
      1000
    );
  };

  observer.observe(replayTargetElem);
};

export default scrollToMessage;

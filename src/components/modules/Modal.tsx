"use client";
import {
  Modal as HeroUiModal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import useGlobalVariablesStore from "@/store/globalVariablesStore";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";

const Modal = () => {
  const { modalData, setter } = useGlobalVariablesStore((state) => state);

  const {
    title,
    isOpen,
    okText,
    bodyText,
    isChecked,
    cancelText,
    isCheckedText,
    onClose,
    onSubmit,
    resetModal,
  } = modalData;

  const toggleIsCheckedValue = () => {
    setter({
      modalData: {
        ...modalData,
        isChecked: !isChecked,
      },
    });
  };

  return (
    <HeroUiModal
      isOpen={isOpen}
      placement="center"
      classNames={{
        wrapper: "z-[99999]",
        backdrop: "z-[99999]",
      }}
      className="mx-5 md:mx-0 bg-[#232735] text-white"
      onClose={() => {
        resetModal!();
        onClose!();
      }}
    >
      <ModalContent>
        <>
          <ModalHeader>{title}</ModalHeader>

          <ModalBody>
            {bodyText}

            {Boolean(isCheckedText?.length) && (
              <Checkbox
                isSelected={isChecked}
                onValueChange={toggleIsCheckedValue}
                className="ch:text-white"
                classNames={{ label: "text-[15px]" }}
              >
                {isCheckedText}
              </Checkbox>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              className="text-[16px]"
              onPress={() => {
                resetModal!();
                onClose!();
              }}
            >
              {cancelText}
            </Button>

            <Button
              color="primary"
              variant="light"
              className="text-[16px]"
              onPress={() => {
                onSubmit();
                resetModal!();
              }}
            >
              {okText}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </HeroUiModal>
  );
};

export default Modal;

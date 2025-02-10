import useModalStore from "@/store/modalStore";

const openModal = (props: {
  title?: string;
  bodyText?: string;
  okText?: string;
  onSubmit?: () => void;
  onClose?: () => void;
}) => {
  const setter = useModalStore.getState().setter;

  setter((prev) => ({
    ...prev,
    isOpen: true,
    ...props,
  }));
};

export default openModal;

import useGlobalVariablesStore from "@/store/globalVariablesStore";

const openModal = (props: {
  title?: string;
  bodyText?: string;
  okText?: string;
  onSubmit?: () => void;
  onClose?: () => void;
}) => {
  const setter = useGlobalVariablesStore.getState().setter;

  setter((prev: any) => ({
    modalData: {
      ...prev.modalData,
      isOpen: true,
      ...props,
    },
  }));
};

export default openModal;

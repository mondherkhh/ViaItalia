import contractService from "../../../api/contractService";export const useContract = (userId) => {

const uploadContract = async (file) => {
  const formData = new FormData();
  formData.append("contract", file);

  return await contractService.uploadContract(formData);
};

  return {
    uploadContract
  };
};
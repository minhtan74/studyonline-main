import { useContext } from 'react';
import { ConfirmContext } from '../context/ConfirmContext.jsx';

// Hook lấy hàm confirm(message, options) thay cho window.confirm() — trả về Promise<boolean>
export function useConfirm() {
  return useContext(ConfirmContext);
}

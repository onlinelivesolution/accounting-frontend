// src/hooks/useAccountTypes.ts
import { useEffect, useState } from "react";
import axios from "axios";

export interface AccountType {
  accountTypeID: number;
  accountTypeName: string;
}

export const useAccountTypes = () => {
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/common/loadAccountTypeDropdown")
      .then((res) => setAccountTypes(res.data))
      .catch((err) => console.error("Failed to load Account Types", err))
      .finally(() => setLoading(false));
  }, []);

  return { accountTypes, loading };
};

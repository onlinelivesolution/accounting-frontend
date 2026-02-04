import { useEffect, useState } from "react";
import axios from "axios";

export const useControlItems = () => {
  const [controlItems, setControlItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchControlItems = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/reportingitems/loadControlItemDropdown");
        setControlItems(res.data);
      } catch (error) {
        console.error("Failed to load Control Items", error);
      } finally {
        setLoading(false);
      }
    };

    fetchControlItems();
  }, []);

  return { controlItems, loading };
};

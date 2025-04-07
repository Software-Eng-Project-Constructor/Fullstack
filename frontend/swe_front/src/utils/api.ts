import axios from "axios";

// Local JSON for now, replace with endpoint later
export const fetchData = async () => {
  const response = await axios.get('/json/data.json'); // This works locally for now
  return response.data;
};

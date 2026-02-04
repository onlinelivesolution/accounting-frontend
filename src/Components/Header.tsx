import axios from "axios";
import { useAuth } from "./securityContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const username = "admin";
    const password = "yourPassword"; // from input

    const response = await axios.post("http://localhost:8000/api/auth/login", {
      username,
      password,
    });

    const { token, user, permissions } = response.data;
    login(token, user, permissions);

    navigate("/dashboard"); // redirect after login
  };

  return (
    <form onSubmit={handleLogin}>
      <button type="submit">Login</button>
    </form>
  );
};

export default Header;

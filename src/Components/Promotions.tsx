import axios from "axios";
import { useAuth } from "./securityContext";
import { useNavigate } from "react-router-dom";

const Promotions = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    return (
        <div>Promotions will design later</div>
    );
};

export default Promotions;

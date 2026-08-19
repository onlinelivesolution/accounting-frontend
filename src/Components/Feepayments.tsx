import axios from "axios";
import { useAuth } from "./securityContext";
import { useNavigate } from "react-router-dom";

const Feepayments = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    return (
        <div>Feepayments will design later</div>
    );
};

export default Feepayments;
